// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ITrustScoreRegistry} from "./interfaces/ITrustScoreRegistry.sol";

/// @title TrustScoreRegistry
/// @notice On-chain reputation system for artisans on the Trust BTP platform.
///
/// @dev Scoring rules
///   The score is an integer in [0, 100].
///   New artisans start at INITIAL_SCORE (50).
///   After each completed chantier the EscrowVault calls `updateScore()`.
///   During a litige the score is frozen (no updates allowed).
///
///   Adjustments per chantier (applied cumulatively):
///     +JALON_ONTIME_BONUS    per on-time jalon
///     +DELIVERY_ONTIME_BONUS if final delivery was on time
///     +PROOF_QUALITY_BONUS   per proof document submitted (max MAX_JALONS)
///     -LITIGE_PENALTY        if a litige occurred
///     -RESERVE_PENALTY       per reserve (minor) raised during the chantier
///     (no adjustment for volume / seniority in this version)
///
///   Score is clamped to [0, 100] after each update.
///
/// Tiers (read-only, derived from score):
///   0–39  → Nouveau
///   40–64 → Confirmé
///   65–84 → Expert
///   85–100→ Élite
contract TrustScoreRegistry is ITrustScoreRegistry, Ownable {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    uint256 constant INITIAL_SCORE = 50;
    uint256 constant MAX_SCORE = 100;

    // Score adjustments (signed, applied to uint256 via safe cast)
    int256 constant JALON_ONTIME_BONUS = 3; // per on-time jalon
    int256 constant DELIVERY_ONTIME_BONUS = 5; // per chantier delivered on time
    int256 constant PROOF_QUALITY_BONUS = 2; // per proof submitted
    int256 constant LITIGE_PENALTY = -15; // per litige
    int256 constant RESERVE_PENALTY = -3; // per minor reserve event (hardcoded)

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Address of the EscrowVault — the only caller allowed to update scores
    address public escrowVault;

    struct ArtisanData {
        uint256 score;
        uint256 chantiersCompleted;
        uint256 litigesCount;
        bool frozen;
        /// @dev chantierId that triggered the freeze (0 = not frozen)
        uint256 frozenByChantierId;
    }

    mapping(address artisan => ArtisanData) private _artisans;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error OnlyEscrowVault();
    error ScoreCurrentlyFrozen(address artisan, uint256 chantierId);
    error NotFrozen(address artisan);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyEscrowVault() {
        if (msg.sender != escrowVault) revert OnlyEscrowVault();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param _owner Platform owner (multisig / deployer)
    constructor(address _owner) Ownable(_owner) {}

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    /// @notice Set or update the EscrowVault address allowed to call score functions.
    /// @dev Called once after deployment, or if the vault is upgraded.
    function setEscrowVault(address _escrowVault) external onlyOwner {
        require(_escrowVault != address(0), "TrustScoreRegistry: zero address");
        escrowVault = _escrowVault;
    }

    // -------------------------------------------------------------------------
    // ITrustScoreRegistry — write functions
    // -------------------------------------------------------------------------

    /// @inheritdoc ITrustScoreRegistry
    function updateScore(
        address artisan,
        uint256 chantierId,
        uint8 jalonCount,
        uint8 jalonOnTime,
        bool hadLitige,
        uint8 proofsSubmitted,
        bool deliveredOnTime
    ) external override onlyEscrowVault {
        ArtisanData storage data = _artisans[artisan];

        if (data.frozen) revert ScoreCurrentlyFrozen(artisan, data.frozenByChantierId);

        // Initialise new artisans
        if (data.chantiersCompleted == 0 && data.score == 0) {
            data.score = INITIAL_SCORE;
        }

        uint256 oldScore = data.score;
        int256 delta = 0;

        // --- Positive contributions ---
        if (jalonOnTime > jalonCount) jalonOnTime = jalonCount; // safety cap
        delta += JALON_ONTIME_BONUS * int256(uint256(jalonOnTime));

        if (deliveredOnTime) delta += DELIVERY_ONTIME_BONUS;

        // Proof quality: bonus per proof, capped at jalonCount
        uint8 cappedProofs = proofsSubmitted > jalonCount ? jalonCount : proofsSubmitted;
        delta += PROOF_QUALITY_BONUS * int256(uint256(cappedProofs));

        // --- Negative contributions ---
        if (hadLitige) {
            delta += LITIGE_PENALTY;
            data.litigesCount++;
        }

        // Apply delta with clamp to [0, MAX_SCORE]
        int256 newScoreInt = int256(data.score) + delta;
        if (newScoreInt < 0) newScoreInt = 0;
        if (newScoreInt > int256(MAX_SCORE)) newScoreInt = int256(MAX_SCORE);

        data.score = uint256(newScoreInt);
        data.chantiersCompleted++;

        emit ScoreUpdated(artisan, oldScore, data.score, _tierOf(data.score));

        // Silence unused parameter warning (chantierId logged via event in vault)
        chantierId;
    }

    /// @inheritdoc ITrustScoreRegistry
    function freezeScore(address artisan, uint256 chantierId) external override onlyEscrowVault {
        ArtisanData storage data = _artisans[artisan];
        data.frozen = true;
        data.frozenByChantierId = chantierId;
        emit ScoreFrozen(artisan, chantierId);
    }

    /// @inheritdoc ITrustScoreRegistry
    function unfreezeScore(address artisan, uint256 chantierId) external override onlyEscrowVault {
        ArtisanData storage data = _artisans[artisan];
        if (!data.frozen) revert NotFrozen(artisan);
        data.frozen = false;
        data.frozenByChantierId = 0;
        emit ScoreUnfrozen(artisan, chantierId);
    }

    // -------------------------------------------------------------------------
    // ITrustScoreRegistry — view functions
    // -------------------------------------------------------------------------

    /// @inheritdoc ITrustScoreRegistry
    function getScore(address artisan) external view override returns (uint256) {
        ArtisanData storage data = _artisans[artisan];
        return data.chantiersCompleted == 0 && data.score == 0 ? INITIAL_SCORE : data.score;
    }

    /// @inheritdoc ITrustScoreRegistry
    function getTier(address artisan) external view override returns (Tier) {
        return _tierOf(this.getScore(artisan));
    }

    /// @inheritdoc ITrustScoreRegistry
    function getStats(address artisan)
        external
        view
        override
        returns (uint256 score, Tier tier, uint256 chantiersCompleted, uint256 litigesCount, bool frozen)
    {
        ArtisanData storage data = _artisans[artisan];
        score = data.chantiersCompleted == 0 && data.score == 0 ? INITIAL_SCORE : data.score;
        tier = _tierOf(score);
        chantiersCompleted = data.chantiersCompleted;
        litigesCount = data.litigesCount;
        frozen = data.frozen;
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    function _tierOf(uint256 score) internal pure returns (Tier) {
        if (score >= 85) return Tier.Elite;
        if (score >= 65) return Tier.Expert;
        if (score >= 40) return Tier.Confirme;
        return Tier.Nouveau;
    }
}
