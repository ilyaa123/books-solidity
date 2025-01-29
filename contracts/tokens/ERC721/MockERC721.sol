// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./ERC721.sol";

contract MockERC721 is ERC721 {

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function burn(uint256 _tokenId) external {
        _burn(_tokenId);
    }

    function safeMint(address to, uint256 tokenId, bytes calldata data) external {
        _safeMint(to, tokenId, data);
    }

}