// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @dev Minimal ERC-20 mock with EIP-2612 permit support — NOT for production use.
contract ERC20Mock is ERC20, ERC20Permit {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimalsValue)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _decimals = decimalsValue;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
