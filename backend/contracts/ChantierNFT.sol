// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IChantierNFT} from "./interfaces/IChantierNFT.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/// @title ChantierNFT — NFT soulbound Trust BTP (dual-mint)
///
/// @notice À chaque chantier correspondent DEUX NFT soulbound :
///           - un pour le particulier  (tokenId = chantierId)
///           - un pour l'artisan       (tokenId = ARTISAN_TOKEN_OFFSET + chantierId)
///
///         Les deux NFT affichent la même donnée de devis via tokenURI.
///         Chaque partie voit son NFT dans son wallet (Rabby, MetaMask, OpenSea)
///         mais aucun transfert n'est autorisé tant que le chantier est en cours
///         ni après : le NFT est soulbound à vie — preuve infalsifiable du contrat.
///
///         Données immuables : artisan, particulier, token, devisAmount,
///                             descriptions et montants des jalons, timestamps.
///         Données mutables  : statut de chaque jalon (mis à jour par le vault).
contract ChantierNFT is IChantierNFT, ERC721, Ownable {
    using Strings for uint256;

    // -------------------------------------------------------------------------
    // Constantes — séparation des espaces d'ID
    // -------------------------------------------------------------------------

    /// @notice Offset appliqué aux tokenIds de l'artisan.
    ///         Les tokenIds < ARTISAN_TOKEN_OFFSET sont ceux du particulier.
    ///         Les tokenIds >= ARTISAN_TOKEN_OFFSET sont ceux de l'artisan.
    uint256 public constant ARTISAN_TOKEN_OFFSET = 1 << 128;

    // -------------------------------------------------------------------------
    // État
    // -------------------------------------------------------------------------

    /// @dev Données immuables du devis par chantierId
    mapping(uint256 => DevisData) private _devisData;

    /// @dev Descriptions immuables des jalons par chantierId
    mapping(uint256 => string[]) private _jalonDescriptions;

    /// @dev Montants immuables des jalons par chantierId
    mapping(uint256 => uint256[]) private _jalonAmounts;

    /// @dev Statuts mutables des jalons par chantierId (mis à jour par le vault)
    mapping(uint256 => DataTypes.JalonStatus[]) private _jalonStatuses;

    // -------------------------------------------------------------------------
    // Erreurs
    // -------------------------------------------------------------------------

    error Soulbound();
    error ChantierDejaTokenise(uint256 chantierId);
    error JalonIndexInvalide(uint8 index, uint8 count);

    // -------------------------------------------------------------------------
    // Constructeur
    // -------------------------------------------------------------------------

    /// @param _owner Owner provisoire (sera transféré au vault après déploiement)
    constructor(address _owner) ERC721("Trust BTP", "TBTP") Ownable(_owner) {}

    // -------------------------------------------------------------------------
    // IChantierNFT — écriture (onlyOwner = vault)
    // -------------------------------------------------------------------------

    /// @inheritdoc IChantierNFT
    /// @dev Dual-mint : 2 NFTs soulbound sont mintés — un pour chaque partie.
    ///      tokenId particulier = chantierId
    ///      tokenId artisan     = ARTISAN_TOKEN_OFFSET + chantierId
    function mintChantier(
        uint256 chantierId,
        string calldata name,
        address artisan,
        address particulier,
        address token,
        uint256 devisAmount,
        uint256 depositAmount,
        string[] calldata jalonDescriptions,
        uint256[] calldata jalonAmounts,
        uint256 submittedAt,
        uint256 acceptedAt
    ) external override onlyOwner {
        if (_ownerOf(chantierId) != address(0)) revert ChantierDejaTokenise(chantierId);

        uint8 count = uint8(jalonDescriptions.length);

        // Stockage des données immuables du devis
        _devisData[chantierId] = DevisData({
            chantierId: chantierId,
            name: name,
            artisan: artisan,
            particulier: particulier,
            token: token,
            devisAmount: devisAmount,
            depositAmount: depositAmount,
            jalonCount: count,
            submittedAt: submittedAt,
            acceptedAt: acceptedAt
        });

        // Stockage immuable des jalons + initialisation des statuts à Pending
        for (uint8 i = 0; i < count; i++) {
            _jalonDescriptions[chantierId].push(jalonDescriptions[i]);
            _jalonAmounts[chantierId].push(jalonAmounts[i]);
            _jalonStatuses[chantierId].push(DataTypes.JalonStatus.Pending);
        }

        // Dual-mint soulbound : une copie pour chaque partie
        _mint(particulier, chantierId);
        _mint(artisan, ARTISAN_TOKEN_OFFSET + chantierId);

        emit ChantierMinte(chantierId, msg.sender);
    }

    /// @notice Retourne le tokenId détenu par le particulier pour un chantier donné
    function particulierTokenId(uint256 chantierId) external pure returns (uint256) {
        return chantierId;
    }

    /// @notice Retourne le tokenId détenu par l'artisan pour un chantier donné
    function artisanTokenId(uint256 chantierId) external pure returns (uint256) {
        return ARTISAN_TOKEN_OFFSET + chantierId;
    }

    /// @notice Retrouve le chantierId sous-jacent à partir d'un tokenId (particulier ou artisan)
    function chantierIdOf(uint256 tokenId) public pure returns (uint256) {
        return tokenId >= ARTISAN_TOKEN_OFFSET ? tokenId - ARTISAN_TOKEN_OFFSET : tokenId;
    }

    /// @inheritdoc IChantierNFT
    /// @dev Appelé par le vault à chaque transition de statut d'un jalon.
    function updateJalonStatus(uint256 chantierId, uint8 jalonIndex, DataTypes.JalonStatus newStatus)
        external
        override
        onlyOwner
    {
        uint8 count = _devisData[chantierId].jalonCount;
        if (jalonIndex >= count) revert JalonIndexInvalide(jalonIndex, count);

        _jalonStatuses[chantierId][jalonIndex] = newStatus;

        emit JalonStatusMisAJour(chantierId, jalonIndex, newStatus);
    }

    // -------------------------------------------------------------------------
    // IChantierNFT — lecture
    // -------------------------------------------------------------------------

    /// @inheritdoc IChantierNFT
    function getDevisData(uint256 chantierId) external view override returns (DevisData memory) {
        return _devisData[chantierId];
    }

    /// @inheritdoc IChantierNFT
    function getJalonStatuses(uint256 chantierId) external view override returns (DataTypes.JalonStatus[] memory) {
        return _jalonStatuses[chantierId];
    }

    /// @inheritdoc IChantierNFT
    function getJalonStatus(uint256 chantierId, uint8 jalonIndex) external view override returns (DataTypes.JalonStatus) {
        return _jalonStatuses[chantierId][jalonIndex];
    }

    // -------------------------------------------------------------------------
    // Métadonnées on-chain (JSON base64)
    // -------------------------------------------------------------------------

    /// @notice Retourne les métadonnées complètes du chantier encodées en JSON base64.
    ///         Lisibles directement depuis un explorateur de blocs ou la DApp.
    ///         Le nom inclut le rôle (Particulier / Artisan) pour différencier
    ///         les deux NFT du chantier dans les wallets.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 cid = chantierIdOf(tokenId);
        DevisData memory d = _devisData[cid];
        bool isArtisan = tokenId >= ARTISAN_TOKEN_OFFSET;
        string memory role = isArtisan ? "Artisan" : "Particulier";

        string memory json = string.concat(
            '{"name":"', d.name, ' #', cid.toString(), ' - ', role, '",',
            '"description":"NFT soulbound Trust BTP - preuve du contrat de chantier partagee entre le particulier et l\'artisan. Non transferable.",',
            '"attributes":[',
            '{"trait_type":"Role du detenteur","value":"', role, '"},',
            '{"trait_type":"Chantier ID","value":"', cid.toString(), '"},',
            '{"trait_type":"Nom","value":"', d.name, '"},',
            '{"trait_type":"Artisan","value":"', Strings.toHexString(uint256(uint160(d.artisan)), 20), '"},',
            '{"trait_type":"Particulier","value":"', Strings.toHexString(uint256(uint160(d.particulier)), 20), '"},',
            '{"trait_type":"Montant devis (USDC)","value":"', (d.devisAmount / 1e6).toString(), '"},',
            '{"trait_type":"Nombre de jalons","value":"', uint256(d.jalonCount).toString(), '"},',
            '{"trait_type":"Soulbound","value":"true"}',
            '],"jalons":', _buildJalonsJson(cid, d.jalonCount),
            "}"
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    // -------------------------------------------------------------------------
    // Soulbound — tout transfert est bloqué
    // -------------------------------------------------------------------------

    /// @dev Bloque tout transfert entre adresses. Seul le mint initial est permis.
    ///      Empêche transferFrom, safeTransferFrom et toutes les variantes.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        // Mint autorisé (from == 0x0), tout autre transfert bloqué
        if (from != address(0) && to != address(0) && from != to) {
            revert Soulbound();
        }
        return super._update(to, tokenId, auth);
    }

    /// @dev Bloque toute approbation — inutile pour un token non transférable
    function approve(address, uint256) public pure override {
        revert Soulbound();
    }

    /// @dev Bloque setApprovalForAll — inutile pour des tokens non transférables
    function setApprovalForAll(address, bool) public pure override {
        revert Soulbound();
    }

    // -------------------------------------------------------------------------
    // Helpers internes
    // -------------------------------------------------------------------------

    /// @dev Construit le tableau JSON des jalons avec statuts inclus
    function _buildJalonsJson(uint256 chantierId, uint8 count) internal view returns (string memory) {
        string memory result = "[";
        for (uint8 i = 0; i < count; i++) {
            if (i > 0) result = string.concat(result, ",");
            result = string.concat(
                result,
                '{"index":', uint256(i).toString(),
                ',"description":"', _jalonDescriptions[chantierId][i],
                '","montant":', (_jalonAmounts[chantierId][i] / 1e6).toString(),
                ',"statut":', uint256(_jalonStatuses[chantierId][i]).toString(),
                "}"
            );
        }
        return string.concat(result, "]");
    }
}
