// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC721Metadata.sol";

import "../ERC721.sol";

import "../../../library/Strings.sol";

contract ERC721Metadata is IERC721Metadata, ERC721 {
    using Strings for uint;

    string private name_;
    string private symbol_;
    
    string private tokenURI_;

    constructor(string memory _name, string memory _symbol, string memory _tokenURI) {
        name_ = _name;
        symbol_ = _symbol;
        tokenURI_ = _tokenURI;
    }

    function name() external view returns (string memory _name) {
        return name_;
    }

    function symbol() external view returns (string memory _symbol) {
        return symbol_;
    }

    function tokenURI(uint256 _tokenId) external view _requireMinted(_tokenId) returns (string memory) {
        return bytes(tokenURI_).length > 0 ? string(abi.encodePacked(tokenURI_, _tokenId.toString())) : "";
    }
}