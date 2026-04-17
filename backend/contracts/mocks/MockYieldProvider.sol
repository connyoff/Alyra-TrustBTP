// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IYieldProvider} from "../interfaces/IYieldProvider.sol";

/// @title MockYieldProvider
/// @notice IYieldProvider mock pour les tests locaux et Arbitrum Sepolia.
///         Remplace AaveV3YieldProvider dans les environnements de test locaux.
///
/// @dev Fonctionnement :
///   - Les tokens déposés sont conservés dans ce contrat (pas de protocole externe).
///   - `totalValue` et `pendingYield` lisent directement `balanceOf(address(this))`.
///   - Pour simuler l'accrual de yield dans les tests, il suffit de minter
///     des tokens supplémentaires directement à l'adresse de ce contrat :
///
///       await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);
///
///     `pendingYield()` retournera alors `yieldAmount` automatiquement.
///
/// @dev En production, ce contrat est remplacé par `AaveV3YieldProvider`
///      via `EscrowVault.setYieldProvider(aaveProviderAddress)`.
///      Aucun changement de code requis — seule l'adresse change.
contract MockYieldProvider is IYieldProvider, Ownable {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param _owner Adresse propriétaire du provider (EscrowVault)
    constructor(address _owner) Ownable(_owner) {}

    // -------------------------------------------------------------------------
    // IYieldProvider — write functions (onlyOwner = EscrowVault)
    // -------------------------------------------------------------------------

    /// @inheritdoc IYieldProvider
    /// @dev Les tokens sont déjà dans ce contrat (transférés par le vault avant l'appel).
    ///      Cette fonction ne fait qu'émettre l'événement pour la traçabilité.
    function deposit(address token, uint256 amount) external override onlyOwner {
        emit Deposited(token, amount);
    }

    /// @inheritdoc IYieldProvider
    function withdraw(address token, uint256 amount, address recipient) external override onlyOwner {
        IERC20(token).safeTransfer(recipient, amount);
        emit Withdrawn(token, amount, recipient);
    }

    /// @inheritdoc IYieldProvider
    function withdrawAll(address token, address recipient) external override onlyOwner returns (uint256 total) {
        total = IERC20(token).balanceOf(address(this));
        if (total > 0) {
            IERC20(token).safeTransfer(recipient, total);
        }
        emit Withdrawn(token, total, recipient);
    }

    // -------------------------------------------------------------------------
    // IYieldProvider — view functions
    // -------------------------------------------------------------------------

    /// @inheritdoc IYieldProvider
    /// @dev Retourne le solde réel du contrat (principal + yield simulé).
    function totalValue(address token) external view override returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /// @inheritdoc IYieldProvider
    /// @dev Surplus au-dessus du principal déposé = yield simulé.
    ///      Le vault passe `yieldPrincipal[token]` comme `depositedPrincipal`.
    function pendingYield(address token, uint256 depositedPrincipal) external view override returns (uint256) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        return balance > depositedPrincipal ? balance - depositedPrincipal : 0;
    }

    /// @inheritdoc IYieldProvider
    function providerName() external pure override returns (string memory) {
        return "Mock Yield Provider";
    }
}
