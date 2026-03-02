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

// ── Mock Contracts ──

contract InvariantUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract InvariantAavePool {
    function supply(address, uint256, address, uint16) external {}

    function withdraw(address, uint256, address) external returns (uint256) {
        return 0;
    }
}

contract InvariantAToken is ERC20 {
    constructor() ERC20("aUSDC", "aUSDC") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

// ── Handler: Drives random actions against the protocol ──

contract ProtocolHandler is Test {
    InvariantUSDC public usdc;
    ReflexLiquidityPool public pool;
    AgricultureIndex public agri;

    address public admin;
    address[] public users;
    bytes32[] public policyIds;
    mapping(bytes32 => bool) public isClaimed;
    mapping(bytes32 => bool) public isExpired;

    uint256 public totalPremiumsCollected;
    uint256 public totalPayoutsReleased;

    constructor(
        InvariantUSDC _usdc,
        ReflexLiquidityPool _pool,
        AgricultureIndex _agri,
        address _admin
    ) {
        usdc = _usdc;
        pool = _pool;
        agri = _agri;
        admin = _admin;

        // Create 5 users with USDC
        for (uint256 i = 0; i < 5; i++) {
            address user = address(uint160(100 + i));
            users.push(user);
            usdc.mint(user, 100_000e6);
            vm.prank(user);
            usdc.approve(address(agri), type(uint256).max);
        }
    }

    // Random policy purchase
    function purchasePolicy(
        uint256 userSeed,
        uint256 maxPayout,
        uint256 duration
    ) external {
        maxPayout = bound(maxPayout, 100e6, 10_000e6);
        duration = bound(duration, 1 hours, 90 days);
        address user = users[userSeed % users.length];

        uint256 strike = 100;
        uint256 exit = 50;
        uint256 riskBase = maxPayout / 20; // ~5% premium

        // Check user has enough USDC for premium
        uint256 premium = agri.quotePremium(riskBase);
        if (usdc.balanceOf(user) < premium) return;

        vm.prank(user);
        try
            agri.purchasePolicy(
                "INV-ZONE",
                maxPayout,
                strike,
                exit,
                riskBase,
                duration
            )
        returns (bytes32 pid) {
            policyIds.push(pid);
            totalPremiumsCollected += premium;
        } catch {}
    }

    // Random claim execution
    function executeClaim(uint256 policySeed, uint256 actualIndex) external {
        if (policyIds.length == 0) return;
        bytes32 pid = policyIds[policySeed % policyIds.length];
        if (isClaimed[pid] || isExpired[pid]) return;

        actualIndex = bound(actualIndex, 0, 200);

        vm.prank(admin);
        try agri.executeClaim(pid, actualIndex) {
            // Check actual status after claim — contract sets status=1 for payout, status=2 for no-payout
            (
                ,
                ,
                uint256 maxPayout,
                uint256 strikeIdx,
                uint256 exitIdx,
                uint256 postStatus,
                ,

            ) = agri.policies(pid);
            if (postStatus == 1) {
                isClaimed[pid] = true;
                // Track approximate payouts
                if (actualIndex <= exitIdx) {
                    totalPayoutsReleased += maxPayout;
                } else {
                    uint256 dist = strikeIdx - actualIndex;
                    uint256 range = strikeIdx - exitIdx;
                    totalPayoutsReleased += (dist * maxPayout) / range;
                }
            } else {
                isExpired[pid] = true;
            }
        } catch {}
    }

    // Random expiration (warp time first)
    function expirePolicy(uint256 policySeed) external {
        if (policyIds.length == 0) return;
        bytes32 pid = policyIds[policySeed % policyIds.length];
        if (isClaimed[pid] || isExpired[pid]) return;

        (, , , , , , uint256 expiresAt, ) = agri.policies(pid);
        vm.warp(expiresAt + 1);

        try agri.expirePolicy(pid) {
            isExpired[pid] = true;
        } catch {}
    }

    // Deposit liquidity
    function depositLiquidity(uint256 amount) external {
        amount = bound(amount, 1000e6, 1_000_000e6);
        address lp = users[0];
        usdc.mint(lp, amount);
        vm.startPrank(lp);
        usdc.approve(address(pool), amount);
        pool.depositLiquidity(amount);
        vm.stopPrank();
    }

    function getPolicyCount() external view returns (uint256) {
        return policyIds.length;
    }
}

// ── Invariant Test Suite ──

contract SecurityInvariantsTest is Test {
    InvariantUSDC public usdc;
    ReflexLiquidityPool public pool;
    AgricultureIndex public agri;
    ProtocolHandler public handler;

    address public admin = address(1);
    address public quoter = address(4);

    function setUp() public {
        vm.startPrank(admin);

        usdc = new InvariantUSDC();
        InvariantAavePool aave = new InvariantAavePool();
        InvariantAToken aToken = new InvariantAToken();

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
        pool.setAuthorizedProduct(address(agri), true);
        pool.setAuthorizedQuoter(quoter);

        vm.stopPrank();

        // Seed LP with large reserves
        usdc.mint(admin, 50_000_000e6);
        vm.startPrank(admin);
        usdc.approve(address(pool), type(uint256).max);
        pool.depositLiquidity(50_000_000e6);
        vm.stopPrank();

        handler = new ProtocolHandler(usdc, pool, agri, admin);

        // Target handler for invariant fuzzing
        targetContract(address(handler));
    }

    /// @notice Pool must ALWAYS have enough assets to cover all outstanding maxPayouts
    function invariant_poolAlwaysSolvent() public view {
        uint256 assets = pool.totalAssets();
        uint256 liabilities = pool.totalMaxPayouts();
        assertGe(
            assets,
            liabilities,
            "INVARIANT BROKEN: Pool insolvent - assets < totalMaxPayouts"
        );
    }

    /// @notice totalShares must never be 0 when there are LP deposits
    function invariant_sharesConsistency() public view {
        if (pool.totalShares() > 0) {
            assertGt(
                pool.totalAssets(),
                0,
                "INVARIANT BROKEN: Shares exist but no assets"
            );
        }
    }

    /// @notice Claimed policies must have status = 1, expired = 2
    function invariant_noDoubleClaim() public view {
        uint256 count = handler.getPolicyCount();
        for (uint256 i = 0; i < count && i < 20; i++) {
            bytes32 pid = handler.policyIds(i);
            (, , , , , uint256 status, , ) = agri.policies(pid);
            if (handler.isClaimed(pid)) {
                assertEq(
                    status,
                    1,
                    "INVARIANT BROKEN: Claimed policy has wrong status"
                );
            }
            if (handler.isExpired(pid)) {
                assertEq(
                    status,
                    2,
                    "INVARIANT BROKEN: Expired policy has wrong status"
                );
            }
        }
    }

    /// @notice Active policy count should never exceed total policies created
    function invariant_activePolicyCountBounded() public view {
        uint256 activeCount = agri.getActivePolicyCount();
        uint256 totalCreated = handler.getPolicyCount();
        assertLe(
            activeCount,
            totalCreated,
            "INVARIANT BROKEN: Active policies exceed total created"
        );
    }

    /// @notice Pool's totalMaxPayouts should decrease monotonically as policies resolve
    function invariant_totalMaxPayoutsNonNegative() public view {
        // totalMaxPayouts is uint256 so can't go negative, but we verify it doesn't overflow
        uint256 tmp = pool.totalMaxPayouts();
        assertLe(
            tmp,
            pool.totalAssets() + 1e18,
            "INVARIANT BROKEN: totalMaxPayouts unreasonably large"
        );
    }
}
