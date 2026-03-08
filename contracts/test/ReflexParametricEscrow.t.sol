// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReflexParametricEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockTeleporter {
    function sendCrossChainMessage(
        TeleporterMessageInput memory
    ) public returns (bytes32) {
        return keccak256("teleporter_msg");
    }
}

contract ReflexParametricEscrowTest is Test {
    ReflexParametricEscrow public escrow;
    MockUSDC public usdc;
    MockTeleporter public teleporter;

    address public admin = address(1);
    address public user = address(2);
    address public treasury = address(3);
    bytes32 public constant L1_CHAIN_ID = keccak256("reflex-l1");

    uint256 public constant PREMIUM = 5e6;
    uint256 public constant PAYOUT = 200e6;
    uint256 public constant DURATION = 720; // 720 hours

    function setUp() public {
        vm.startPrank(admin);
        usdc = new MockUSDC();
        teleporter = new MockTeleporter();

        // Deploy via Proxy
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();
        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            address(teleporter),
            address(usdc),
            L1_CHAIN_ID,
            treasury,
            admin,
            1
        );
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        escrow = ReflexParametricEscrow(address(proxy));

        usdc.mint(treasury, 10000e6);
        vm.stopPrank();

        vm.prank(treasury);
        usdc.approve(address(escrow), type(uint256).max);

        // Setup user
        vm.startPrank(user);
        usdc.mint(user, 100e6);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();
    }

    function testPurchasePolicy() public {
        vm.startPrank(user);
        string memory flightId = "AA123";
        bytes32 expectedPolicyId = keccak256(
            abi.encodePacked(user, flightId, block.timestamp, uint256(0))
        );

        vm.expectEmit(true, true, false, true);
        emit ReflexParametricEscrow.PolicyPurchased(
            expectedPolicyId,
            user,
            flightId,
            PREMIUM,
            PAYOUT,
            block.timestamp + (DURATION * 1 hours)
        );

        bytes32 policyId = escrow.purchasePolicy(
            flightId,
            PREMIUM,
            PAYOUT,
            DURATION
        );

        (address policyholder, , , , , , ) = escrow.getPolicy(policyId);
        assertEq(policyholder, user);
        vm.stopPrank();
    }

    function testClaimPolicyFlow() public {
        vm.startPrank(user);
        bytes32 policyId = escrow.purchasePolicy(
            "AA123",
            PREMIUM,
            PAYOUT,
            DURATION
        );
        vm.stopPrank();

        bytes memory proof = new bytes(100);
        proof[0] = 0x01; // non-zero claim hash
        bytes memory message = abi.encode(policyId, proof);

        vm.prank(address(teleporter));
        escrow.receiveTeleporterMessage(L1_CHAIN_ID, address(0), message);

        (, , , , , bool isActive, bool isClaimed) = escrow.getPolicy(policyId);
        assertFalse(isActive);
        assertTrue(isClaimed);
        assertEq(usdc.balanceOf(user), 100e6 - PREMIUM + PAYOUT);
    }
}
