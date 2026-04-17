// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IChantierNFT} from "./interfaces/IChantierNFT.sol";
import {DataTypes} from "./libraries/DataTypes.sol";

/// @title ChantierNFT — Contrat de chantier NFT soulbound Trust BTP
///
/// @notice Un seul NFT (tokenId = chantierId) est minté par chantier
///         au moment de l'acceptation du devis.
///
///         Le NFT est détenu par le vault (EscrowVault), pas dans les wallets.
///         La DApp interroge ce contrat pour afficher l'état complet du chantier.
///
///         Données immuables : artisan, particulier, token, devisAmount,
///                             descriptions et montants des jalons, timestamps.
///         Données mutables  : statut de chaque jalon (mis à jour par le vault).
///
///         Soulbound : tout transfert est bloqué.
contract ChantierNFT is IChantierNFT, ERC721, Ownable {
    using Strings for uint256;

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
    /// @dev Le tokenId est égal au chantierId pour une recherche directe.
    ///      Le NFT est minté vers le vault (msg.sender = vault = owner).
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

        // Mint du NFT vers le vault (owner = msg.sender)
        _mint(msg.sender, chantierId);

        emit ChantierMinte(chantierId, msg.sender);
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
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        DevisData memory d = _devisData[tokenId];

        string memory json = string.concat(
            '{"name":"', d.name, ' (#', tokenId.toString(), ')",',
            '"description":"Contrat de chantier - Protocole Trust BTP",',
            '"attributes":[',
            '{"trait_type":"Chantier ID","value":"', tokenId.toString(), '"},',
            '{"trait_type":"Nom","value":"', d.name, '"},',
            '{"trait_type":"Artisan","value":"', Strings.toHexString(uint256(uint160(d.artisan)), 20), '"},',
            '{"trait_type":"Particulier","value":"', Strings.toHexString(uint256(uint160(d.particulier)), 20), '"},',
            '{"trait_type":"Montant devis (USDC)","value":"', (d.devisAmount / 1e6).toString(), '"},',
            '{"trait_type":"Nombre de jalons","value":"', uint256(d.jalonCount).toString(), '"}',
            '],"jalons":', _buildJalonsJson(tokenId, d.jalonCount),
            "}"
        );

        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    // -------------------------------------------------------------------------
    // Soulbound — tout transfert est bloqué
    // -------------------------------------------------------------------------

    /// @dev Bloque tout transfert. Le NFT est lié au vault pour toujours.
    function transferFrom(address, address, uint256) public pure override {
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
