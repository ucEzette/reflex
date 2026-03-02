// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReflexLiquidityPool.sol";
import "../src/products/TravelSolutions.sol";
import "../src/products/AgricultureIndex.sol";
import "../src/products/EnergySolutions.sol";
import "../src/products/CatastropheProximity.sol";
import "../src/products/MaritimeSolutions.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MockUSDC6 is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// Minimal Aave Mock
contract MockAavePool {
    function supply(address, uint256, address, uint16) external {}

    function withdraw(address, uint256, address) external returns (uint256) {
        return 0;
    }
}

contract MockAToken is ERC20 {
    constructor() ERC20("aUSDC", "aUSDC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract EnterpriseProductsTest is Test {
    MockUSDC6 public usdc;
    MockAavePool public aavePool;
    MockAToken public aToken;
    ReflexLiquidityPool public pool;

    TravelSolutions public travel;
    AgricultureIndex public agri;
    EnergySolutions public energy;
    CatastropheProximity public cat;
    MaritimeSolutions public maritime;

    address public admin = address(1);
    address public lp = address(2);
    address public user = address(3);
    address public quoter = address(4);

    uint256 public constant LP_DEPOSIT = 100_000e6; // 100k USDC
    uint256 public constant THIRTY_DAYS = 30 days;

    function setUp() public {
        vm.startPrank(admin);

        // Deploy mocks
        usdc = new MockUSDC6();
        aavePool = new MockAavePool();
        aToken = new MockAToken();

        // Deploy LP Pool via proxy
        ReflexLiquidityPool impl = new ReflexLiquidityPool();
        bytes memory initData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            address(usdc),
            admin, // protocolTreasury
            address(aavePool),
            address(aToken),
            quoter // authorizedQuoter
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        pool = ReflexLiquidityPool(address(proxy));

        // Deploy products
        travel = new TravelSolutions(address(pool));
        agri = new AgricultureIndex(address(pool));
        energy = new EnergySolutions(address(pool));
        cat = new CatastropheProximity(address(pool));
        maritime = new MaritimeSolutions(address(pool));

        // Register products with pool
        pool.setAuthorizedProduct(address(travel), true);
        pool.setAuthorizedProduct(address(agri), true);
        pool.setAuthorizedProduct(address(energy), true);
        pool.setAuthorizedProduct(address(cat), true);
        pool.setAuthorizedProduct(address(maritime), true);

        // Set quoter
        pool.setAuthorizedQuoter(quoter);

        vm.stopPrank();

        // Seed LP with 100k USDC
        usdc.mint(lp, LP_DEPOSIT);
        vm.startPrank(lp);
        usdc.approve(address(pool), type(uint256).max);
        pool.depositLiquidity(LP_DEPOSIT);
        vm.stopPrank();

        // Seed user
        usdc.mint(user, 10_000e6);
        vm.startPrank(user);
        usdc.approve(address(pool), type(uint256).max);
        usdc.approve(address(travel), type(uint256).max);
        usdc.approve(address(agri), type(uint256).max);
        usdc.approve(address(energy), type(uint256).max);
        usdc.approve(address(cat), type(uint256).max);
        usdc.approve(address(maritime), type(uint256).max);
        vm.stopPrank();
    }

    // ── Agriculture Tests ──

    function testAgriPurchasePolicy() public {
        vm.prank(user);
        bytes32 policyId = agri.purchasePolicy(
            "ZONE-A", // geographic zone
            1000e6, // maxPayout
            100, // strike index
            50, // exit index
            50e6, // expected risk base
            THIRTY_DAYS // duration
        );

        (
            address holder,
            uint256 premium,
            uint256 maxPayout,
            ,
            ,
            ,
            uint256 expiresAt,

        ) = agri.policies(policyId);
        assertEq(holder, user);
        assertGt(premium, 0);
        assertEq(maxPayout, 1000e6);
        assertEq(expiresAt, block.timestamp + THIRTY_DAYS);
    }

    function testAgriLinearPayout() public {
        vm.prank(user);
        bytes32 policyId = agri.purchasePolicy(
            "ZONE-A",
            1000e6,
            100,
            50,
            50e6,
            THIRTY_DAYS
        );

        uint256 userBalBefore = usdc.balanceOf(user);

        // Oracle reports actual rainfall at 75 (between strike=100 and exit=50)
        // Payout = ((100 - 75) / (100 - 50)) * 1000e6 = 500e6
        vm.prank(admin);
        agri.executeClaim(policyId, 75);

        (, , , , , uint256 status, , ) = agri.policies(policyId);
        assertEq(status, 1); // Claimed

        uint256 userBalAfter = usdc.balanceOf(user);
        assertEq(userBalAfter - userBalBefore, 500e6);
    }

    // ── Energy Tests ──

    function testEnergyTickPayout() public {
        vm.prank(user);
        bytes32 policyId = energy.purchasePolicy(
            "ERCOT", // grid
            5000e6, // maxPayout
            100, // strike index (100 HDD)
            10e6, // tick value (10 USDC per point)
            50e6, // risk base
            THIRTY_DAYS
        );

        // Oracle reports 115 HDD → 15 points over strike → payout = 15 * 10e6 = 150e6
        uint256 userBalBefore = usdc.balanceOf(user);
        vm.prank(admin);
        energy.executeClaim(policyId, 115);

        uint256 userBalAfter = usdc.balanceOf(user);
        assertEq(userBalAfter - userBalBefore, 150e6);
    }

    // ── Catastrophe Tests ──

    function testCatTier1FullPayout() public {
        vm.prank(user);
        bytes32 policyId = cat.purchasePolicy(
            "34.0522,-118.2437", // coordinates
            2000e6, // maxPayout
            50000, // tier1: 50km
            200000, // tier2: 200km
            50e6, // risk base
            THIRTY_DAYS
        );

        // Earthquake 30km away → within tier1 → 100% payout
        uint256 userBalBefore = usdc.balanceOf(user);
        vm.prank(admin);
        cat.executeClaim(policyId, 30000); // 30km in meters

        uint256 userBalAfter = usdc.balanceOf(user);
        assertEq(userBalAfter - userBalBefore, 2000e6);
    }

    function testCatTier2HalfPayout() public {
        vm.prank(user);
        bytes32 policyId = cat.purchasePolicy(
            "34.0522,-118.2437",
            2000e6,
            50000,
            200000,
            50e6,
            THIRTY_DAYS
        );

        // Earthquake 100km away → within tier2 → 50% payout
        uint256 userBalBefore = usdc.balanceOf(user);
        vm.prank(admin);
        cat.executeClaim(policyId, 100000);

        uint256 userBalAfter = usdc.balanceOf(user);
        assertEq(userBalAfter - userBalBefore, 1000e6);
    }

    // ── Maritime Tests ──

    function testMaritimeWindTrigger() public {
        vm.prank(user);
        bytes32 policyId = maritime.purchasePolicy(
            "US-LGB", // port
            3000e6, // maxPayout
            34, // wind speed strike (34 knots = gale force)
            50e6, // risk base
            THIRTY_DAYS
        );

        // Wind at 40 knots → above strike → full payout
        uint256 userBalBefore = usdc.balanceOf(user);
        vm.prank(admin);
        maritime.executeClaim(policyId, 40);

        uint256 userBalAfter = usdc.balanceOf(user);
        assertEq(userBalAfter - userBalBefore, 3000e6);
    }

    // ── Expiration Tests ──

    function testPolicyAutoExpiration() public {
        vm.prank(user);
        bytes32 policyId = agri.purchasePolicy(
            "ZONE-A",
            1000e6,
            100,
            50,
            50e6,
            THIRTY_DAYS
        );

        // Policy should be active
        (, , , , , uint256 statusBefore, , ) = agri.policies(policyId);
        assertEq(statusBefore, 0);

        // Cannot expire before time
        vm.expectRevert("Not expired yet");
        agri.expirePolicy(policyId);

        // Warp past expiration
        vm.warp(block.timestamp + THIRTY_DAYS + 1);

        // Now expiration should work
        agri.expirePolicy(policyId);
        (, , , , , uint256 statusAfter, , ) = agri.policies(policyId);
        assertEq(statusAfter, 2); // Expired
    }

    // ── Keeper Automation Tests ──

    function testKeeperCheckAndPerformUpkeep() public {
        // Create 3 policies with different durations
        vm.startPrank(user);
        bytes32 pid1 = agri.purchasePolicy("Z1", 500e6, 100, 50, 25e6, 7 days);
        bytes32 pid2 = agri.purchasePolicy("Z2", 500e6, 100, 50, 25e6, 14 days);
        bytes32 pid3 = agri.purchasePolicy("Z3", 500e6, 100, 50, 25e6, 30 days);
        vm.stopPrank();

        assertEq(agri.getActivePolicyCount(), 3);

        // checkUpkeep should return false (no policies expired yet)
        (bool needed1, ) = agri.checkUpkeep("");
        assertFalse(needed1);

        // Warp 8 days → pid1 expired
        vm.warp(block.timestamp + 8 days);
        (bool needed2, bytes memory performData2) = agri.checkUpkeep("");
        assertTrue(needed2);

        // performUpkeep should expire pid1
        agri.performUpkeep(performData2);
        assertEq(agri.getActivePolicyCount(), 2);

        // Warp another 7 days → pid2 expired too
        vm.warp(block.timestamp + 7 days);
        (bool needed3, bytes memory performData3) = agri.checkUpkeep("");
        assertTrue(needed3);

        agri.performUpkeep(performData3);
        assertEq(agri.getActivePolicyCount(), 1);

        // pid3 still active
        (, , , , , uint256 status3, , ) = agri.policies(pid3);
        assertEq(status3, 0);
    }

    // ── LP Solvency Tests ──

    function testLPPoolSolvencyAfterClaims() public {
        uint256 poolAssetsBefore = pool.totalAssets();

        // Purchase a policy
        vm.prank(user);
        bytes32 policyId = maritime.purchasePolicy(
            "US-LGB",
            1000e6,
            34,
            50e6,
            THIRTY_DAYS
        );

        // Premium should increase pool assets
        uint256 poolAssetsAfterPremium = pool.totalAssets();
        assertGt(poolAssetsAfterPremium, poolAssetsBefore);

        // Execute full payout claim
        vm.prank(admin);
        maritime.executeClaim(policyId, 50); // wind exceeded strike

        // Pool should have released payout but retained premium
        uint256 poolAssetsAfterClaim = pool.totalAssets();
        // The pool lost (payout - premium) net
        assertLt(poolAssetsAfterClaim, poolAssetsBefore);
    }

    function testExpiredPolicyReleasesReserve() public {
        vm.prank(user);
        bytes32 policyId = energy.purchasePolicy(
            "CAISO",
            2000e6,
            100,
            10e6,
            50e6,
            THIRTY_DAYS
        );

        uint256 reservedBefore = pool.totalMaxPayouts();
        assertGt(reservedBefore, 0);

        // Warp and expire
        vm.warp(block.timestamp + THIRTY_DAYS + 1);
        energy.expirePolicy(policyId);

        uint256 reservedAfter = pool.totalMaxPayouts();
        assertLt(reservedAfter, reservedBefore);
    }
}
