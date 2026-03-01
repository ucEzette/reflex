// SPDX-License-Identifier: MIT
import { parseAbi } from 'viem';

export const LIQUIDITY_POOL_ABI = parseAbi([
    "function usdc() view returns (address)",
    "function totalAssets() view returns (uint256)",
    "function totalMaxPayouts() view returns (uint256)",
    "function lpShares(address) view returns (uint256)",
    "function totalShares() view returns (uint256)",
    "function depositLiquidity(uint256 amount) external",
    "function withdrawLiquidity(uint256 shares) external",
    "function pause() external",
    "function unpause() external",
    "function setAuthorizedQuoter(address quoter) external",
    "event LiquidityDeposited(address indexed provider, uint256 amount, uint256 shares)",
    "event LiquidityWithdrawn(address indexed provider, uint256 amount, uint256 shares)"
]);

export const PRODUCT_ABI = parseAbi([
    "function quotePremium(uint256 nDelayed, uint256 nTotal, uint256 requestedPayout) view returns (uint256)",
    "function purchasePolicy(string flightId, uint256 requestedPayout, uint256 nDelayed, uint256 nTotal, bytes signature) external returns (bytes32)",
    "function policies(bytes32) view returns (address policyholder, uint256 premium, uint256 payout, uint256 status, string flightId)",
    "event PolicyCreated(bytes32 id, address holder, uint256 premium, uint256 payout)"
]);

export const ERC20_ABI = parseAbi([
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)",
    "function transfer(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)",
    "function mint(address, uint256)"
]);

// Agriculture, Energy, Catastrophe, and Maritime all follow similar interface patterns
export const GENERIC_PRODUCT_ABI = parseAbi([
    "function quotePremium(uint256 expectedRiskBase) view returns (uint256)",
    "function purchasePolicy(string, uint256, uint256, uint256, uint256, bytes) external returns (bytes32)",
    "function executeClaim(bytes32, uint256) external",
    "event PolicyCreated(bytes32 id, address holder, uint256 premium, uint256 maxPayout)"
]);
