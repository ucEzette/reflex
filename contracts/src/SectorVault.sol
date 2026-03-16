// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Interfaces for Aave V3 integration
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IAToken {
    function balanceOf(address user) external view returns (uint256);
}

/**
 * @title SectorVault
 * @notice A specialized liquidity pool for a specific risk sector (e.g., Travel, Agriculture).
 * Part of the Reflex Segmented Risk Architecture.
 */
contract SectorVault is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    IERC20 public usdc;
    IAavePool public aavePool;
    IAToken public aUsdc;

    string public sectorName;
    address public protocolTreasury;

    uint256 public constant ORIGINATION_FEE_BPS = 300;
    uint256 public constant PERFORMANCE_FEE_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    mapping(address => bool) public authorizedProducts;
    uint256 public totalMaxPayouts;

    mapping(address => uint256) public lpShares;
    uint256 public totalShares;

    address public authorizedQuoter;

    event LiquidityDeposited(address indexed provider, uint256 amount, uint256 shares);
    event LiquidityWithdrawn(address indexed provider, uint256 amount, uint256 shares);
    event ProductAuthorized(address indexed product, bool status);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _sectorName,
        address _usdc,
        address _protocolTreasury,
        address _aavePool,
        address _aUsdc,
        address _quoter
    ) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();


        sectorName = _sectorName;
        usdc = IERC20(_usdc);
        protocolTreasury = _protocolTreasury;
        aavePool = IAavePool(_aavePool);
        aUsdc = IAToken(_aUsdc);
        authorizedQuoter = _quoter;

        if (_aavePool != address(0)) {
            usdc.approve(_aavePool, type(uint256).max);
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier onlyProduct() {
        require(authorizedProducts[msg.sender], "UnauthorizedProduct");
        _;
    }

    function totalAssets() public view returns (uint256) {
        uint256 localBalance = usdc.balanceOf(address(this));
        uint256 aaveBalance = 0;
        if (address(aUsdc) != address(0) && address(aUsdc).code.length > 0) {
            try aUsdc.balanceOf(address(this)) returns (uint256 b) {
                aaveBalance = b;
            } catch {}
        }
        return localBalance + aaveBalance;
    }

    function depositLiquidity(uint256 _amount) external whenNotPaused nonReentrant {
        require(_amount > 0, "InvalidAmount");
        uint256 _totalAssets = totalAssets();
        uint256 shares = (totalShares == 0 || _totalAssets == 0) ? _amount : (_amount * totalShares) / _totalAssets;

        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        if (address(aavePool) != address(0) && address(aavePool).code.length > 0) {
            try aavePool.supply(address(usdc), _amount, address(this), 0) {} catch {}
        }

        lpShares[msg.sender] += shares;
        totalShares += shares;
        emit LiquidityDeposited(msg.sender, _amount, shares);
    }

    function withdrawLiquidity(uint256 _shares) external nonReentrant {
        require(_shares > 0 && lpShares[msg.sender] >= _shares, "InvalidAmount");
        uint256 _totalAssets = totalAssets();
        uint256 amountToWithdraw = (_shares * _totalAssets) / totalShares;

        require(_totalAssets - amountToWithdraw >= totalMaxPayouts, "InsufficientCapitalCap");

        lpShares[msg.sender] -= _shares;
        totalShares -= _shares;

        if (address(aavePool) != address(0) && address(aavePool).code.length > 0) {
            try aavePool.withdraw(address(usdc), amountToWithdraw, address(this)) {} catch {}
        }

        usdc.safeTransfer(msg.sender, amountToWithdraw);
        emit LiquidityWithdrawn(msg.sender, amountToWithdraw, _shares);
    }

    function reservePremiumAndAssets(uint256 _premium, uint256 _maxPayout) external onlyProduct whenNotPaused nonReentrant {
        require(totalAssets() >= totalMaxPayouts + _maxPayout, "InsufficientCapitalCap");
        usdc.safeTransferFrom(msg.sender, address(this), _premium);

        uint256 originationFee = (_premium * ORIGINATION_FEE_BPS) / BPS_DENOMINATOR;
        uint256 lpProfit = _premium - originationFee;
        usdc.safeTransfer(protocolTreasury, originationFee);

        if (address(aavePool) != address(0) && address(aavePool).code.length > 0) {
            try aavePool.supply(address(usdc), lpProfit, address(this), 0) {} catch {}
        }
        totalMaxPayouts += _maxPayout;
    }

    function releasePayout(uint256 _originalMaxPayout, uint256 _actualPayout, address _policyholder) external onlyProduct nonReentrant {
        totalMaxPayouts -= _originalMaxPayout;
        if (_actualPayout > 0) {
            require(_actualPayout <= _originalMaxPayout, "InvalidAmount");
            if (address(aavePool) != address(0) && address(aavePool).code.length > 0) {
                try aavePool.withdraw(address(usdc), _actualPayout, address(this)) {} catch {}
            }
            usdc.safeTransfer(_policyholder, _actualPayout);
        }
    }

    function setAuthorizedProduct(address _product, bool _status) external onlyOwner {
        authorizedProducts[_product] = _status;
        emit ProductAuthorized(_product, _status);
    }

    function setAuthorizedQuoter(address _quoter) external onlyOwner {
        authorizedQuoter = _quoter;
    }
}
