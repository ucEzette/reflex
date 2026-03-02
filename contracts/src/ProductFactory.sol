// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReflexLiquidityPool.sol";

// Abstract base class for all mathematical parametric modules
abstract contract ReflexProduct {
    ReflexLiquidityPool public pool;
    address public initialOwner;

    modifier onlyOwner() {
        require(msg.sender == initialOwner, "Not owner");
        _;
    }

    constructor(address _pool, address _owner) {
        pool = ReflexLiquidityPool(_pool);
        initialOwner = _owner;
    }
}

contract ProductFactory {
    ReflexLiquidityPool public pool;
    address public owner;

    event ProductDeployed(string name, address productAddress);

    constructor(address _pool) {
        pool = ReflexLiquidityPool(_pool);
        owner = msg.sender;
    }

    // Deploys a generic product and automatically authorizes it into the LP pool
    // In a production environment, this would use CREATE2 or a precise proxy architecture
    // For this scope, it authorizes the returned address.
    function authorizeProduct(string memory _name, address _product) external {
        require(msg.sender == owner, "Only owner");

        // Factory acts as the admin proxy to the pool
        pool.setAuthorizedProduct(_product, true);

        emit ProductDeployed(_name, _product);
    }
}
