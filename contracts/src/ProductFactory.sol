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
    address[] public products;

    event ProductDeployed(string name, address productAddress);
    event ProtocolPaused(address product);

    constructor(address _pool) {
        pool = ReflexLiquidityPool(_pool);
        owner = msg.sender;
    }

    // Deploys a generic product and automatically authorizes it into the LP pool
    function authorizeProduct(string memory _name, address _product) external {
        require(msg.sender == owner, "Only owner");

        // Factory acts as the admin proxy to the pool
        pool.setAuthorizedProduct(_product, true);
        products.push(_product);

        emit ProductDeployed(_name, _product);
    }

    /**
     * @notice Emergency function to pause all products in the ecosystem.
     * Revokes pool authorization for every product managed by this factory.
     */
    function emergencyPauseAllProducts() external {
        require(msg.sender == owner, "Only owner");
        for (uint256 i = 0; i < products.length; i++) {
            pool.setAuthorizedProduct(products[i], false);
            emit ProtocolPaused(products[i]);
        }
    }
}
