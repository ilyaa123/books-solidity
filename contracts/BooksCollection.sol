// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./tokens/ERC165/ERC165.sol";

import "./tokens/ERC721/ERC721Metadata/ERC721Metadata.sol";
import "./tokens/ERC721/ERC721Enumerable/ERC721Enumerable.sol";
import "./tokens/ERC20/ERC20.sol";

contract BooksCollection is ERC165, ERC721Metadata, ERC721Enumerable {
    
    struct Book {
        uint16 publicationYear;
        string title;
        string description;
        string author;
        string isbn;
        string[] genres;
    }

    mapping(uint256 => Book) public books;

    constructor() ERC165() ERC721Metadata("Book Collection", "BK", "") {
        supportedInterfaces[type(IERC721).interfaceId] = true;
        supportedInterfaces[type(IERC721Metadata).interfaceId] = true;
        supportedInterfaces[type(IERC721Enumerable).interfaceId] = true;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._burn(tokenId);
    }

    function _mint(address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._mint(to, tokenId);
    }

    function _safeMint(address to, uint256 tokenId, bytes calldata data) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._safeMint(to, tokenId, data);
    }

    function mintBook(address to, uint256 tokenId, Book calldata book, bytes calldata data) external {
        
        _safeMint(to, tokenId, data);

        books[tokenId] = book;
    }

    function burnBook(uint256 tokenId) external _requireMinted(tokenId) {
        _burn(tokenId);

        delete books[tokenId];
    }

    function getBook(uint256 tokenId) external view _requireMinted(tokenId) returns (Book memory) {
        return books[tokenId];
    }
}