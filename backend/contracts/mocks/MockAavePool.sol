// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Mock} from "./ERC20Mock.sol";

/// @dev Minimal Aave V3 Pool mock for local testing — NOT for production use.
///      Mirrors the IAavePool interface: supply pulls underlying and mints aTokens,
///      withdraw burns aTokens and returns underlying.
contract MockAavePool {
    mapping(address asset => address aToken) public aTokenOf;

    /// @notice Register the aToken that corresponds to a given underlying asset.
    function setToken(address asset, address aToken) external {
        aTokenOf[asset] = aToken;
    }

    /// @notice Pull `amount` of `asset` from caller and mint equivalent aTokens to `onBehalfOf`.
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 /*referralCode*/) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        ERC20Mock(aTokenOf[asset]).mint(onBehalfOf, amount);
    }

    /// @notice Burn aTokens from caller and transfer underlying `asset` to `to`.
    ///         Pass `type(uint256).max` to withdraw the full balance.
    function withdraw(address asset, uint256 amount, address to) external returns (uint256 actual) {
        address aToken = aTokenOf[asset];
        uint256 balance = ERC20Mock(aToken).balanceOf(msg.sender);
        actual = amount == type(uint256).max ? balance : amount;
        ERC20Mock(aToken).burn(msg.sender, actual);
        IERC20(asset).transfer(to, actual);
    }
}
