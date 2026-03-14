import { parseAbi } from 'viem';

export const LIQUIDITY_POOL_ABI = parseAbi([
    "function usdt() view returns (address)",
    "function totalAssets() view returns (uint256)",
    "function totalMaxPayouts() view returns (uint256)",
    "function lpShares(address) view returns (uint256)",
    "function totalShares() view returns (uint256)",
    "function depositLiquidity(uint256 amount) external",
    "function withdrawLiquidity(uint256 shares) external",
    "function scheduleWithdrawal(uint256 shares, uint256 unlockTimestamp) external",
    "function withdrawalIntentAmount(address) view returns (uint256)",
    "function withdrawalIntentTimestamp(address) view returns (uint256)",
    "function pause() external",
    "function unpause() external",
    "function setAuthorizedQuoter(address quoter) external",
    "function authorizedProducts(address product) view returns (bool)",

    "event LiquidityDeposited(address indexed provider, uint256 amount, uint256 shares)",
    "event LiquidityWithdrawn(address indexed provider, uint256 amount, uint256 shares)",
    "event WithdrawalScheduled(address indexed provider, uint256 shares, uint256 unlockTimestamp)"
]);

export const PRODUCT_ABI = parseAbi([
    "function quotePremium(uint256 nDelayed, uint256 nTotal, uint256 requestedPayout) view returns (uint256)",
    "function purchasePolicy(string flightId, uint256 requestedPayout, uint256 nDelayed, uint256 nTotal, uint256 durationSeconds, bytes signature) external returns (bytes32)",
    "function executeClaim(bytes32 id, bool delayedOver2Hours) external",
    "function expirePolicy(bytes32 id) external",
    "function getActivePolicyCount() view returns (uint256)",
    "function getUserPolicies(address) view returns (bytes32[])",
    "function pool() view returns (address)",

    "function policies(bytes32) view returns (address policyholder, uint256 premium, uint256 payout, uint256 status, uint256 expiresAt, string flightId)",
    "event PolicyCreated(bytes32 id, address holder, uint256 premium, uint256 payout, uint256 expiresAt)",
    "event PolicyClaimed(bytes32 id, uint256 payout)",
    "event PolicyExpired(bytes32 id)"
]);

export const ERC20_ABI = parseAbi([
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address recipient, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)"
]);

export const ESCROW_ABI = parseAbi([
    "function getVoteDetails(bytes32 _policyId) view returns (uint256 currentVotes, uint256 required)",
    "function submitRelayerConsensus(bytes32 _policyId) external",
    "function submitExternalConsensus(address _product, bytes32 _policyId, uint256 _payout) external",
    "function authorizedRelayers(address _relayer) view returns (bool)",
    "function addAuthorizedRelayer(address _relayer) external",
    "function removeAuthorizedRelayer(address _relayer) external",
    "function updateQuorum(uint256 _newQuorum) external",
    "function requiredQuorum() view returns (uint256)",
    "event RelayerAdded(address relayer)",
    "event RelayerRemoved(address relayer)",
    "event QuorumUpdated(uint256 newQuorum)",
    "function getUserPolicies(address _user) view returns (bytes32[])",
    "function getPolicy(bytes32 _policyId) view returns (address policyholder, string memory apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime, bool isActive, bool isClaimed)"
]);

export const GENERIC_PRODUCT_ABI = parseAbi([
    "function quotePremium(uint256 expectedRiskBase) view returns (uint256)",
    "function purchasePolicy(string, uint256, uint256, uint256, uint256, uint256) external returns (bytes32)",
    "function executeClaim(bytes32, uint256) external",
    "function expirePolicy(bytes32) external",
    "function getActivePolicyCount() view returns (uint256)",
    "function getUserPolicies(address) view returns (bytes32[])",
    "function pool() view returns (address)",

    "function policies(bytes32) view returns (address policyholder, uint256 premium, uint256 maxPayout, uint256 strikeIndex, uint256 exitIndex, uint256 status, uint256 expiresAt, string geographicZone)",
    "function checkUpkeep(bytes) view returns (bool upkeepNeeded, bytes performData)",
    "function performUpkeep(bytes) external",
    "event PolicyCreated(bytes32 id, address holder, uint256 premium, uint256 maxPayout, uint256 expiresAt)",
    "event PolicyClaimed(bytes32 id, uint256 actualPayout)",
    "event PolicyExpired(bytes32 id)"
]);
