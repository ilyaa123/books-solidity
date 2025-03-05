// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./ERC20Permit.sol";

contract MockERC20Permit is ERC20Permit {

    constructor(string memory _name, string memory _symbol) ERC20Permit(_name, _symbol, 8) {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(_amount);
    }

}