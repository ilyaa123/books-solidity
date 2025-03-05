// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./IERC20.sol";
import "./IERC20Errors.sol";

contract ERC20 is IERC20, IERC20Errors {
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert ERC20InvalidApprover(msg.sender);
        _;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        if (_to == address(0)) revert ERC20InvalidReceiver(_to);
        if (_balances[msg.sender] < _value) revert ERC20InsufficientBalance(msg.sender, _balances[msg.sender], _value);

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        _approve(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        return _allowances[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        if (_from == address(0)) revert ERC20InvalidSender(_from);
        if (_to == address(0)) revert ERC20InvalidReceiver(_to);
        if (_balances[_from] < _value) revert ERC20InsufficientBalance(_from, _balances[_from], _value);
        if (_allowances[_from][msg.sender] < _value) revert ERC20InsufficientAllowance(msg.sender, _allowances[_from][msg.sender], _value);

        _balances[_from] -= _value;
        _balances[_to] += _value;

        if (_allowances[_from][msg.sender] != type(uint256).max) {
            _allowances[_from][msg.sender] -= _value;
            emit Approval(_from, msg.sender, _allowances[_from][msg.sender]);
        }

        emit Transfer(_from, _to, _value);
        return true;
    }

    function _approve(address _owner, address _spender, uint256 _value) internal {
        if (_spender == address(0)) revert ERC20InvalidSpender(_spender);
        _allowances[_owner][_spender] = _value;
        emit Approval(_owner, _spender, _value);
    }


    function _mint(address _to, uint256 _amount) internal onlyOwner {
        if (_to == address(0)) revert ERC20InvalidReceiver(_to);

        totalSupply += _amount;
        _balances[_to] += _amount;

        emit Transfer(address(0), _to, _amount);
    }

    function _burn(uint256 _amount) internal {
        if (_balances[msg.sender] < _amount) revert ERC20InsufficientBalance(msg.sender, _balances[msg.sender], _amount);

        _balances[msg.sender] -= _amount;
        totalSupply -= _amount;

        emit Transfer(msg.sender, address(0), _amount);
    }
}
