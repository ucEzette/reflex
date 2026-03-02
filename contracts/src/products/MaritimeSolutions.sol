// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";

contract MaritimeSolutions {
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct MaritimePolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 windSpeedStrike; // Knots defining a port-closure trigger
        uint256 status;
        string targetPort; // e.g. "US-LGB" for Long Beach
    }

    mapping(bytes32 => MaritimePolicy) public policies;

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
        string memory _targetPort,
        uint256 _maxPayout,
        uint256 _windSpeedStrike,
        uint256 _expectedRiskBase
    ) external returns (bytes32) {
        require(_windSpeedStrike > 0, "Invalid Strike");

        uint256 premium = quotePremium(_expectedRiskBase);

        bytes32 policyId = keccak256(
            abi.encodePacked(_targetPort, msg.sender, block.timestamp)
        );
        policies[policyId] = MaritimePolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            windSpeedStrike: _windSpeedStrike,
            status: 0,
            targetPort: _targetPort
        });

        // Reserve capital precisely matching expected payout
        pool.routePremiumAndReserve(premium, _maxPayout);

        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout);
        return policyId;
    }

    /// @notice Resolves based on confirmed sustained maritime windspeed exceeding safe harbor operational thresholds
    function executeClaim(bytes32 _id, uint256 _actualWindSpeed) external {
        require(msg.sender == owner, "Only authorized oracle");
        MaritimePolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_actualWindSpeed >= pol.windSpeedStrike) {
            pol.status = 1;
            pool.releasePayout(pol.maxPayout, pol.maxPayout, pol.policyholder);
            emit PolicyClaimed(_id, pol.maxPayout);
        } else {
            pol.status = 2; // Port remained open, no demurrage triggered
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
    }
}
