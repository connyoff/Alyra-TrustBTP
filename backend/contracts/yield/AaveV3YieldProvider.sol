// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IYieldProvider} from "../interfaces/IYieldProvider.sol";
import {IAavePool, IAToken} from "./interfaces/IAavePool.sol";

/// @title AaveV3YieldProvider
/// @notice IYieldProvider adapter for the Aave V3 lending pool.
///
/// @dev Architecture note
///   - This contract is the `onBehalfOf` address for all Aave deposits, meaning
///     it holds the aTokens directly.
///   - Only the owner (EscrowVault) can call deposit / withdraw / withdrawAll.
///   - A new provider instance can be deployed at any time and plugged into the
///     EscrowVault by calling `setYieldProvider()`, enabling future protocol
///     upgrades (e.g. switching to Morpho) without redeploying the vault.
///
/// Arbitrum Sepolia addresses (set in constructor):
///   Aave V3 Pool proxy : 0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
///   USDC               : 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
///   aUSDC              : 0x460b97BD498E1157530AEb3086301d5225b91216
contract AaveV3YieldProvider is IYieldProvider, Ownable {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Aave V3 Pool proxy contract
    IAavePool public immutable aavePool;

    /// @notice Mapping: ERC20 token → its corresponding Aave aToken
    mapping(address token => address aToken) public aTokenOf;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error TokenNotSupported(address token);
    error ZeroAmount();
    error InsufficientBalance(uint256 requested, uint256 available);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param _aavePool   Aave V3 Pool proxy address
    /// @param _owner      Address that controls this provider (EscrowVault)
    constructor(address _aavePool, address _owner) Ownable(_owner) {
        require(_aavePool != address(0), "AaveV3YieldProvider: zero pool");
        aavePool = IAavePool(_aavePool);
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    /// @notice Register a supported token and its corresponding aToken.
    /// @dev Must be called once per token before the first deposit.
    function registerToken(address token, address aToken) external onlyOwner {
        require(token != address(0) && aToken != address(0), "AaveV3YieldProvider: zero address");
        aTokenOf[token] = aToken;
    }

    // -------------------------------------------------------------------------
    // IYieldProvider — write functions (onlyOwner = EscrowVault)
    // -------------------------------------------------------------------------

    /// @inheritdoc IYieldProvider
    /// @dev EscrowVault must transfer `amount` of `token` to this contract
    ///      before calling this function.
    function deposit(address token, uint256 amount) external override onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (aTokenOf[token] == address(0)) revert TokenNotSupported(token);

        // Approve Aave pool to pull tokens from this contract
        IERC20(token).forceApprove(address(aavePool), amount);

        // Supply to Aave — this contract receives aTokens
        aavePool.supply(token, amount, address(this), 0);

        emit Deposited(token, amount);
    }

    /// @inheritdoc IYieldProvider
    function withdraw(address token, uint256 amount, address recipient) external override onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (aTokenOf[token] == address(0)) revert TokenNotSupported(token);

        uint256 available = IAToken(aTokenOf[token]).balanceOf(address(this));
        if (amount > available) revert InsufficientBalance(amount, available);

        // Withdraw from Aave — tokens sent directly to recipient
        aavePool.withdraw(token, amount, recipient);

        emit Withdrawn(token, amount, recipient);
    }

    /// @inheritdoc IYieldProvider
    function withdrawAll(address token, address recipient) external override onlyOwner returns (uint256 total) {
        if (aTokenOf[token] == address(0)) revert TokenNotSupported(token);

        total = IAToken(aTokenOf[token]).balanceOf(address(this));
        if (total == 0) return 0;

        // type(uint256).max tells Aave to withdraw the full aToken balance
        aavePool.withdraw(token, type(uint256).max, recipient);

        emit Withdrawn(token, total, recipient);
    }

    // -------------------------------------------------------------------------
    // IYieldProvider — view functions
    // -------------------------------------------------------------------------

    /// @inheritdoc IYieldProvider
    function totalValue(address token) external view override returns (uint256) {
        address aToken = aTokenOf[token];
        if (aToken == address(0)) return 0;
        return IAToken(aToken).balanceOf(address(this));
    }

    /// @inheritdoc IYieldProvider
    function pendingYield(address token, uint256 depositedPrincipal) external view override returns (uint256) {
        address aToken = aTokenOf[token];
        if (aToken == address(0)) return 0;
        uint256 current = IAToken(aToken).balanceOf(address(this));
        return current > depositedPrincipal ? current - depositedPrincipal : 0;
    }

    /// @inheritdoc IYieldProvider
    function providerName() external pure override returns (string memory) {
        return "Aave V3";
    }
}
