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



contract ReflexParametricEscrowUpgradeTest is Test {
    ReflexParametricEscrow public escrow; // This will point to the proxy
    ReflexParametricEscrow public implementation;
    MockUSDC public usdc;


    address public admin = address(1);
    address public user = address(2);
    address public treasury = address(3);


    uint256 public constant PREMIUM = 5e6;
    uint256 public constant PAYOUT = 200e6;
    uint256 public constant DURATION = 720;

    function setUp() public {
        vm.startPrank(admin);
        usdc = new MockUSDC();


        // 1. Deploy Implementation
        implementation = new ReflexParametricEscrow();

        // 2. Deploy Proxy
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

        // 3. Cast Proxy to Implementation interface
        escrow = ReflexParametricEscrow(address(proxy));

        usdc.mint(treasury, 10000e6);
        vm.stopPrank();

        vm.prank(treasury);
        usdc.approve(address(escrow), type(uint256).max);

        vm.startPrank(user);
        usdc.mint(user, 100e6);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();
    }

    function testUpgrade() public {
        vm.startPrank(admin);

        // Deploy a new V2 implementation
        ReflexParametricEscrowV2 v2Impl = new ReflexParametricEscrowV2();

        // Upgrade the proxy to V2
        escrow.upgradeToAndCall(address(v2Impl), "");

        // Verify state is preserved
        assertEq(address(escrow.usdc()), address(usdc));

        // Verify V2 behavior
        ReflexParametricEscrowV2 v2Escrow = ReflexParametricEscrowV2(
            address(escrow)
        );
        assertEq(v2Escrow.version(), "V2");

        vm.stopPrank();
    }

    function testUnauthorizedUpgradeFails() public {
        vm.startPrank(user);
        ReflexParametricEscrowV2 v2Impl = new ReflexParametricEscrowV2();
        vm.expectRevert();
        escrow.upgradeToAndCall(address(v2Impl), "");
        vm.stopPrank();
    }
}

// Minimal V2 for testing upgradeability
contract ReflexParametricEscrowV2 is ReflexParametricEscrow {
    function version() public pure returns (string memory) {
        return "V2";
    }
}
