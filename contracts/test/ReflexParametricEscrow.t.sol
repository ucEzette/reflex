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



contract ReflexParametricEscrowTest is Test {
    ReflexParametricEscrow public escrow;
    MockUSDC public usdc;


    address public admin = address(1);
    address public user = address(2);
    address public treasury = address(3);


    uint256 public constant PREMIUM = 5e6;
    uint256 public constant PAYOUT = 200e6;
    uint256 public constant DURATION = 720; // 720 hours

    function setUp() public {
        vm.startPrank(admin);
        usdc = new MockUSDC();


        // Deploy via Proxy
        ReflexParametricEscrow implementation = new ReflexParametricEscrow();
        bytes memory initData = abi.encodeWithSelector(
            ReflexParametricEscrow.initialize.selector,
            address(usdc),
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


}
