// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC721Enumerable.sol";

import "../ERC721.sol";

contract ERC721Enumerable is IERC721Enumerable, ERC721 {
    
    uint256[] private _allTokens;
    mapping(uint256 => uint256) private _allTokensIndex;
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    function _burn(uint256 tokenId) internal override(ERC721) virtual {
        super._burn(tokenId);

        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _allTokens[lastTokenIndex];
            _allTokens[tokenIndex] = lastTokenId;
            _allTokensIndex[lastTokenId] = tokenIndex;
        }

        _allTokens.pop();
        _allTokensIndex[tokenId] = 0;
    }

    function _mint(address to, uint256 tokenId) internal override(ERC721) virtual {
        super._mint(to, tokenId);

        _allTokens.push(tokenId);
        _allTokensIndex[tokenId] = _allTokens.length - 1;
        _ownedTokens[to][balanceOf(to) - 1] = tokenId;
    }

    function _safeMint(address to, uint256 tokenId, bytes calldata data) internal override(ERC721) virtual {
        super._safeMint(to, tokenId, data);

        _allTokens.push(tokenId);
        _allTokensIndex[tokenId] = _allTokens.length - 1;
        _ownedTokens[to][balanceOf(to) - 1] = tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) external view returns (uint256) {
        if (index >= totalSupply()) revert("Index out of bounds");
        return _allTokens[index];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256) {
        if (index >= balanceOf(owner)) revert("Index out of bounds");

        return _ownedTokens[owner][index];
    }
}
