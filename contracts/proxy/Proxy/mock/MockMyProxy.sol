// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "../Proxy.sol";

contract MockMyProxy is Proxy {
    bytes32 private constant IMPLEMENTATION_SLOT = keccak256("proxy.implementation");

    constructor(address implementation) {
        _setImplementation(implementation);
    }

    function _implementation() internal view override returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    function upgrade(address newImplementation) external {
        _setImplementation(newImplementation);
    }

    function _setImplementation(address newImplementation) private {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImplementation)
        }
    }

    receive() external override payable {}

    function withdrawETH(address payable to) external {
        to.transfer(address(this).balance);
    }
}
