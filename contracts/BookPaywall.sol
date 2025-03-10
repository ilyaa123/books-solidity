// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./tokens/ERC721/IERC721.sol";
import "./tokens/ERC20/IERC20.sol";

contract BookPaywall {
    IERC721 public bookNFT;
    IERC20 public token;

    bool private initialized;
    mapping(uint256 => uint256) public contentPrice;
    mapping(address => mapping(uint256 => uint256)) public accessExpiration;

    event AccessPurchased(address indexed buyer, uint256 tokenId, uint256 expiration);
    event ContentPriceUpdated(uint256 tokenId, uint256 newPrice);

    function initialize(address _bookNFT, address _token) external {
        require(!initialized, "Already initialized");
        initialized = true;
        bookNFT = IERC721(_bookNFT);
        token = IERC20(_token);
    }

    function setContentPrice(uint256 tokenId, uint256 price) external {
        require(bookNFT.ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        contentPrice[tokenId] = price;
        emit ContentPriceUpdated(tokenId, price);
    }

    function purchaseAccess(uint256 tokenId, uint256 duration) external {
        uint256 price = contentPrice[tokenId];
        address seller = bookNFT.ownerOf(tokenId);
        require(price > 0, "Content not for sale");
        require(token.balanceOf(msg.sender) >= price, "Not enough tokens");
        require(token.allowance(msg.sender, address(this)) >= price, "Approve tokens first");

        token.transferFrom(msg.sender, seller, price);

        if (accessExpiration[msg.sender][tokenId] < block.timestamp) {
            accessExpiration[msg.sender][tokenId] = block.timestamp + duration;
        } else {
            accessExpiration[msg.sender][tokenId] += duration;
        }

        emit AccessPurchased(msg.sender, tokenId, accessExpiration[msg.sender][tokenId]);
    }

    function hasAccess(address buyer, uint256 tokenId) external view returns (bool) {
        return accessExpiration[buyer][tokenId] > block.timestamp;
    }
}
