// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

pragma solidity ^0.8.20;

interface IERC5267 {
 
    event EIP712DomainChanged();

    function eip712Domain() external view returns (
        bytes1 fields,
        string memory name,
        string memory version,
        uint256 chainId,
        address verifyingContract,
        bytes32 salt,
        uint256[] memory extensions
    );
}