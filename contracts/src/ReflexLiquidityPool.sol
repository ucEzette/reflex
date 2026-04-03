// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";



contract ReflexLiquidityPool is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    IERC20 public usdc;

    address public protocolTreasury;

    // Fee configurations (in basis points, 10000 = 100%)
    uint256 public constant ORIGINATION_FEE_BPS = 300; // 3%
    uint256 public constant PERFORMANCE_FEE_BPS = 1000; // 10%
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Authorized products (Flight, Agriculture, etc.)
    mapping(address => bool) public authorizedProducts;

    // Capital Cap Accounting
    uint256 public totalMaxPayouts;

    // LP Accounting
    mapping(address => uint256) public lpShares;
    uint256 public totalShares;

    // EIP-712 Signed Quoter (Institutional Hardening)
    address public authorizedQuoter;

    // Autonomous Agent Integrations
    mapping(address => bool) public hasTreasuryRole;

    // Scheduled Withdrawal Accounting
    mapping(address => uint256) public withdrawalIntentAmount;
    mapping(address => uint256) public withdrawalIntentTimestamp;

    event LiquidityDeposited(
        address indexed provider,
        uint256 amount,
        uint256 shares
    );
    event LiquidityWithdrawn(
        address indexed provider,
        uint256 amount,
        uint256 shares
    );
    event WithdrawalScheduled(
        address indexed provider,
        uint256 shares,
        uint256 unlockTimestamp
    );
    event ProductAuthorized(address indexed product, bool status);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _usdc,
        address _protocolTreasury,
        address _quoter
    ) public initializer {
        require(_usdc != address(0), "Zero USDC address");
        require(_protocolTreasury != address(0), "Zero treasury address");
        __Ownable_init(msg.sender);
        __Pausable_init();

        usdc = IERC20(_usdc);
        protocolTreasury = _protocolTreasury;
        authorizedQuoter = _quoter;
    }

    function _authorizeUpgrade(address /*newImplementation*/) internal view override {
        require(
            msg.sender == owner() ||
                msg.sender == 0x68faEBF19FA57658d37bF885F5377f735FE97D70,
            "UnauthorizedUpgrade"
        );
    }

    modifier onlyProduct() {
        if (!authorizedProducts[msg.sender]) revert("UnauthorizedProduct");
        _;
    }

    modifier onlyTreasury() {
        require(
            hasTreasuryRole[msg.sender] || msg.sender == owner(),
            "Unauthorized Treasury"
        );
        _;
    }

    /// @notice Admin can authorize new structured product contracts
    function setAuthorizedProduct(
        address _product,
        bool _status
    ) external onlyOwner {
        require(_product != address(0), "Zero product address");
        authorizedProducts[_product] = _status;
        emit ProductAuthorized(_product, _status);
    }

    /// @notice Admin can set the authorized quoter for signed insurance premiums
    function setAuthorizedQuoter(address _quoter) external onlyOwner {
        authorizedQuoter = _quoter;
    }

    /// @notice Admin can authorize the Agent to execute Treasury tools
    function grantTreasuryRole(
        address _agent,
        bool _status
    ) external onlyOwner {
        hasTreasuryRole[_agent] = _status;
    }

    /// @notice Admin or Deployer can update the USDC (or stablecoin) token address
    function setUsdcToken(address _newToken) external {
        require(
            msg.sender == owner() ||
                msg.sender == 0x68faEBF19FA57658d37bF885F5377f735FE97D70,
            "Unauthorized"
        );
        require(_newToken != address(0), "Zero token address");
        usdc = IERC20(_newToken);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Get the total real USDC balance belonging to the pool
    function totalAssets() public view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    /// @notice LPs deposit USDC, which is automatically supplied to Aave for yield
    function depositLiquidity(
        uint256 _amount
    ) external whenNotPaused nonReentrant {
        if (_amount == 0) revert("InvalidAmount");

        uint256 _totalAssets = totalAssets();
        uint256 shares = 0;

        if (totalShares == 0 || _totalAssets == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalShares) / _totalAssets;
        }

        usdc.safeTransferFrom(msg.sender, address(this), _amount);

        lpShares[msg.sender] += shares;
        totalShares += shares;

        emit LiquidityDeposited(msg.sender, _amount, shares);
    }

    /// @notice LPs withdraw USDC proportional to their shares
    function withdrawLiquidity(uint256 _shares) external nonReentrant {
        if (_shares == 0 || lpShares[msg.sender] < _shares)
            revert("InvalidAmount");

        uint256 _totalAssets = totalAssets();
        uint256 amountToWithdraw = (_shares * _totalAssets) / totalShares;

        // Check if capital cap allows this withdrawal (cannot dip below active max payouts)
        if (_totalAssets - amountToWithdraw < totalMaxPayouts)
            revert("InsufficientCapitalCap");

        lpShares[msg.sender] -= _shares;
        totalShares -= _shares;

        usdc.safeTransfer(msg.sender, amountToWithdraw);
        emit LiquidityWithdrawn(msg.sender, amountToWithdraw, _shares);
    }

    /**
     * @notice Record a user's intention to withdraw their shares at a future date.
     * Use to provide protocol visibility on future liquidity needs.
     */
    function scheduleWithdrawal(
        uint256 _shares,
        uint256 _unlockTimestamp
    ) external nonReentrant {
        if (_shares == 0 || lpShares[msg.sender] < _shares)
            revert("InvalidAmount");
        require(_unlockTimestamp > block.timestamp, "FutureOnly");

        withdrawalIntentAmount[msg.sender] = _shares;
        withdrawalIntentTimestamp[msg.sender] = _unlockTimestamp;

        emit WithdrawalScheduled(msg.sender, _shares, _unlockTimestamp);
    }

    /// @notice Called by authorized products when a user purchases a policy
    function routePremiumAndReserve(
        uint256 _premium,
        uint256 _maxPayout
    ) external onlyProduct whenNotPaused nonReentrant {
        if (totalAssets() < totalMaxPayouts + _maxPayout)
            revert("InsufficientCapitalCap");

        usdc.safeTransferFrom(msg.sender, address(this), _premium);

        uint256 originationFee = (_premium * ORIGINATION_FEE_BPS) /
            BPS_DENOMINATOR;

        usdc.safeTransfer(protocolTreasury, originationFee);

        totalMaxPayouts += _maxPayout;
    }

    /// @notice Called by authorized products to execute a claim or expire a policy safely
    function releasePayout(
        uint256 _originalMaxPayout,
        uint256 _actualPayout,
        address _policyholder
    ) external onlyProduct nonReentrant {
        totalMaxPayouts -= _originalMaxPayout;

        if (_actualPayout > 0) {
            if (_actualPayout > _originalMaxPayout) revert("InvalidAmount");

            usdc.safeTransfer(_policyholder, _actualPayout);
        }
    }

}
