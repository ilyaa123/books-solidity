// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "../ERC20Metadata/ERC20Metadata.sol";
import "../ERC20.sol";
import "./IERC20Permit.sol";

contract ERC20Permit is IERC20Permit, ERC20Metadata, ERC20 {

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 private constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    mapping(address => uint256) private _nonces;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20Metadata(_name, _symbol, _decimals) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(_name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function nonces(address owner) public view returns (uint256) {
        return _nonces[owner];
    }

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= deadline, "Expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, _nonces[owner], deadline)
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        address recoveredAddress = ecrecover(digest, v, r, s);

        require(recoveredAddress == owner, "Invalid signature");

        _nonces[owner]++;
        _approve(owner, spender, value);
    }

}