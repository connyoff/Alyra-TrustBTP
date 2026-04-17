// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {DataTypes} from "./libraries/DataTypes.sol";
import {IYieldProvider} from "./interfaces/IYieldProvider.sol";
import {ITrustScoreRegistry} from "./interfaces/ITrustScoreRegistry.sol";
import {IChantierNFT} from "./interfaces/IChantierNFT.sol";

/// @title EscrowVault — Séquestre principal du protocole Trust BTP
///
/// @notice Gère l'intégralité du cycle de vie d'un chantier entre un particulier
///         et un artisan, avec paiements par jalons, yield DeFi optionnel,
///         système de réserves et résolution de litiges.
///
/// @dev Flux principal :
///   1. Artisan soumet un devis  → submitDevis()
///   2a. Particulier refuse       → rejectDevis()              [chantier clôturé]
///   2b. Particulier accepte      → acceptDevisWithPermit()    [NFT minté + 110% déposés, EIP-2612]
///   3. Pour chaque jalon :
///       - Artisan valide         → validateJalon()
///       - Particulier a 48h pour lever des réserves
///       - Sinon auto-validation  → triggerAutoValidation()
///       - Acceptation anticipée  → acceptJalon()
///       - Réserves mineures      → acceptJalonWithMinorReserves()
///       - Réserves majeures      → acceptJalonWithMajorReserves() [pause]
///   4. Clôture : buffer 10% retourné au particulier + mise à jour Trust Score
///
/// Token supporté : USDC uniquement
///
contract EscrowVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =========================================================================
    // État du protocole
    // =========================================================================

    // --- Adresses externes ---

    ITrustScoreRegistry public trustScoreRegistry;
    IYieldProvider public yieldProvider;
    IChantierNFT public chantierNFT;

    /// @notice Adresse autorisée à résoudre les litiges
    address public arbiter;

    /// @notice Trésorerie qui perçoit les frais et le yield
    address public treasury;

    /// @notice Tokens ERC-20 autorisés (USDC = true)
    mapping(address token => bool) public allowedTokens;

    // --- Stockage des chantiers ---

    uint256 private _nextChantierId;

    /// @notice Données d'un chantier par son identifiant
    mapping(uint256 => DataTypes.Chantier) public chantiers;

    /// @notice jalons[chantierId][index] → Jalon
    mapping(uint256 => mapping(uint8 => DataTypes.Jalon)) public jalons;

    /// @notice Frais plateforme accumulés par token (collectés de façon lazye)
    mapping(address token => uint256) public platformFees;

    /// @notice Principal total déposé dans le yield provider par token
    mapping(address token => uint256) public yieldPrincipal;

    // =========================================================================
    // Événements
    // =========================================================================

    // --- Cycle de vie du chantier ---
    event DevisSoumis(
        uint256 indexed chantierId,
        address indexed artisan,
        address indexed particulier,
        address token,
        uint256 devisAmount
    );
    event DevisAccepte(uint256 indexed chantierId, address indexed particulier, uint256 depositAmount, bool yieldOptIn);
    event DevisRefuse(uint256 indexed chantierId, address indexed particulier);
    event ChantierTermine(uint256 indexed chantierId);
    event ChantierAnnule(uint256 indexed chantierId);
    event ChantierEnPause(uint256 indexed chantierId, uint8 jalonIndex);
    event ChantierRepris(uint256 indexed chantierId, uint8 jalonIndex);

    // --- Jalons ---
    event JalonValide(uint256 indexed chantierId, uint8 jalonIndex, bytes32 proofHash);
    event JalonAccepte(uint256 indexed chantierId, uint8 jalonIndex, uint256 montantLibere);
    event JalonAutoValide(uint256 indexed chantierId, uint8 jalonIndex);
    event JalonAccepteAvecReserves(uint256 indexed chantierId, uint8 jalonIndex, bool majeur, bytes32 clientProofHash);
    event ReservesAccusees(uint256 indexed chantierId, uint8 jalonIndex, uint256 montantPaye);
    event ReservesLevees(uint256 indexed chantierId, uint8 jalonIndex, uint256 montantDebloque);

    // --- Litige ---
    event LitigeOuvert(uint256 indexed chantierId, uint8 jalonIndex);
    event LitigeResolu(
        uint256 indexed chantierId,
        uint8 jalonIndex,
        bool artisanEnTort,
        uint256 montantArtisan,
        uint256 remboursementParticulier,
        uint256 penalitePlateforme
    );

    // --- Admin ---
    event YieldProviderMisAJour(address indexed ancien, address indexed nouveau);
    event ArbiterMisAJour(address indexed ancien, address indexed nouveau);
    event FraisCollectes(address indexed token, uint256 montant);
    event YieldCollecte(address indexed token, uint256 montant);

    // =========================================================================
    // Erreurs personnalisées
    // =========================================================================

    error TokenNonAutorise(address token);
    error NombreJalonsInvalide(uint8 count);
    error SommeJalonsMismatch(uint256 somme, uint256 devis);
    error PasLeParticulier(uint256 chantierId);
    error PasLArtisan(uint256 chantierId);
    error PasLArbiter();
    error StatutChantierIncorrect(DataTypes.ChantierStatus attendu, DataTypes.ChantierStatus actuel);
    error StatutJalonIncorrect(DataTypes.JalonStatus attendu, DataTypes.JalonStatus actuel);
    error AutoValidationPasPrete(uint256 disponibleAt, uint256 maintenant);
    error AdresseZero();
    error BpsInvalide(uint256 bps);

    // =========================================================================
    // Modificateurs
    // =========================================================================

    modifier seulementParticulier(uint256 chantierId) {
        if (msg.sender != chantiers[chantierId].particulier) revert PasLeParticulier(chantierId);
        _;
    }

    modifier seulementArtisan(uint256 chantierId) {
        if (msg.sender != chantiers[chantierId].artisan) revert PasLArtisan(chantierId);
        _;
    }

    modifier seulementArbiter() {
        if (msg.sender != arbiter) revert PasLArbiter();
        _;
    }

    modifier enStatut(uint256 chantierId, DataTypes.ChantierStatus attendu) {
        DataTypes.ChantierStatus actuel = chantiers[chantierId].status;
        if (actuel != attendu) revert StatutChantierIncorrect(attendu, actuel);
        _;
    }

    // =========================================================================
    // Constructeur
    // =========================================================================

    /// @param _owner              Propriétaire de la plateforme (multisig)
    /// @param _treasury           Adresse de la trésorerie (frais + yield)
    /// @param _arbiter            Arbitre des litiges
    /// @param _trustScoreRegistry Contrat TrustScoreRegistry déployé
    /// @param _chantierNFT        Contrat ChantierNFT déployé
    constructor(
        address _owner,
        address _treasury,
        address _arbiter,
        address _trustScoreRegistry,
        address _chantierNFT
    ) Ownable(_owner) {
        if (_treasury == address(0) || _arbiter == address(0) || _trustScoreRegistry == address(0) || _chantierNFT == address(0)) {
            revert AdresseZero();
        }
        treasury = _treasury;
        arbiter = _arbiter;
        trustScoreRegistry = ITrustScoreRegistry(_trustScoreRegistry);
        chantierNFT = IChantierNFT(_chantierNFT);
    }

    // =========================================================================
    // Administration
    // =========================================================================

    /// @notice Autorise ou retire un token ERC-20 (USDC)
    function setAllowedToken(address token, bool autorise) external onlyOwner {
        if (token == address(0)) revert AdresseZero();
        allowedTokens[token] = autorise;
    }

    /// @notice Met à jour le provider de yield (ex: migration Aave → Morpho)
    function setYieldProvider(address nouveau) external onlyOwner {
        address ancien = address(yieldProvider);
        yieldProvider = IYieldProvider(nouveau);
        emit YieldProviderMisAJour(ancien, nouveau);
    }

    /// @notice Change l'arbitre des litiges
    function setArbiter(address nouvelArbiter) external onlyOwner {
        if (nouvelArbiter == address(0)) revert AdresseZero();
        address ancien = arbiter;
        arbiter = nouvelArbiter;
        emit ArbiterMisAJour(ancien, nouvelArbiter);
    }

    /// @notice Collecte les frais plateforme accumulés vers la trésorerie
    function collecterFrais(address token) external onlyOwner nonReentrant {
        uint256 montant = platformFees[token];
        require(montant > 0, "EscrowVault: aucun frais");
        platformFees[token] = 0;
        IERC20(token).safeTransfer(treasury, montant);
        emit FraisCollectes(token, montant);
    }

    /// @notice Collecte le yield généré par le provider DeFi
    function collecterYield(address token) external onlyOwner nonReentrant {
        require(address(yieldProvider) != address(0), "EscrowVault: pas de yield provider");
        uint256 yield = yieldProvider.pendingYield(token, yieldPrincipal[token]);
        require(yield > 0, "EscrowVault: pas de yield");
        yieldProvider.withdraw(token, yield, treasury);
        emit YieldCollecte(token, yield);
    }

    // =========================================================================
    // 1. Artisan — soumission du devis
    // =========================================================================

    /// @notice L'artisan soumet un devis à un particulier.
    ///         Le devis est figé dès la soumission (immuable).
    ///
    /// @param particulier        Adresse du client
    /// @param token              Token de paiement (USDC)
    /// @param devisAmount        Montant total du devis (= somme des jalons)
    /// @param name               Nom libre du chantier
    /// @param jalonDescriptions  Description de chaque jalon (max 5)
    /// @param jalonAmounts       Montant de chaque jalon
    /// @param jalonDeadlines     Date de fin prévue de chaque jalon (timestamp Unix, informatif)
    /// @return chantierId        Identifiant unique du chantier créé
    function submitDevis(
        address particulier,
        address token,
        uint256 devisAmount,
        string calldata name,
        string[] calldata jalonDescriptions,
        uint256[] calldata jalonAmounts,
        uint256[] calldata jalonDeadlines
    ) external returns (uint256 chantierId) {
        // Validations
        if (!allowedTokens[token]) revert TokenNonAutorise(token);
        if (particulier == address(0)) revert AdresseZero();

        uint8 count = uint8(jalonDescriptions.length);
        if (count == 0 || count > DataTypes.MAX_JALONS || jalonAmounts.length != count || jalonDeadlines.length != count) {
            revert NombreJalonsInvalide(count);
        }

        // Vérifie que la somme des jalons = devis
        uint256 somme = 0;
        for (uint8 i = 0; i < count; i++) {
            somme += jalonAmounts[i];
        }
        if (somme != devisAmount) revert SommeJalonsMismatch(somme, devisAmount);

        // Création du chantier en attente de signature
        chantierId = _nextChantierId++;

        chantiers[chantierId] = DataTypes.Chantier({
            id: chantierId,
            name: name,
            artisan: msg.sender,
            particulier: particulier,
            token: token,
            devisAmount: devisAmount,
            depositAmount: 0, // sera renseigné à l'acceptation
            yieldOptIn: false, // sera renseigné à l'acceptation
            status: DataTypes.ChantierStatus.DevisSubmitted,
            currentJalonIndex: 0,
            jalonCount: count,
            submittedAt: block.timestamp,
            acceptedAt: 0,
            completedAt: 0,
            bufferForfeited: false
        });

        // Stockage immuable des jalons
        for (uint8 i = 0; i < count; i++) {
            jalons[chantierId][i] = DataTypes.Jalon({
                description: jalonDescriptions[i],
                amount: jalonAmounts[i],
                status: DataTypes.JalonStatus.Pending,
                finishedAt: 0,
                artisanProofHash: bytes32(0),
                clientProofHash: bytes32(0),
                blockedAmount: 0,
                penaltyAmount: 0,
                deadline: jalonDeadlines[i]
            });
        }

        emit DevisSoumis(chantierId, msg.sender, particulier, token, devisAmount);
    }

    // =========================================================================
    // 2a. Particulier — refus du devis
    // =========================================================================

    /// @notice Le particulier refuse le devis. Le chantier est définitivement clôturé.
    ///         Aucun fonds n'est transféré (aucun dépôt n'a encore eu lieu).
    ///         L'artisan devra créer un nouveau chantier pour soumettre un nouveau devis.
    function rejectDevis(uint256 chantierId)
        external
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.DevisSubmitted)
    {
        chantiers[chantierId].status = DataTypes.ChantierStatus.DevisRejected;
        emit DevisRefuse(chantierId, msg.sender);
    }

    // =========================================================================
    // 2b. Particulier — acceptation du devis + dépôt des fonds
    // =========================================================================

    /// @notice Le particulier signe le devis ET dépose 110% du montant en une transaction.
    ///         Deux NFT soulbound sont mintés (un pour chaque partie).
    ///
    /// @dev Prérequis ERC-20 : le particulier doit avoir approuvé ce contrat
    ///      pour au moins 110% du devisAmount AVANT d'appeler cette fonction.
    /// @notice Le particulier accepte le devis, signe le permit EIP-2612 off-chain et
    ///         dépose 110% du montant en une seule transaction (pas d'approbation préalable).
    ///
    ///         Le permit est consommé par IERC20Permit.permit() avant le transfert.
    ///         En cas d'allowance déjà suffisante (ex: replay), permit() peut réussir
    ///         ou être ignoré — le safeTransferFrom en fin de fonction garantit le prélèvement.
    ///
    /// @param chantierId  Identifiant du chantier
    /// @param yieldOptIn  true = les fonds déposés génèrent du yield DeFi (Aave V3)
    /// @param deadline    Timestamp Unix d'expiration de la signature (ex: block.timestamp + 20 min)
    /// @param v           Composante v de la signature EIP-2612
    /// @param r           Composante r de la signature EIP-2612
    /// @param s           Composante s de la signature EIP-2612
    function acceptDevisWithPermit(
        uint256 chantierId,
        bool yieldOptIn,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.DevisSubmitted)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];

        // Calcul du dépôt à 110%
        uint256 depositAmount = (c.devisAmount * DataTypes.DEPOSIT_RATIO_BPS) / DataTypes.BPS_DENOMINATOR;

        // Mise à jour de l'état AVANT tout transfert (checks-effects-interactions)
        c.depositAmount = depositAmount;
        c.yieldOptIn = yieldOptIn;
        c.status = DataTypes.ChantierStatus.Active;
        c.acceptedAt = block.timestamp;

        // Consommation du permit EIP-2612 — autorise le vault à prélever depositAmount
        // Si l'allowance est déjà suffisante, le permit peut réussir ou échouer
        // silencieusement via try/catch ; le safeTransferFrom ci-dessous est la vraie garde.
        try IERC20Permit(c.token).permit(msg.sender, address(this), depositAmount, deadline, v, r, s) {}
        catch {}

        // Prélèvement des fonds depuis le particulier
        IERC20(c.token).safeTransferFrom(msg.sender, address(this), depositAmount);

        // Optionnel : dépôt dans le yield provider (Aave V3)
        if (yieldOptIn && address(yieldProvider) != address(0)) {
            IERC20(c.token).safeTransfer(address(yieldProvider), depositAmount);
            yieldProvider.deposit(c.token, depositAmount);
            yieldPrincipal[c.token] += depositAmount;
        }

        // Mint du NFT chantier (1 seul, détenu par le vault) — données immuables
        _mintNFT(chantierId);

        emit DevisAccepte(chantierId, msg.sender, depositAmount, yieldOptIn);
    }

    // =========================================================================
    // 3. Artisan — validation d'un jalon
    // =========================================================================

    /// @notice L'artisan déclare un jalon terminé et soumet sa preuve.
    ///         Le particulier dispose ensuite de 48h pour lever des réserves.
    ///         Sans réaction, le jalon est validé automatiquement.
    ///
    /// @param chantierId  Identifiant du chantier
    /// @param proofHash   Hash keccak256 ou CID IPFS de la preuve artisan
    function validateJalon(uint256 chantierId, bytes32 proofHash)
        external
        nonReentrant
        seulementArtisan(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.Pending) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.Pending, j.status);
        }

        j.status = DataTypes.JalonStatus.Finished;
        j.finishedAt = block.timestamp;
        j.artisanProofHash = proofHash;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.Finished);

        emit JalonValide(chantierId, idx, proofHash);
    }

    // =========================================================================
    // 4a. Particulier — validation anticipée (avant 48h)
    // =========================================================================

    /// @notice Le particulier valide explicitement le jalon sans réserve.
    ///         Libère 98% du montant à l'artisan (2% = frais plateforme).
    function acceptJalon(uint256 chantierId)
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.Finished) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.Finished, j.status);
        }

        j.status = DataTypes.JalonStatus.Accepted;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.Accepted);

        uint256 libere = _libererJalon(chantierId, idx, j.amount);
        _avancerOuTerminer(chantierId);

        emit JalonAccepte(chantierId, idx, libere);
    }

    // =========================================================================
    // 4b. Auto-validation après 48h
    // =========================================================================

    /// @notice Déclenche la validation automatique d'un jalon si 48h se sont
    ///         écoulées sans réaction du particulier. Appelable par n'importe qui.
    function triggerAutoValidation(uint256 chantierId) external nonReentrant {
        DataTypes.Chantier storage c = chantiers[chantierId];
        if (c.status != DataTypes.ChantierStatus.Active) {
            revert StatutChantierIncorrect(DataTypes.ChantierStatus.Active, c.status);
        }

        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.Finished) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.Finished, j.status);
        }

        uint256 disponibleAt = j.finishedAt + DataTypes.AUTO_VALIDATE_DELAY;
        if (block.timestamp < disponibleAt) {
            revert AutoValidationPasPrete(disponibleAt, block.timestamp);
        }

        j.status = DataTypes.JalonStatus.Accepted;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.Accepted);
        uint256 libere = _libererJalon(chantierId, idx, j.amount);
        _avancerOuTerminer(chantierId);

        emit JalonAutoValide(chantierId, idx);
        emit JalonAccepte(chantierId, idx, libere);
    }

    // =========================================================================
    // 4c. Réserves mineures
    // =========================================================================

    /// @notice Le particulier accepte avec des réserves MINEURES.
    ///         10% du jalon est bloqué + 3% de pénalité prélevé sur l'artisan.
    ///         L'artisan doit ensuite accuser réception (acknowledgeReserves).
    function acceptJalonWithMinorReserves(uint256 chantierId, bytes32 clientProofHash)
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.Finished) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.Finished, j.status);
        }

        uint256 bloque = (j.amount * DataTypes.MINOR_RESERVE_BLOCK_BPS) / DataTypes.BPS_DENOMINATOR;
        uint256 penalite = (j.amount * DataTypes.MINOR_RESERVE_PENALTY_BPS) / DataTypes.BPS_DENOMINATOR;

        j.status = DataTypes.JalonStatus.AcceptedWithReserves;
        j.clientProofHash = clientProofHash;
        j.blockedAmount = bloque;
        j.penaltyAmount = penalite;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.AcceptedWithReserves);

        // La pénalité est versée immédiatement à la plateforme
        platformFees[c.token] += penalite;
        if (c.yieldOptIn) yieldPrincipal[c.token] -= penalite;

        emit JalonAccepteAvecReserves(chantierId, idx, false, clientProofHash);
    }

    // =========================================================================
    // 4d. Réserves majeures → pause
    // =========================================================================

    /// @notice Le particulier accepte avec des réserves MAJEURES.
    ///         Le chantier est suspendu : aucun paiement jusqu'à résolution.
    function acceptJalonWithMajorReserves(uint256 chantierId, bytes32 clientProofHash)
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.Finished) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.Finished, j.status);
        }

        // Le jalon entier est bloqué jusqu'à résolution
        j.status = DataTypes.JalonStatus.AcceptedWithReserves;
        j.clientProofHash = clientProofHash;
        j.blockedAmount = j.amount;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.AcceptedWithReserves);

        c.status = DataTypes.ChantierStatus.Paused;

        emit JalonAccepteAvecReserves(chantierId, idx, true, clientProofHash);
        emit ChantierEnPause(chantierId, idx);
    }

    // =========================================================================
    // 5. Artisan — accusé de réception des réserves mineures
    // =========================================================================

    /// @notice L'artisan accuse réception des réserves mineures.
    ///   - accept = true  → accepte les déductions, reçoit un paiement partiel
    ///   - accept = false → refuse, ouvre un litige
    function acknowledgeReserves(uint256 chantierId, bool accept)
        external
        nonReentrant
        seulementArtisan(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.AcceptedWithReserves) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.AcceptedWithReserves, j.status);
        }

        if (accept) {
            // Paiement partiel : jalon - part bloquée - pénalité
            uint256 aPayer = j.amount - j.blockedAmount - j.penaltyAmount;
            j.status = DataTypes.JalonStatus.PaidWithReserves;
            _syncNFT(chantierId, idx, DataTypes.JalonStatus.PaidWithReserves);
            _transferDepuisSequestre(c.token, c.artisan, aPayer, c.yieldOptIn);
            if (c.yieldOptIn) yieldPrincipal[c.token] -= aPayer;
            emit ReservesAccusees(chantierId, idx, aPayer);
            // Le jalon reste en PaidWithReserves — attend la levée des réserves
        } else {
            // Refus → litige
            j.status = DataTypes.JalonStatus.InLitige;
            _syncNFT(chantierId, idx, DataTypes.JalonStatus.InLitige);
            c.status = DataTypes.ChantierStatus.InLitige;
            trustScoreRegistry.freezeScore(c.artisan, chantierId);
            emit LitigeOuvert(chantierId, idx);
        }
    }

    // =========================================================================
    // 6. Particulier — levée des réserves
    // =========================================================================

    /// @notice Le particulier confirme que l'artisan a corrigé les points de réserve.
    ///         La part bloquée est libérée à l'artisan et on passe au jalon suivant.
    function lifterReserves(uint256 chantierId)
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        if (j.status != DataTypes.JalonStatus.PaidWithReserves) {
            revert StatutJalonIncorrect(DataTypes.JalonStatus.PaidWithReserves, j.status);
        }

        uint256 debloque = j.blockedAmount;
        j.status = DataTypes.JalonStatus.ReservesLifted;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.ReservesLifted);
        j.blockedAmount = 0;

        _transferDepuisSequestre(c.token, c.artisan, debloque, c.yieldOptIn);
        if (c.yieldOptIn) yieldPrincipal[c.token] -= debloque;
        _avancerOuTerminer(chantierId);

        emit ReservesLevees(chantierId, idx, debloque);
    }

    // =========================================================================
    // 7. Arbitre — résolution de litige
    // =========================================================================

    /// @notice L'arbitre tranche le litige et définit la répartition des fonds.
    ///
    /// @dev Deux cas distincts selon la responsabilité :
    ///
    ///   Artisan en tort :
    ///     - Calcul effectué sur le montant brut du jalon (j.amount), sans tenir
    ///       compte du blockedAmount établi lors des réserves mineures.
    ///     - platformFees est d'abord corrigé du crédit de 3% anticipé lors de
    ///       acceptJalonWithMinorReserves (Option A).
    ///     - Particulier reçoit : j.amount − retenue − pénalité.
    ///     - Plateforme conserve : retenue + pénalité.
    ///
    ///   Particulier en tort :
    ///     - Le crédit anticipé de 3% est annulé (même correction platformFees).
    ///     - Artisan reçoit le jalon net de 2% de frais via _libererJalon.
    ///     - Le buffer intégral (10% du devis) est versé à la plateforme.
    ///     - c.bufferForfeited est mis à true pour bloquer le retour du buffer
    ///       à la clôture du chantier.
    ///
    /// @param chantierId    Chantier en statut InLitige
    /// @param artisanEnTort true = artisan responsable, false = particulier
    /// @param blockedBps    BPS du montant jalon conservé par la plateforme (0–10000, artisan en tort seulement)
    /// @param penaltyBps    Ignoré si particulier en tort — sans effet (0–5000, artisan en tort seulement)
    function resolveLitige(uint256 chantierId, bool artisanEnTort, uint256 blockedBps, uint256 penaltyBps)
        external
        nonReentrant
        seulementArbiter
        enStatut(chantierId, DataTypes.ChantierStatus.InLitige)
    {
        if (blockedBps > DataTypes.BPS_DENOMINATOR) revert BpsInvalide(blockedBps);
        if (penaltyBps > 5_000) revert BpsInvalide(penaltyBps);

        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 idx = c.currentJalonIndex;
        DataTypes.Jalon storage j = jalons[chantierId][idx];

        // Annuler le crédit de 3% établi lors de acceptJalonWithMinorReserves.
        // Ce crédit anticipe une pénalité sur l'artisan qui doit être recalculée
        // proprement dans les deux branches ci-dessous.
        platformFees[c.token] -= j.penaltyAmount;

        uint256 montantArtisan;
        uint256 remboursementParticulier;
        uint256 penalitePlateforme;

        if (artisanEnTort) {
            // ── Cas 1 : artisan responsable ──────────────────────────────────
            // Calcul depuis j.amount entier (j.blockedAmount ignoré).
            uint256 retenue  = (j.amount * blockedBps)  / DataTypes.BPS_DENOMINATOR;
            uint256 penalite = (j.amount * penaltyBps)  / DataTypes.BPS_DENOMINATOR;
            remboursementParticulier = j.amount - retenue - penalite;
            penalitePlateforme       = retenue + penalite;

            _transferDepuisSequestre(c.token, c.particulier, remboursementParticulier, c.yieldOptIn);
            platformFees[c.token] += penalitePlateforme;

            // yieldPrincipal : décrémenter du montant total du jalon
            // (cohérent avec _libererJalon qui décrément du brut, frais inclus)
            if (c.yieldOptIn) yieldPrincipal[c.token] -= j.amount;

        } else {
            // ── Cas 2 : particulier responsable ─────────────────────────────
            // Artisan reçoit le jalon net de 2% de frais plateforme.
            // _libererJalon gère : platformFees += 2%, transfert 98%, yieldPrincipal -= j.amount
            _libererJalon(chantierId, idx, j.amount);
            montantArtisan     = (j.amount * (DataTypes.BPS_DENOMINATOR - DataTypes.PLATFORM_FEE_BPS))
                                   / DataTypes.BPS_DENOMINATOR;
            penalitePlateforme = (j.amount * DataTypes.PLATFORM_FEE_BPS) / DataTypes.BPS_DENOMINATOR;

            // Le buffer intégral (10% du devis) est conservé par la plateforme.
            uint256 buffer = c.depositAmount - c.devisAmount;
            platformFees[c.token] += buffer;
            penalitePlateforme     += buffer;

            // Le buffer est toujours en yield si yieldOptIn — le décrémenter
            // pour que la comptabilité yieldPrincipal reste cohérente.
            if (c.yieldOptIn) yieldPrincipal[c.token] -= buffer;

            // Bloquer le retour du buffer à la clôture du chantier.
            c.bufferForfeited = true;
        }

        // Réinitialiser les champs de réserves du jalon (état propre)
        j.blockedAmount = 0;
        j.penaltyAmount = 0;

        j.status = DataTypes.JalonStatus.Accepted;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.Accepted);
        c.status = DataTypes.ChantierStatus.Active;

        trustScoreRegistry.unfreezeScore(c.artisan, chantierId);
        trustScoreRegistry.updateScore(c.artisan, chantierId, c.jalonCount, 0, true, 0, false);

        _avancerOuTerminer(chantierId);

        emit LitigeResolu(chantierId, idx, artisanEnTort, montantArtisan, remboursementParticulier, penalitePlateforme);
    }

    // =========================================================================
    // 8. Reprise après réserves majeures
    // =========================================================================

    /// @notice Le particulier ou l'arbitre reprend le chantier suspendu.
    ///         Le jalon est remis à Pending pour que l'artisan puisse resoumettre.
    function resumeChantier(uint256 chantierId)
        external
        enStatut(chantierId, DataTypes.ChantierStatus.Paused)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];
        require(msg.sender == c.particulier || msg.sender == arbiter, "EscrowVault: non autorise");

        uint8 idx = c.currentJalonIndex;
        jalons[chantierId][idx].status = DataTypes.JalonStatus.Pending;
        jalons[chantierId][idx].blockedAmount = 0;
        _syncNFT(chantierId, idx, DataTypes.JalonStatus.Pending);
        c.status = DataTypes.ChantierStatus.Active;

        emit ChantierRepris(chantierId, idx);
    }

    // =========================================================================
    // 9. Annulation par le particulier (avant le 1er jalon)
    // =========================================================================

    /// @notice Le particulier annule le chantier avant que l'artisan ait démarré
    ///         le premier jalon. L'artisan reçoit le montant du 1er jalon en
    ///         compensation. Le particulier récupère le solde restant.
    ///
    /// @dev Conditions : statut Active + jalon 0 en Pending (non démarré)
    function cancelChantier(uint256 chantierId)
        external
        nonReentrant
        seulementParticulier(chantierId)
        enStatut(chantierId, DataTypes.ChantierStatus.Active)
    {
        DataTypes.Chantier storage c = chantiers[chantierId];

        // Uniquement si aucun jalon n'a démarré
        require(
            c.currentJalonIndex == 0 && jalons[chantierId][0].status == DataTypes.JalonStatus.Pending,
            "EscrowVault: jalon deja demarre"
        );

        c.status = DataTypes.ChantierStatus.Cancelled;

        // L'artisan reçoit le montant du 1er jalon (compensation)
        uint256 premierJalon = jalons[chantierId][0].amount;
        // Le particulier récupère le reste
        uint256 remboursement = c.depositAmount - premierJalon;

        // Si yield opt-in, on retire d'abord les fonds du provider
        if (c.yieldOptIn && address(yieldProvider) != address(0)) {
            yieldProvider.withdraw(c.token, c.depositAmount, address(this));
            yieldPrincipal[c.token] -= c.depositAmount;
        }

        IERC20(c.token).safeTransfer(c.artisan, premierJalon);
        IERC20(c.token).safeTransfer(c.particulier, remboursement);

        emit ChantierAnnule(chantierId);
    }

    // =========================================================================
    // Fonctions de lecture
    // =========================================================================

    /// @notice Retourne le jalon en cours d'un chantier
    function getCurrentJalon(uint256 chantierId) external view returns (DataTypes.Jalon memory) {
        return jalons[chantierId][chantiers[chantierId].currentJalonIndex];
    }

    /// @notice Retourne un jalon spécifique
    function getJalon(uint256 chantierId, uint8 jalonIndex) external view returns (DataTypes.Jalon memory) {
        return jalons[chantierId][jalonIndex];
    }

    /// @notice Retourne tous les jalons d'un chantier
    function getAllJalons(uint256 chantierId) external view returns (DataTypes.Jalon[] memory) {
        DataTypes.Chantier storage c = chantiers[chantierId];
        DataTypes.Jalon[] memory result = new DataTypes.Jalon[](c.jalonCount);
        for (uint8 i = 0; i < c.jalonCount; i++) {
            result[i] = jalons[chantierId][i];
        }
        return result;
    }

    // =========================================================================
    // Fonctions internes
    // =========================================================================

    /// @dev Libère le montant brut d'un jalon : prélève 2% de frais, transfère 98% à l'artisan
    function _libererJalon(uint256 chantierId, uint8 idx, uint256 montantBrut) internal returns (uint256) {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint256 frais = (montantBrut * DataTypes.PLATFORM_FEE_BPS) / DataTypes.BPS_DENOMINATOR;
        uint256 net = montantBrut - frais;

        platformFees[c.token] += frais;
        _transferDepuisSequestre(c.token, c.artisan, net, c.yieldOptIn);
        
        if (c.yieldOptIn) yieldPrincipal[c.token] -= montantBrut;

        idx; // silence warning
        return montantBrut;
    }

    /// @dev Transfère des fonds depuis le séquestre (vault ou yield provider) vers un destinataire
    function _transferDepuisSequestre(address token, address destinataire, uint256 montant, bool depuisYield) internal {
        if (montant == 0) return;
        if (depuisYield && address(yieldProvider) != address(0)) {
            yieldProvider.withdraw(token, montant, destinataire);
        } else {
            IERC20(token).safeTransfer(destinataire, montant);
        }
    }

    /// @dev Passe au jalon suivant ou clôture le chantier si tous les jalons sont validés
    function _avancerOuTerminer(uint256 chantierId) internal {
        DataTypes.Chantier storage c = chantiers[chantierId];
        uint8 prochain = c.currentJalonIndex + 1;

        if (prochain >= c.jalonCount) {
            // Tous les jalons terminés
            c.status = DataTypes.ChantierStatus.Completed;
            c.completedAt = block.timestamp;

            // Le buffer 10% est retourné au particulier sauf si celui-ci était
            // en tort lors d'un litige (bufferForfeited = true) — dans ce cas
            // le buffer a déjà été versé à la plateforme dans resolveLitige.
            if (!c.bufferForfeited) {
                uint256 buffer = c.depositAmount - c.devisAmount;
                if (buffer > 0) {
                    _transferDepuisSequestre(c.token, c.particulier, buffer, c.yieldOptIn);
                    if (c.yieldOptIn) yieldPrincipal[c.token] -= buffer;
                }
            }

            _mettreAJourTrustScore(chantierId);
            emit ChantierTermine(chantierId);
        } else {
            c.currentJalonIndex = prochain;
        }
    }

    /// @dev Calcule les métriques et appelle le registre de réputation
    function _mettreAJourTrustScore(uint256 chantierId) internal {
        DataTypes.Chantier storage c = chantiers[chantierId];

        uint8 aTemps = 0;
        uint8 preuves = 0;
        bool aEuLitige = false;

        for (uint8 i = 0; i < c.jalonCount; i++) {
            DataTypes.Jalon storage j = jalons[chantierId][i];
            if (j.artisanProofHash != bytes32(0)) preuves++;
            if (j.status == DataTypes.JalonStatus.InLitige) aEuLitige = true;

            // Heuristique : jalon livré dans le délai prévu (7 jours par jalon)
            if (j.finishedAt > 0 && (j.finishedAt - c.acceptedAt) < 7 days * (i + 1)) {
                aTemps++;
            }
        }

        bool livraisonATemps = c.completedAt > 0 && (c.completedAt - c.acceptedAt) < 7 days * c.jalonCount;

        trustScoreRegistry.updateScore(c.artisan, chantierId, c.jalonCount, aTemps, aEuLitige, preuves, livraisonATemps);
    }

    /// @dev Minte le NFT unique du chantier (tokenId = chantierId) vers le vault
    function _mintNFT(uint256 chantierId) internal {
        DataTypes.Chantier storage c = chantiers[chantierId];

        string[] memory descriptions = new string[](c.jalonCount);
        uint256[] memory montants = new uint256[](c.jalonCount);
        for (uint8 i = 0; i < c.jalonCount; i++) {
            descriptions[i] = jalons[chantierId][i].description;
            montants[i] = jalons[chantierId][i].amount;
        }

        chantierNFT.mintChantier(
            chantierId,
            c.name,
            c.artisan,
            c.particulier,
            c.token,
            c.devisAmount,
            c.depositAmount,
            descriptions,
            montants,
            c.submittedAt,
            c.acceptedAt
        );
    }

    /// @dev Synchronise le statut d'un jalon dans le NFT.
    ///      Appel silencieux si le contrat NFT n'est pas configuré.
    function _syncNFT(uint256 chantierId, uint8 jalonIndex, DataTypes.JalonStatus status) internal {
        if (address(chantierNFT) != address(0)) {
            chantierNFT.updateJalonStatus(chantierId, jalonIndex, status);
        }
    }
}
