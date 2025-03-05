// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

contract MockImplementationV1 {
    uint256 public value;

    event ValueSet(uint256 newValue);

    function setValue(uint256 _value) external {
        value = _value;
        emit ValueSet(_value);
    }
}
