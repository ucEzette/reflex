// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";

contract CatastropheProximity {
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct CatPolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 tier1Radius; // Distance in meters (100% payout)
        uint256 tier2Radius; // Distance in meters (50% payout)
        uint256 status;
        string targetCoordinates; // e.g. "34.0522,-118.2437"
    }

    mapping(bytes32 => CatPolicy) public policies;

    event PolicyCreated(
        bytes32 id,
        address holder,
        uint256 premium,
        uint256 maxPayout
    );
    event PolicyClaimed(bytes32 id, uint256 actualPayout);

    constructor(address _pool) {
        pool = ReflexLiquidityPool(_pool);
        owner = msg.sender;
    }

    function quotePremium(
        uint256 _expectedRiskBase
    ) public pure returns (uint256) {
        return
            (_expectedRiskBase * (BPS_DENOMINATOR + PROTOCOL_MARGIN)) /
            BPS_DENOMINATOR;
    }

    function purchasePolicy(
        string memory _targetCoordinates,
        uint256 _maxPayout,
        uint256 _tier1Radius,
        uint256 _tier2Radius,
        uint256 _expectedRiskBase
    ) external returns (bytes32) {
        require(_tier1Radius < _tier2Radius, "Invalid ring sizing");

        uint256 premium = quotePremium(_expectedRiskBase);

        bytes32 policyId = keccak256(
            abi.encodePacked(_targetCoordinates, msg.sender, block.timestamp)
        );
        policies[policyId] = CatPolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            tier1Radius: _tier1Radius,
            tier2Radius: _tier2Radius,
            status: 0,
            targetCoordinates: _targetCoordinates
        });

        // Reserve capital
        pool.routePremiumAndReserve(premium, _maxPayout);

        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout);
        return policyId;
    }

    /// @notice Resolves based on Chainlink executing a JS Haversine calculation finding true radial vector
    /// @param _distanceMeters The true distance from user parameter to epicenter mapped by Oracle
    function executeClaim(bytes32 _id, uint256 _distanceMeters) external {
        require(msg.sender == owner, "Only authorized oracle");
        CatPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_distanceMeters < pol.tier1Radius) {
            pol.status = 1;
            pool.releasePayout(pol.maxPayout, pol.maxPayout, pol.policyholder);
            emit PolicyClaimed(_id, pol.maxPayout);
        } else if (_distanceMeters < pol.tier2Radius) {
            pol.status = 1;
            uint256 payout = pol.maxPayout / 2;
            pool.releasePayout(pol.maxPayout, payout, pol.policyholder);
            emit PolicyClaimed(_id, payout);
        } else {
            pol.status = 2; // Event safely far away
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
    }
}
