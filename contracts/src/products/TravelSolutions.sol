// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../ReflexLiquidityPool.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract TravelSolutions is EIP712 {
    using ECDSA for bytes32;

    ReflexLiquidityPool public immutable pool;
    address public immutable owner;

    // Margin (M) in basis points: e.g. 500 = 5% over pure math probability
    uint256 public constant PROTOCOL_MARGIN = 500;
    uint256 public constant BPS_DENOMINATOR = 10000;

    bytes32 public constant QUOTE_TYPEHASH =
        keccak256(
            "Quote(string flightId,uint256 requestedPayout,uint256 nDelayed,uint256 nTotal,address policyholder)"
        );

    struct FlightPolicy {
        address policyholder;
        uint256 premium;
        uint256 payout;
        uint256 status; // 0 = active, 1 = claimed, 2 = expired
        string flightId;
    }

    mapping(bytes32 => FlightPolicy) public policies;

    event PolicyCreated(
        bytes32 id,
        address holder,
        uint256 premium,
        uint256 payout
    );
    event PolicyClaimed(bytes32 id, uint256 payout);

    constructor(address _pool) EIP712("ReflexTravel", "1.0.0") {
        pool = ReflexLiquidityPool(_pool);
        owner = msg.sender;
    }

    /// @notice Calculates probability (P) strictly based on delays vs total historical flights
    function quotePremium(
        uint256 _nDelayed,
        uint256 _nTotal,
        uint256 _requestedPayout
    ) public pure returns (uint256) {
        require(_nTotal > 0, "Zero denominator");
        require(_nDelayed <= _nTotal, "Invalid history");

        uint256 baseExpectedLoss = (_requestedPayout * _nDelayed) / _nTotal;
        uint256 premium = (baseExpectedLoss *
            (BPS_DENOMINATOR + PROTOCOL_MARGIN)) / BPS_DENOMINATOR;

        return premium;
    }

    /// @notice Purchases a binary delay policy with a signed quote from an authorized provider
    function purchasePolicy(
        string memory _flightId,
        uint256 _requestedPayout,
        uint256 _nDelayed,
        uint256 _nTotal,
        bytes calldata _signature
    ) external returns (bytes32) {
        // 1. Verify EIP-712 Signature
        bytes32 structHash = keccak256(
            abi.encode(
                QUOTE_TYPEHASH,
                keccak256(bytes(_flightId)),
                _requestedPayout,
                _nDelayed,
                _nTotal,
                msg.sender
            )
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, _signature);
        require(signer == pool.authorizedQuoter(), "Invalid quoter signature");

        // 2. Pricing Logic
        uint256 premium = quotePremium(_nDelayed, _nTotal, _requestedPayout);

        bytes32 policyId = keccak256(
            abi.encodePacked(_flightId, msg.sender, block.timestamp)
        );
        policies[policyId] = FlightPolicy({
            policyholder: msg.sender,
            premium: premium,
            payout: _requestedPayout,
            status: 0,
            flightId: _flightId
        });

        // 3. Execution
        pool.routePremiumAndReserve(premium, _requestedPayout);

        emit PolicyCreated(policyId, msg.sender, premium, _requestedPayout);
        return policyId;
    }

    /// @notice Resolves the binary trigger. If resolved positively, LPs release complete capital.
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
        }
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        performData = "";
    }

    function performUpkeep(bytes calldata /* performData */) external {}
}
