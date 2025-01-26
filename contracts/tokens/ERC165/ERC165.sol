// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC165.sol";

contract ERC165 is IERC165 {

    mapping(bytes4 => bool) internal supportedInterfaces;

    constructor()  {
        supportedInterfaces[0x01ffc9a7] = true;
    }

    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return supportedInterfaces[interfaceID] && (interfaceID != 0xffffffff);
    }

}