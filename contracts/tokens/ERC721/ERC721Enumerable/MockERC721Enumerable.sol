// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./ERC721Enumerable.sol";

contract MockERC721Enumerable is ERC721Enumerable {
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId, bytes calldata data) external {
        _safeMint(to, tokenId, data);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}