// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IAavePool
/// @notice Minimal interface for the Aave V3 Pool contract.
/// @dev Full interface: https://github.com/aave/aave-v3-core
interface IAavePool {
    /// @notice Supply `amount` of `asset` to the Aave pool.
    /// @param asset The ERC20 token address to supply
    /// @param amount The amount to supply
    /// @param onBehalfOf Address that will receive the aTokens
    /// @param referralCode Referral code (0 = none)
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;

    /// @notice Withdraw `amount` of `asset` from the Aave pool.
    /// @param asset The ERC20 token address to withdraw
    /// @param amount The amount to withdraw (use type(uint256).max to withdraw all)
    /// @param to Address that receives the withdrawn tokens
    /// @return The actual amount withdrawn
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/// @title IAToken
/// @notice Minimal interface for Aave V3 aTokens (interest-bearing tokens).
interface IAToken {
    /// @notice Returns the current balance of `account` including accrued interest.
    function balanceOf(address account) external view returns (uint256);
}
