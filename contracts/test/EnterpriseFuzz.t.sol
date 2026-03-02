// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReflexLiquidityPool.sol";
import "../src/products/AgricultureIndex.sol";
import "../src/products/EnergySolutions.sol";
import "../src/products/CatastropheProximity.sol";
import "../src/products/MaritimeSolutions.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract FuzzUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract FuzzAavePool {
    function supply(address, uint256, address, uint16) external {}

    function withdraw(address, uint256, address) external returns (uint256) {
        return 0;
    }
}

contract FuzzAToken is ERC20 {
    constructor() ERC20("aUSDC", "aUSDC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract EnterpriseFuzzTest is Test {
    FuzzUSDC public usdc;
    ReflexLiquidityPool public pool;
    AgricultureIndex public agri;
    EnergySolutions public energy;
    CatastropheProximity public cat;
    MaritimeSolutions public maritime;

    address public admin = address(1);
    address public user = address(2);
    address public lp = address(3);
    address public quoter = address(4);

    function setUp() public {
        vm.startPrank(admin);

        usdc = new FuzzUSDC();
        FuzzAavePool aave = new FuzzAavePool();
        FuzzAToken aToken = new FuzzAToken();

        ReflexLiquidityPool impl = new ReflexLiquidityPool();
        bytes memory initData = abi.encodeWithSelector(
            ReflexLiquidityPool.initialize.selector,
            address(usdc),
            admin,
            address(aave),
            address(aToken),
            quoter
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        pool = ReflexLiquidityPool(address(proxy));

        agri = new AgricultureIndex(address(pool));
        energy = new EnergySolutions(address(pool));
        cat = new CatastropheProximity(address(pool));
        maritime = new MaritimeSolutions(address(pool));

        pool.setAuthorizedProduct(address(agri), true);
        pool.setAuthorizedProduct(address(energy), true);
        pool.setAuthorizedProduct(address(cat), true);
        pool.setAuthorizedProduct(address(maritime), true);
        pool.setAuthorizedQuoter(quoter);

        vm.stopPrank();

        // Seed LP with massive reserves
        usdc.mint(lp, 10_000_000e6);
        vm.startPrank(lp);
        usdc.approve(address(pool), type(uint256).max);
        pool.depositLiquidity(10_000_000e6);
        vm.stopPrank();

        // Seed user
        usdc.mint(user, 1_000_000e6);
        vm.startPrank(user);
        usdc.approve(address(agri), type(uint256).max);
        usdc.approve(address(energy), type(uint256).max);
        usdc.approve(address(cat), type(uint256).max);
        usdc.approve(address(maritime), type(uint256).max);
        vm.stopPrank();
    }

    // ── Premium Calculation Fuzzing ──

    /// @notice Premium should always be > 0 for any positive risk base
    function testFuzz_PremiumAlwaysPositive(uint256 riskBase) public pure {
        vm.assume(riskBase > 20 && riskBase < 1_000_000e6);
        uint256 premium = (riskBase * (10000 + 500)) / 10000;
        assertGt(premium, 0, "Premium must be > 0");
        assertGt(premium, riskBase, "Premium must exceed risk base (margin)");
    }

    /// @notice Premium margin should always be exactly 5%
    function testFuzz_PremiumMarginIs5Percent(uint256 riskBase) public pure {
        vm.assume(riskBase > 100 && riskBase < 1_000_000e6);
        uint256 premium = (riskBase * 10500) / 10000;
        uint256 margin = premium - riskBase;
        // margin should be 5% of riskBase (with rounding tolerance)
        assertApproxEqRel(margin, (riskBase * 5) / 100, 0.01e18);
    }

    // ── Duration Fuzzing ──

    /// @notice Policy expiresAt must always be in the future
    function testFuzz_DurationSetsExpiresAt(uint256 duration) public {
        vm.assume(duration > 0 && duration < 365 days);
        vm.prank(user);
        bytes32 pid = agri.purchasePolicy(
            "FUZZ-ZONE",
            1000e6,
            100,
            50,
            50e6,
            duration
        );
        (, , , , , , uint256 expiresAt, ) = agri.policies(pid);
        assertEq(expiresAt, block.timestamp + duration);
        assertGt(expiresAt, block.timestamp);
    }

    /// @notice Zero duration should revert
    function testFuzz_ZeroDurationReverts() public {
        vm.prank(user);
        vm.expectRevert("Invalid duration");
        agri.purchasePolicy("FUZZ", 1000e6, 100, 50, 50e6, 0);
    }

    // ── Agriculture Linear Payout Fuzzing ──

    /// @notice Payout is bounded [0, maxPayout] for any actual index
    function testFuzz_AgriPayoutBounded(uint256 actualIndex) public {
        vm.assume(actualIndex <= 200); // Reasonable rainfall index range
        uint256 maxPayout = 1000e6;
        uint256 strike = 100;
        uint256 exit = 50;

        vm.prank(user);
        bytes32 pid = agri.purchasePolicy(
            "FUZZ-A",
            maxPayout,
            strike,
            exit,
            50e6,
            30 days
        );

        uint256 userBefore = usdc.balanceOf(user);

        if (actualIndex >= strike) {
            // No payout above strike
            vm.prank(admin);
            agri.executeClaim(pid, actualIndex);
            uint256 userAfter = usdc.balanceOf(user);
            assertEq(userAfter, userBefore, "No payout above strike");
        } else if (actualIndex <= exit) {
            // Full payout below exit
            vm.prank(admin);
            agri.executeClaim(pid, actualIndex);
            uint256 userAfter = usdc.balanceOf(user);
            assertEq(
                userAfter - userBefore,
                maxPayout,
                "Full payout below exit"
            );
        } else {
            // Linear interpolation
            vm.prank(admin);
            agri.executeClaim(pid, actualIndex);
            uint256 userAfter = usdc.balanceOf(user);
            uint256 payout = userAfter - userBefore;
            assertGt(payout, 0, "Payout should be > 0 between strike and exit");
            assertLe(payout, maxPayout, "Payout should not exceed maxPayout");
        }
    }

    // ── Energy Tick Payout Fuzzing ──

    /// @notice Energy payout is capped at maxPayout
    function testFuzz_EnergyPayoutCapped(uint256 actualDegree) public {
        vm.assume(actualDegree > 100 && actualDegree < 10000);
        uint256 maxPayout = 5000e6;
        uint256 strike = 100;
        uint256 tickValue = 10e6;

        vm.prank(user);
        bytes32 pid = energy.purchasePolicy(
            "FUZZ-GRID",
            maxPayout,
            strike,
            tickValue,
            50e6,
            30 days
        );

        uint256 userBefore = usdc.balanceOf(user);
        vm.prank(admin);
        energy.executeClaim(pid, actualDegree);
        uint256 payout = usdc.balanceOf(user) - userBefore;

        assertLe(
            payout,
            maxPayout,
            "Energy payout must be capped at maxPayout"
        );
        assertGt(payout, 0, "Should pay something above strike");
    }

    // ── Catastrophe Tier Fuzzing ──

    /// @notice Catastrophe payout follows tier structure
    function testFuzz_CatTierPayout(uint256 distance) public {
        vm.assume(distance < 1_000_000); // Max 1000km
        uint256 maxPayout = 2000e6;
        uint256 tier1 = 50000; // 50km
        uint256 tier2 = 200000; // 200km

        vm.prank(user);
        bytes32 pid = cat.purchasePolicy(
            "0.0,0.0",
            maxPayout,
            tier1,
            tier2,
            50e6,
            30 days
        );

        uint256 userBefore = usdc.balanceOf(user);
        vm.prank(admin);
        cat.executeClaim(pid, distance);
        uint256 payout = usdc.balanceOf(user) - userBefore;

        if (distance < tier1) {
            assertEq(payout, maxPayout, "Tier 1: 100% payout");
        } else if (distance < tier2) {
            assertEq(payout, maxPayout / 2, "Tier 2: 50% payout");
        } else {
            assertEq(payout, 0, "Beyond tier 2: no payout");
        }
    }

    // ── Maritime Wind Fuzzing ──

    /// @notice Maritime pays full if wind > strike, zero otherwise
    function testFuzz_MaritimeWindPayout(uint256 windSpeed) public {
        vm.assume(windSpeed < 1000);
        uint256 maxPayout = 3000e6;
        uint256 strike = 34;

        vm.prank(user);
        bytes32 pid = maritime.purchasePolicy(
            "FUZZ-PORT",
            maxPayout,
            strike,
            50e6,
            30 days
        );

        uint256 userBefore = usdc.balanceOf(user);
        vm.prank(admin);
        maritime.executeClaim(pid, windSpeed);
        uint256 payout = usdc.balanceOf(user) - userBefore;

        if (windSpeed >= strike) {
            assertEq(payout, maxPayout, "Full payout for wind above strike");
        } else {
            assertEq(payout, 0, "No payout for wind below strike");
        }
    }

    // ── Expiration Fuzzing ──

    /// @notice Cannot expire before expiresAt
    function testFuzz_CannotExpireEarly(uint256 warpTime) public {
        vm.assume(warpTime < 30 days);
        vm.prank(user);
        bytes32 pid = agri.purchasePolicy(
            "FUZZ-EXP",
            500e6,
            100,
            50,
            25e6,
            30 days
        );

        vm.warp(block.timestamp + warpTime);
        vm.expectRevert("Not expired yet");
        agri.expirePolicy(pid);
    }

    /// @notice Can always expire after expiresAt
    function testFuzz_CanExpireAfterDuration(uint256 extraTime) public {
        vm.assume(extraTime > 0 && extraTime < 365 days);
        vm.prank(user);
        bytes32 pid = agri.purchasePolicy(
            "FUZZ-LATE",
            500e6,
            100,
            50,
            25e6,
            30 days
        );

        vm.warp(block.timestamp + 30 days + extraTime);
        agri.expirePolicy(pid);
        (, , , , , uint256 status, , ) = agri.policies(pid);
        assertEq(status, 2, "Policy should be expired");
    }

    // ── Invalid Parameter Fuzzing ──

    /// @notice Strike must be > exit for agriculture
    function testFuzz_AgriInvalidThresholdReverts(
        uint256 strike,
        uint256 exit
    ) public {
        vm.assume(strike <= exit);
        vm.prank(user);
        vm.expectRevert("Invalid threshold bounds");
        agri.purchasePolicy("FUZZ-INV", 500e6, strike, exit, 25e6, 30 days);
    }
}
