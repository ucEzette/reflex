// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";

contract EnergySolutions {
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct EnergyPolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 strikeIndex; // Base Temp Degree Days (e.g. 18 C tracking base)
        uint256 tickValue; // Value paid per point over strike
        uint256 status;
        string targetGrid; // e.g. "ERCOT", "CAISO"
    }

    mapping(bytes32 => EnergyPolicy) public policies;

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
        string memory _targetGrid,
        uint256 _maxPayout,
        uint256 _strikeIndex,
        uint256 _tickValue,
        uint256 _expectedRiskBase
    ) external returns (bytes32) {
        require(_tickValue > 0, "No tick value");

        uint256 premium = quotePremium(_expectedRiskBase);

        bytes32 policyId = keccak256(
            abi.encodePacked(_targetGrid, msg.sender, block.timestamp)
        );
        policies[policyId] = EnergyPolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            strikeIndex: _strikeIndex,
            tickValue: _tickValue,
            status: 0,
            targetGrid: _targetGrid
        });

        // Reserve capital
        pool.routePremiumAndReserve(premium, _maxPayout);

        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout);
        return policyId;
    }

    /// @notice Resolves based on absolute Heating Degree Days (HDD) or Cooling Degree Days (CDD)
    function executeClaim(bytes32 _id, uint256 _actualIndex) external {
        require(msg.sender == owner, "Only authorized oracle");
        EnergyPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_actualIndex > pol.strikeIndex) {
            pol.status = 1;

            // Calculate linear tick distance
            uint256 payout = (_actualIndex - pol.strikeIndex) * pol.tickValue;

            // Cap the payout to absolute maximum solvency limit
            if (payout > pol.maxPayout) {
                payout = pol.maxPayout;
            }

            pool.releasePayout(pol.maxPayout, payout, pol.policyholder);
            emit PolicyClaimed(_id, payout);
        } else {
            pol.status = 2;
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
    }
}
