// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC20Metadata.sol";

contract ERC20Metadata is IERC20Metadata {
    uint8 public decimals;
    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
}