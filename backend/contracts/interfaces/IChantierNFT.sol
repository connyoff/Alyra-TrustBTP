// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DataTypes} from "../libraries/DataTypes.sol";

/// @title IChantierNFT — Interface du NFT soulbound Trust BTP
///
/// @notice Un seul NFT est minté par chantier au moment de l'acceptation du devis.
///         Il est détenu par le vault (pas dans les wallets des utilisateurs).
///         Les données du devis (parties, montants, descriptions) sont immuables.
///         Les statuts des jalons sont mutables et mis à jour par le vault.
///         La DApp interroge ce contrat pour afficher l'état du chantier.
interface IChantierNFT {
    // -------------------------------------------------------------------------
    // Événements
    // -------------------------------------------------------------------------

    /// @notice Émis lors du mint d'un NFT pour un chantier
    event ChantierMinte(uint256 indexed chantierId, address indexed vault);

    /// @notice Émis à chaque mise à jour du statut d'un jalon
    event JalonStatusMisAJour(uint256 indexed chantierId, uint8 jalonIndex, DataTypes.JalonStatus newStatus);

    // -------------------------------------------------------------------------
    // Structures
    // -------------------------------------------------------------------------

    /// @notice Données immuables du devis stockées on-chain
    struct DevisData {
        uint256 chantierId;
        string name;
        address artisan;
        address particulier;
        address token;
        uint256 devisAmount;
        uint256 depositAmount;
        uint8 jalonCount;
        uint256 submittedAt;
        uint256 acceptedAt;
    }

    // -------------------------------------------------------------------------
    // Fonctions d'écriture (réservées au vault — owner du contrat NFT)
    // -------------------------------------------------------------------------

    /// @notice Minte le NFT du chantier vers le vault lors de l'acceptation du devis.
    ///         Le tokenId est égal au chantierId.
    /// @param chantierId         Identifiant du chantier (= tokenId du NFT)
    /// @param name               Nom libre du chantier
    /// @param artisan            Adresse de l'artisan
    /// @param particulier        Adresse du particulier
    /// @param token              Token de paiement (USDC)
    /// @param devisAmount        Montant du devis (100%)
    /// @param depositAmount      Montant déposé (110%)
    /// @param jalonDescriptions  Descriptions immuables des jalons
    /// @param jalonAmounts       Montants immuables des jalons
    /// @param submittedAt        Timestamp soumission artisan
    /// @param acceptedAt         Timestamp acceptation particulier
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
    ) external;

    /// @notice Met à jour le statut d'un jalon dans le NFT.
    ///         Appelé par le vault à chaque transition d'état d'un jalon.
    /// @param chantierId  Identifiant du chantier
    /// @param jalonIndex  Index du jalon (0-indexé)
    /// @param newStatus   Nouveau statut
    function updateJalonStatus(uint256 chantierId, uint8 jalonIndex, DataTypes.JalonStatus newStatus) external;

    // -------------------------------------------------------------------------
    // Fonctions de lecture
    // -------------------------------------------------------------------------

    /// @notice Retourne les données immuables du devis
    function getDevisData(uint256 chantierId) external view returns (DevisData memory);

    /// @notice Retourne les statuts actuels de tous les jalons d'un chantier
    function getJalonStatuses(uint256 chantierId) external view returns (DataTypes.JalonStatus[] memory);

    /// @notice Retourne le statut d'un jalon précis
    function getJalonStatus(uint256 chantierId, uint8 jalonIndex) external view returns (DataTypes.JalonStatus);
}
