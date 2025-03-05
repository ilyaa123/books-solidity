// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./ERC20.sol";
import "./ERC20Metadata/ERC20Metadata.sol";

contract MockERC20 is ERC20Metadata, ERC20 {

    constructor(string memory _name, string memory _symbol) ERC20Metadata(_name, _symbol, 8) {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burn(uint256 _amount) external {
        _burn(_amount);
    }

}