// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC721Enumerable.sol";

import "../ERC721.sol";

contract ERC721Enumerable is IERC721Enumerable, ERC721 {

    uint256[] private _allTokens;

    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(address => uint256) private _ownedTokensCount;

    mapping(uint256 => uint256) private _allTokensIndex;
    
    function _burn(uint256 tokenId) internal override virtual {
        super._burn(tokenId);

        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        uint256 lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId;
        _allTokensIndex[lastTokenId] = tokenIndex;

        _allTokens.pop();
        delete _allTokensIndex[tokenId];
    }

    function _mint(address to, uint256 tokenId) internal override virtual {
        super._mint(to, tokenId);

        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
        
        uint256 length = _ownedTokensCount[to];
        _ownedTokens[to][length] = tokenId;
        _ownedTokensCount[to]++;
    }

    function _safeMint(address to, uint256 tokenId, bytes calldata data) internal override virtual {
        super._safeMint(to, tokenId, data);

        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
        
        uint256 length = _ownedTokensCount[to];
        _ownedTokens[to][length] = tokenId;
        _ownedTokensCount[to]++;
    }

    function totalSupply() public view override returns (uint256) {
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) external view override returns (uint256) {
        require(index < totalSupply(), "Index out of bounds");
        return _allTokens[index];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) external view override returns (uint256) {
        require(index < balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }
}
