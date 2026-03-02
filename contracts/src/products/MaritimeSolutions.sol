// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title MaritimeSolutions — Port Wind Speed Insurance
/// @notice Chainlink Automation compatible. Policies auto-expire via Keepers.
contract MaritimeSolutions {
    using SafeERC20 for IERC20;
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MAX_PAYOUT_CAP = 10_000_000e6;
    uint256 private _nonce;

    struct MaritimePolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 windSpeedStrike;
        uint256 status;
        uint256 expiresAt;
        string targetPort;
    }

    mapping(bytes32 => MaritimePolicy) public policies;
    bytes32[] public activePolicyIds;

    event PolicyCreated(
        bytes32 id,
        address holder,
        uint256 premium,
        uint256 maxPayout,
        uint256 expiresAt
    );
    event PolicyClaimed(bytes32 id, uint256 actualPayout);
    event PolicyExpired(bytes32 id);

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
        uint256 _expectedRiskBase,
        uint256 _durationSeconds
    ) external returns (bytes32) {
        require(_windSpeedStrike > 0, "Invalid Strike");
        require(_durationSeconds > 0, "Invalid duration");

        uint256 premium = quotePremium(_expectedRiskBase);
        uint256 expiry = block.timestamp + _durationSeconds;

        bytes32 policyId = keccak256(
            abi.encodePacked(_targetPort, msg.sender, block.timestamp, _nonce++)
        );
        policies[policyId] = MaritimePolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            windSpeedStrike: _windSpeedStrike,
            status: 0,
            expiresAt: expiry,
            targetPort: _targetPort
        });
        activePolicyIds.push(policyId);

        IERC20 usdc = pool.usdc();
        SafeERC20.safeTransferFrom(usdc, msg.sender, address(this), premium);
        usdc.approve(address(pool), premium);
        pool.routePremiumAndReserve(premium, _maxPayout);
        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout, expiry);
        return policyId;
    }

    function executeClaim(bytes32 _id, uint256 _actualWindSpeed) external {
        require(msg.sender == owner, "Only authorized oracle");
        MaritimePolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_actualWindSpeed >= pol.windSpeedStrike) {
            pol.status = 1;
            pool.releasePayout(pol.maxPayout, pol.maxPayout, pol.policyholder);
            emit PolicyClaimed(_id, pol.maxPayout);
        } else {
            pol.status = 2;
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
        _removeFromActive(_id);
    }

    function expirePolicy(bytes32 _id) public {
        MaritimePolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");
        require(block.timestamp >= pol.expiresAt, "Not expired yet");
        pol.status = 2;
        pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        _removeFromActive(_id);
        emit PolicyExpired(_id);
    }

    function checkUpkeep(
        bytes calldata
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        bytes32[] memory toExpire = new bytes32[](activePolicyIds.length);
        uint256 count = 0;
        for (uint256 i = 0; i < activePolicyIds.length; i++) {
            bytes32 pid = activePolicyIds[i];
            if (
                policies[pid].status == 0 &&
                block.timestamp >= policies[pid].expiresAt
            ) {
                toExpire[count++] = pid;
            }
        }
        upkeepNeeded = count > 0;
        bytes32[] memory trimmed = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) trimmed[i] = toExpire[i];
        performData = abi.encode(trimmed);
    }

    function performUpkeep(bytes calldata performData) external {
        bytes32[] memory toExpire = abi.decode(performData, (bytes32[]));
        for (uint256 i = 0; i < toExpire.length; i++) {
            if (
                policies[toExpire[i]].status == 0 &&
                block.timestamp >= policies[toExpire[i]].expiresAt
            ) {
                expirePolicy(toExpire[i]);
            }
        }
    }

    function getActivePolicyCount() external view returns (uint256) {
        return activePolicyIds.length;
    }

    function _removeFromActive(bytes32 _id) internal {
        for (uint256 i = 0; i < activePolicyIds.length; i++) {
            if (activePolicyIds[i] == _id) {
                activePolicyIds[i] = activePolicyIds[
                    activePolicyIds.length - 1
                ];
                activePolicyIds.pop();
                break;
            }
        }
    }
}
