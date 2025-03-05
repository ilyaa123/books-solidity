// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "./RoleAccessControl.sol";

contract MockRoleAccessControl is RoleAccessControl {
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function checkRole(bytes32 role) external view  {
        _checkRole(role);
    }

    function checkRole(bytes32 role, address account) external view  {
        _checkRole(role, account);
    }

    function setRoleAdmin(bytes32 role, bytes32 adminRole) external  {
        _setRoleAdmin(role, adminRole);
    }
}