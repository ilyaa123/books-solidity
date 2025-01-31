// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "../IERC721.sol";

contract MockERC721Receiver is ERC721TokenReceiver {
    function onERC721Received(
        address /*_operator*/,
        address /*_from*/,
        uint256 /*_tokenId*/,
        bytes calldata /*_data*/
    ) external pure returns(bytes4) {
        return ERC721TokenReceiver.onERC721Received.selector;
    }
}