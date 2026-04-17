// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ITrustScoreRegistry
/// @notice Interface for the on-chain artisan reputation system.
interface ITrustScoreRegistry {
    // -------------------------------------------------------------------------
    // Enums
    // -------------------------------------------------------------------------

    /// @notice Trust tier derived from the artisan's score (0–100)
    enum Tier {
        Nouveau, //  0–39  — basic access, no material advance
        Confirme, // 40–64 — profile badge, premium access
        Expert, //  65–84 — 30% material advance, reduced fees
        Elite //    85–100 — max advance, 1% commission, elite badge
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event ScoreUpdated(address indexed artisan, uint256 oldScore, uint256 newScore, Tier newTier);
    event ScoreFrozen(address indexed artisan, uint256 chantierId);
    event ScoreUnfrozen(address indexed artisan, uint256 chantierId);

    // -------------------------------------------------------------------------
    // Write functions (only callable by EscrowVault)
    // -------------------------------------------------------------------------

    /// @notice Update an artisan's score after a chantier is completed.
    /// @param artisan Artisan address
    /// @param chantierId Chantier that just closed
    /// @param jalonCount Total jalons in the chantier
    /// @param jalonOnTime Number of jalons delivered before their estimated date
    /// @param hadLitige Whether a litige occurred during the chantier
    /// @param proofsSubmitted Number of proof documents submitted
    /// @param deliveredOnTime Whether the final delivery was on time
    function updateScore(
        address artisan,
        uint256 chantierId,
        uint8 jalonCount,
        uint8 jalonOnTime,
        bool hadLitige,
        uint8 proofsSubmitted,
        bool deliveredOnTime
    ) external;

    /// @notice Freeze an artisan's score while a litige is pending.
    function freezeScore(address artisan, uint256 chantierId) external;

    /// @notice Unfreeze an artisan's score after a litige is resolved.
    function unfreezeScore(address artisan, uint256 chantierId) external;

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /// @notice Returns the current score (0–100) of an artisan.
    function getScore(address artisan) external view returns (uint256);

    /// @notice Returns the current tier of an artisan.
    function getTier(address artisan) external view returns (Tier);

    /// @notice Returns full stats for an artisan.
    function getStats(address artisan)
        external
        view
        returns (
            uint256 score,
            Tier tier,
            uint256 chantiersCompleted,
            uint256 litigesCount,
            bool frozen
        );
}
