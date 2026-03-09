// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title AgricultureIndex — Cumulative Rainfall Insurance
/// @notice Chainlink Automation compatible. Policies auto-expire via Keepers.
contract AgricultureIndex {
    using SafeERC20 for IERC20;
    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MAX_PAYOUT_CAP = 10_000_000e6; // $10M cap
    uint256 private _nonce;

    struct AgPolicy {
        address policyholder;
        uint256 premium;
        uint256 maxPayout;
        uint256 strikeIndex;
        uint256 exitIndex;
        uint256 status; // 0 = active, 1 = claimed, 2 = expired
        uint256 expiresAt;
        string geographicZone;
    }

    mapping(bytes32 => AgPolicy) public policies;
    bytes32[] public activePolicyIds;
    mapping(address => bytes32[]) public userPolicies;

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
        uint256 _expectedPayoutValue
    ) public pure returns (uint256) {
        return
            (_expectedPayoutValue * (BPS_DENOMINATOR + PROTOCOL_MARGIN)) /
            BPS_DENOMINATOR;
    }

    function purchasePolicy(
        string memory _geoZone,
        uint256 _maxPayout,
        uint256 _strike,
        uint256 _exit,
        uint256 _expectedRiskBase,
        uint256 _durationSeconds
    ) external returns (bytes32) {
        require(_strike > _exit, "Invalid threshold bounds");
        require(_durationSeconds > 0, "Invalid duration");
        require(
            _maxPayout > 0 && _maxPayout <= MAX_PAYOUT_CAP,
            "Invalid maxPayout"
        );

        uint256 premium = quotePremium(_expectedRiskBase);
        uint256 expiry = block.timestamp + _durationSeconds;

        bytes32 policyId = keccak256(
            abi.encodePacked(_geoZone, msg.sender, block.timestamp, _nonce++)
        );
        policies[policyId] = AgPolicy({
            policyholder: msg.sender,
            premium: premium,
            maxPayout: _maxPayout,
            strikeIndex: _strike,
            exitIndex: _exit,
            status: 0,
            expiresAt: expiry,
            geographicZone: _geoZone
        });
        activePolicyIds.push(policyId);
        userPolicies[msg.sender].push(policyId);

        IERC20 usdc = pool.usdc();
        SafeERC20.safeTransferFrom(usdc, msg.sender, address(this), premium);
        usdc.approve(address(pool), premium);
        pool.routePremiumAndReserve(premium, _maxPayout);
        emit PolicyCreated(policyId, msg.sender, premium, _maxPayout, expiry);
        return policyId;
    }

    address public consensusManager;

    function setConsensusManager(address _manager) external {
        require(msg.sender == owner, "Only owner");
        consensusManager = _manager;
    }

    function submitConsensusClaim(bytes32 _id, uint256 _actualPayout) external {
        require(
            msg.sender == consensusManager,
            "Only authorized consensus manager"
        );
        AgPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        pol.status = 1;
        pool.releasePayout(pol.maxPayout, _actualPayout, pol.policyholder);
        emit PolicyClaimed(_id, _actualPayout);
        _removeFromActive(_id);
    }

    function executeClaim(bytes32 _id, uint256 _actualIndex) external {
        require(msg.sender == owner, "Only authorized oracle");
        AgPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_actualIndex < pol.strikeIndex) {
            pol.status = 1;
            uint256 payout;
            if (_actualIndex <= pol.exitIndex) {
                payout = pol.maxPayout;
            } else {
                uint256 distanceDown = pol.strikeIndex - _actualIndex;
                uint256 totalRange = pol.strikeIndex - pol.exitIndex;
                payout = (distanceDown * pol.maxPayout) / totalRange;
            }
            pool.releasePayout(pol.maxPayout, payout, pol.policyholder);
            emit PolicyClaimed(_id, payout);
        } else {
            pol.status = 2;
            pool.releasePayout(pol.maxPayout, 0, pol.policyholder);
        }
        _removeFromActive(_id);
    }

    function expirePolicy(bytes32 _id) public {
        AgPolicy storage pol = policies[_id];
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

    function getUserPolicies(
        address _user
    ) external view returns (bytes32[] memory) {
        return userPolicies[_user];
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
