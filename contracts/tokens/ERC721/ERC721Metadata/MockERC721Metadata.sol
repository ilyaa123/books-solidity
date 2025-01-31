// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./ERC721Metadata.sol";

contract MockERC721Metadata is ERC721Metadata {

    constructor(string memory _name, string memory _symbol, string memory _tokenURI) ERC721Metadata(_name, _symbol, _tokenURI) {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}