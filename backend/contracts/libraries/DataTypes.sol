// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DataTypes — Types partagés du protocole Trust BTP
library DataTypes {
    // -------------------------------------------------------------------------
    // Constantes
    // -------------------------------------------------------------------------

    /// @dev Nombre maximum de jalons par chantier
    uint8 constant MAX_JALONS = 5;

    /// @dev Dénominateur commun pour les pourcentages en points de base (1 BPS = 0,01%)
    uint256 constant BPS_DENOMINATOR = 10_000;

    /// @dev Commission plateforme prélevée sur chaque jalon (2%)
    uint256 constant PLATFORM_FEE_BPS = 200;

    /// @dev Le particulier dépose 110% du montant du devis
    uint256 constant DEPOSIT_RATIO_BPS = 11_000;

    /// @dev Délai de validation automatique si le particulier ne réagit pas (48h)
    uint256 constant AUTO_VALIDATE_DELAY = 48 hours;

    // --- Pénalités codées en dur (à paramétrer dans une version future) ---

    /// @dev Part bloquée du jalon en cas de réserves mineures (10%)
    uint256 constant MINOR_RESERVE_BLOCK_BPS = 1_000;

    /// @dev Pénalité artisan en cas de réserves mineures (3%)
    uint256 constant MINOR_RESERVE_PENALTY_BPS = 300;

    /// @dev Part bloquée par la plateforme quand l'artisan est en tort (20%)
    uint256 constant LITIGE_ARTISAN_FAULT_BLOCK_BPS = 2_000;

    /// @dev Pénalité artisan en tort lors d'un litige (5%)
    uint256 constant LITIGE_ARTISAN_FAULT_PENALTY_BPS = 500;

    /// @dev Pénalité particulier en tort lors d'un litige (5%)
    uint256 constant LITIGE_PARTICULIER_FAULT_PENALTY_BPS = 500;

    // -------------------------------------------------------------------------
    // Énumérations
    // -------------------------------------------------------------------------

    /// @notice États d'un chantier tout au long de son cycle de vie
    enum ChantierStatus {
        DevisSubmitted, // Devis soumis par l'artisan — en attente de signature du particulier
        DevisRejected, // Particulier a refusé le devis — chantier définitivement clôturé
        Active, // Devis signé, fonds déposés — travaux en cours
        Paused, // Réserves majeures — chantier suspendu
        InLitige, // Litige en cours d'arbitrage
        Completed, // Tous les jalons validés — fonds libérés
        Cancelled // Annulé par le particulier avant le 1er jalon (après signature)
    }

    /// @notice États d'un jalon individuel
    enum JalonStatus {
        Pending, // Non réalisé — en attente de démarrage
        Finished, // Réalisé par l'artisan — preuve soumise, délai 48h en cours
        Accepted, // Validé (manuellement ou automatiquement) — fonds libérés
        AcceptedWithReserves, // Accepté avec réserves (mineures ou majeures)
        PaidWithReserves, // Artisan a accusé réception — paiement partiel effectué
        InLitige, // Artisan a refusé les déductions — arbitrage en cours
        ReservesLifted // Réserves levées par le particulier — solde libéré
    }

    // -------------------------------------------------------------------------
    // Structures
    // -------------------------------------------------------------------------

    /// @notice Données d'un jalon de chantier
    struct Jalon {
        string description;
        /// @dev Montant brut à libérer lors de la validation complète (en unités du token)
        uint256 amount;
        JalonStatus status;
        /// @dev Timestamp auquel l'artisan a soumis sa preuve
        uint256 finishedAt;
        /// @dev Hash IPFS ou keccak256 de la preuve artisan
        bytes32 artisanProofHash;
        /// @dev Hash IPFS ou keccak256 de la contre-preuve du particulier (réserves)
        bytes32 clientProofHash;
        /// @dev Montant bloqué en attente de résolution des réserves
        uint256 blockedAmount;
        /// @dev Montant de pénalité déduit du paiement artisan
        uint256 penaltyAmount;
        /// @dev Date de fin prévue de la réalisation (timestamp Unix, informatif)
        uint256 deadline;
    }

    /// @notice Données d'un chantier
    struct Chantier {
        uint256 id;
        /// @dev Nom libre du chantier saisi par l'artisan
        string name;
        /// @dev Artisan — initiateur du devis
        address artisan;
        /// @dev Particulier — client destinataire du devis
        address particulier;
        /// @dev Token ERC-20 utilisé (USDC uniquement pour l'instant)
        address token;
        /// @dev Montant du devis convenu (100%) = somme des jalons
        uint256 devisAmount;
        /// @dev Montant réellement déposé = 110% du devis (0 avant acceptation)
        uint256 depositAmount;
        /// @dev Opt-in yield DeFi — choisi par le particulier à l'acceptation
        bool yieldOptIn;
        ChantierStatus status;
        /// @dev Index du jalon en cours (0-indexé)
        uint8 currentJalonIndex;
        /// @dev Nombre total de jalons
        uint8 jalonCount;
        /// @dev Timestamp de soumission du devis par l'artisan
        uint256 submittedAt;
        /// @dev Timestamp de signature du particulier (0 si non encore accepté)
        uint256 acceptedAt;
        /// @dev Timestamp de clôture complète du chantier
        uint256 completedAt;
        /// @dev true si le particulier était en tort lors d'un litige — le buffer 10% ne lui est pas retourné
        bool bufferForfeited;
    }
}
