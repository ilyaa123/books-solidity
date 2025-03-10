// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "../../../cryptography/EIP712/EIP712.sol";
import "../ERC20Metadata/ERC20Metadata.sol";
import "../ERC20.sol";
import "./IERC20Permit.sol";

contract ERC20Permit is IERC20Permit, ERC20Metadata, ERC20, EIP712 {

    bytes32 private constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    mapping(address => uint256) private _nonces;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20Metadata(_name, _symbol, _decimals) EIP712(_name, "1") {}

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function nonces(address owner) public view returns (uint256) {
        return _nonces[owner];
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "Expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, _nonces[owner], deadline)
        );

        bytes32 digest = _hashTypedDataV4(structHash);

        address recoveredAddress = ecrecover(digest, v, r, s);

        require(recoveredAddress == owner, "Invalid signature");

        _nonces[owner]++;
        _approve(owner, spender, value);
    }

}