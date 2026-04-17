// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IYieldProvider
/// @notice Interface for DeFi yield adapters plugged into the EscrowVault.
/// @dev Implementing contracts must hold the deposited tokens and interact with
///      the underlying protocol (Aave, Morpho, …). The EscrowVault is always
///      the owner/controller of each IYieldProvider instance.
interface IYieldProvider {
    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount, address indexed recipient);

    // -------------------------------------------------------------------------
    // Core functions
    // -------------------------------------------------------------------------

    /// @notice Deposit `amount` of `token` into the yield protocol.
    /// @dev The caller (EscrowVault) must have already transferred `amount` of
    ///      `token` to this contract before calling this function.
    /// @param token ERC20 token address (USDC)
    /// @param amount Amount to deposit (in token decimals)
    function deposit(address token, uint256 amount) external;

    /// @notice Withdraw exactly `amount` of principal `token` to `recipient`.
    /// @dev Yield remains in the provider and accumulates for the platform.
    /// @param token ERC20 token address
    /// @param amount Exact principal amount to withdraw
    /// @param recipient Address that receives the tokens
    function withdraw(address token, uint256 amount, address recipient) external;

    /// @notice Withdraw all remaining funds (principal + yield) for `token`.
    /// @dev Used at chantier completion to collect accumulated yield.
    ///      Sends everything to `recipient` (typically the vault or treasury).
    /// @param token ERC20 token address
    /// @param recipient Address that receives the full balance
    /// @return total Total amount withdrawn
    function withdrawAll(address token, address recipient) external returns (uint256 total);

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /// @notice Current total value held for `token` (principal + accrued yield).
    function totalValue(address token) external view returns (uint256);

    /// @notice Accrued yield above `depositedPrincipal` for `token`.
    function pendingYield(address token, uint256 depositedPrincipal) external view returns (uint256);

    /// @notice Human-readable name of the underlying protocol (e.g. "Aave V3").
    function providerName() external pure returns (string memory);
}
