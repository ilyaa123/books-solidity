// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./proxy/CloneFactory.sol";
import "./BookPaywall.sol";

contract BookPaywallFactory is CloneFactory {
    event PaywallCreated(address indexed paywallAddress, address indexed owner, address bookNFT, address token);

    address public immutable libraryAddress; 

    mapping(address => address[]) public userPaywalls;

    constructor() {
        libraryAddress = address(new BookPaywall());
    }

    function createPaywall(address bookNFT, address token) external returns (address) {
        address clone = createClone(libraryAddress);
        
        BookPaywall paywall = BookPaywall(clone);
        paywall.initialize(bookNFT, token);

        userPaywalls[msg.sender].push(clone);
        emit PaywallCreated(clone, msg.sender, bookNFT, token);

        return clone;
    }

    function getUserPaywalls(address user) external view returns (address[] memory) {
        return userPaywalls[user];
    }
}
