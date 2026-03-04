// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TravelSolutions — Binary Flight Delay Insurance
/// @notice Chainlink Automation compatible. Policies auto-expire via Keepers.
contract TravelSolutions is EIP712 {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MAX_PAYOUT_CAP = 10_000_000e6;
    uint256 private _nonce;

    bytes32 public constant QUOTE_TYPEHASH =
        keccak256(
            "Quote(string flightId,uint256 requestedPayout,uint256 nDelayed,uint256 nTotal,address policyholder)"
        );

    struct FlightPolicy {
        address policyholder;
        uint256 premium;
        uint256 payout;
        uint256 status;
        uint256 expiresAt;
        string flightId;
    }

    mapping(bytes32 => FlightPolicy) public policies;
    bytes32[] public activePolicyIds;

    event PolicyCreated(
        bytes32 id,
        address holder,
        uint256 premium,
        uint256 payout,
        uint256 expiresAt
    );
    event PolicyClaimed(bytes32 id, uint256 payout);
    event PolicyExpired(bytes32 id);

    constructor(address _pool) EIP712("ReflexTravel", "1.0.0") {
        pool = ReflexLiquidityPool(_pool);
        owner = msg.sender;
    }

    function quotePremium(
        uint256 _nDelayed,
        uint256 _nTotal,
        uint256 _requestedPayout
    ) public pure returns (uint256) {
        require(_nTotal > 0, "Zero denominator");
        require(_nDelayed <= _nTotal, "Invalid history");
        uint256 baseExpectedLoss = (_requestedPayout * _nDelayed) / _nTotal;
        return
            (baseExpectedLoss * (BPS_DENOMINATOR + PROTOCOL_MARGIN)) /
            BPS_DENOMINATOR;
    }

    /// @dev Extracted to avoid stack-too-deep in purchasePolicy
    function _verifyQuote(
        string memory _flightId,
        uint256 _requestedPayout,
        uint256 _nDelayed,
        uint256 _nTotal,
        address _policyholder,
        bytes calldata _signature
    ) internal view {
        bytes32 structHash = keccak256(
            abi.encode(
                QUOTE_TYPEHASH,
                keccak256(bytes(_flightId)),
                _requestedPayout,
                _nDelayed,
                _nTotal,
                _policyholder
            )
        );
        address signer = ECDSA.recover(
            _hashTypedDataV4(structHash),
            _signature
        );
        require(signer == pool.authorizedQuoter(), "Invalid quoter signature");
    }

    function purchasePolicy(
        string memory _flightId,
        uint256 _requestedPayout,
        uint256 _nDelayed,
        uint256 _nTotal,
        uint256 _durationSeconds,
        bytes calldata _signature
    ) external returns (bytes32) {
        require(_durationSeconds > 0, "Invalid duration");
        _verifyQuote(
            _flightId,
            _requestedPayout,
            _nDelayed,
            _nTotal,
            msg.sender,
            _signature
        );

        uint256 premium = quotePremium(_nDelayed, _nTotal, _requestedPayout);
        uint256 expiry = block.timestamp + _durationSeconds;

        bytes32 policyId = keccak256(
            abi.encodePacked(_flightId, msg.sender, block.timestamp, _nonce++)
        );
        policies[policyId] = FlightPolicy(
            msg.sender,
            premium,
            _requestedPayout,
            0,
            expiry,
            _flightId
        );
        activePolicyIds.push(policyId);

        IERC20 usdc = pool.usdc();
        SafeERC20.safeTransferFrom(usdc, msg.sender, address(this), premium);
        usdc.approve(address(pool), premium);
        pool.routePremiumAndReserve(premium, _requestedPayout);
        emit PolicyCreated(
            policyId,
            msg.sender,
            premium,
            _requestedPayout,
            expiry
        );
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
        FlightPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        pol.status = 1;
        // Payout can be partial in consensus, but Travel is usually binary.
        // We support the passed value for flexibility.
        pool.releasePayout(pol.payout, _actualPayout, pol.policyholder);
        emit PolicyClaimed(_id, _actualPayout);
        _removeFromActive(_id);
    }

    function executeClaim(bytes32 _id, bool _delayedOver2Hours) external {
        require(msg.sender == owner, "Only authorized oracle");
        FlightPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");

        if (_delayedOver2Hours) {
            pol.status = 1;
            pool.releasePayout(pol.payout, pol.payout, pol.policyholder);
            emit PolicyClaimed(_id, pol.payout);
        } else {
            pol.status = 2;
            pool.releasePayout(pol.payout, 0, pol.policyholder);
            emit PolicyExpired(_id);
        }
        _removeFromActive(_id);
    }

    function expirePolicy(bytes32 _id) public {
        FlightPolicy storage pol = policies[_id];
        require(pol.status == 0, "Not active");
        require(block.timestamp >= pol.expiresAt, "Not expired yet");
        pol.status = 2;
        pool.releasePayout(pol.payout, 0, pol.policyholder);
        _removeFromActive(_id);
        emit PolicyExpired(_id);
    }

    // ── Chainlink Automation (Keepers) ──

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
