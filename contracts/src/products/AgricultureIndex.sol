// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";

contract AgricultureIndex {
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500; // 5% added to expected risk
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct AgPolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 strikeIndex; // The threshold where payouts begin (e.g. 100mm of rain)
        uint256 exitIndex; // The threshold where payouts reach 100% max (e.g. 50mm of rain)
        uint256 status; // 0 = active, 1 = claimed, 2 = expired
        string geographicZone; // Maps to NOAA API quadrant
    }

    mapping(bytes32 => AgPolicy) public policies;

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

    /// @notice Calculates a linear payout premium estimate.
    /// In a production environment, actuarial pricing here uses Monte Carlo.
    function quotePremium(
        uint256 _expectedPayoutValue
    ) public pure returns (uint256) {
        return
            (_expectedPayoutValue * (BPS_DENOMINATOR + PROTOCOL_MARGIN)) /
            BPS_DENOMINATOR;
    }

    /// @notice Purchases a continuous linear trigger policy.
    function purchasePolicy(
        string memory _geoZone,
        uint256 _maxPayout,
        uint256 _strike,
        uint256 _exit,
        uint256 _expectedRiskBase
    ) external returns (bytes32) {
        require(_strike > _exit, "Invalid threshold bounds");

        uint256 premium = quotePremium(_expectedRiskBase);

        bytes32 policyId = keccak256(
            abi.encodePacked(_geoZone, msg.sender, block.timestamp)
        );
        policies[policyId] = AgPolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            strikeIndex: _strike,
            exitIndex: _exit,
            status: 0,
            geographicZone: _geoZone
        });

        // Push premium into the LP pool and reserve capital
        // We MUST reserve the absolute mathematical maximum possible execution to protect LP solvency
        pool.routePremiumAndReserve(premium, _maxPayout);

        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout);
        return policyId;
    }

    /// @notice Resolves the continuous trigger based on cumulative weather index
    /// @param _actualIndex The final registered cumulative index from the Chainlink DON
    function executeClaim(bytes32 _id, uint256 _actualIndex) external {
        require(msg.sender == owner, "Only authorized oracle");
        AgPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_actualIndex < pol.strikeIndex) {
            pol.status = 1;

            uint256 payout;
            if (_actualIndex <= pol.exitIndex) {
                // Full maximum payout limit triggered
                payout = pol.maxPayout;
            } else {
                // Partial linear payout: Payout = ((Strike - Actual) / (Strike - Exit)) * MaxPayout
                uint256 distanceDown = pol.strikeIndex - _actualIndex;
                uint256 totalRange = pol.strikeIndex - pol.exitIndex;
                payout = (distanceDown * pol.maxPayout) / totalRange;
            }

            pool.releasePayout(pol.maxPayout, payout, pol.policyholder);
            emit PolicyClaimed(_id, payout);
        } else {
            pol.status = 2; // Failed to hit strike, expired worthless for user, pure profit for LP Protocol
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
    }
}
