// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC721.sol";

contract ERC721 is IERC721 {
    
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _owners;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    modifier _requireMinted(uint256 _tokenId) {
        require(_owners[_tokenId] != address(0), "Token does not exist!");
        _;
    }

    modifier _requireApprovedOrOwner(address _spender, uint256 _tokenId) {
        address owner = ownerOf(_tokenId);

        require(_spender == owner || isApprovedForAll(owner, _spender) || getApproved(_tokenId) == _spender, "Not an owner or approved!");

        _;
    }

    function _checkOnERC721Received(address _from, address _to, uint256 _tokenId, bytes calldata _data) private returns (bool) {
        if (_to.code.length > 0) {
            try ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data) returns (bytes4 ret) {
                return ret == ERC721TokenReceiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("Non erc721 receiver!");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    function _transfer (address _from, address _to, uint256 _tokenId) internal {
        require(ownerOf(_tokenId) == _from, "Not an owner!");
        require(_to != address(0), "To cannot be zero address!");
        require(_from != _to, "Transfer to the same address!");

        _balances[_from]--;
        _balances[_to]++;
        _owners[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    function _burn(uint256 _tokenId) internal virtual _requireMinted(_tokenId) _requireApprovedOrOwner(msg.sender, _tokenId) {
        address owner = ownerOf(_tokenId);

        delete _tokenApprovals[_tokenId];

        _balances[owner]--;

        delete _owners[_tokenId];

        emit Transfer(owner, address(0), _tokenId);
    }

    function _mint(address to, uint256 tokenId) internal virtual {
        require(_owners[tokenId] == address(0), "Token already minted");
        require(to != address(0), "Mint to the zero address");
        
        _owners[tokenId] = to;
        _balances[to]++;

        emit Transfer(address(0), to, tokenId);
    }

    function _safeMint(address to, uint256 tokenId, bytes calldata data) internal virtual {
        require(_owners[tokenId] == address(0), "Token already minted");
        require(to != address(0), "Mint to the zero address");
        require(_checkOnERC721Received(address(0), to, tokenId, data), "Non ERC721 Receiver");

        _owners[tokenId] = to;
        _balances[to]++;

        emit Transfer(address(0), to, tokenId);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Zero address!");

        return _balances[_owner];
    }

    function ownerOf(uint256 _tokenId) public view _requireMinted(_tokenId) returns (address) {
        return _owners[_tokenId];
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable _requireApprovedOrOwner(msg.sender, _tokenId) {
        require(_checkOnERC721Received(_from, _to, _tokenId, data), "Non ERC721 Receiver");

        _transfer(_from, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external payable _requireApprovedOrOwner(msg.sender, _tokenId) {
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external payable {
        address owner = ownerOf(_tokenId);

        require(owner == msg.sender || isApprovedForAll(owner, msg.sender), "Not an owner!");
        require(_approved != owner, "Cannot approve to self");

        _tokenApprovals[_tokenId] = _approved;

        emit Approval(owner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external {
        require(_operator != msg.sender, "You cannot approve yourself!");

        _operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint256 _tokenId) public view _requireMinted(_tokenId) returns (address) {
        return _tokenApprovals[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return _operatorApprovals[_owner][_operator];
    }

}