import { LIQUIDITY_POOL_ABI, PRODUCT_ABI, GENERIC_PRODUCT_ABI, ERC20_ABI as ENTERPRISE_ERC20 } from './enterprise_abis';

export const ESCROW_ABI = [
    {
        inputs: [
            { name: "_teleporter", type: "address" },
            { name: "_usdc", type: "address" },
            { name: "_reflexL1ChainId", type: "bytes32" },
            { name: "_protocolTreasury", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            { name: "_apiTarget", type: "string" },
            { name: "_premium", type: "uint256" },
            { name: "_payoutAmount", type: "uint256" },
            { name: "_durationHours", type: "uint256" },
        ],
        name: "purchasePolicy",
        outputs: [{ name: "policyId", type: "bytes32" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_policyId", type: "bytes32" }],
        name: "expirePolicy",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_user", type: "address" }],
        name: "getUserPolicies",
        outputs: [{ name: "", type: "bytes32[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "_policyId", type: "bytes32" }],
        name: "getPolicy",
        outputs: [
            { name: "policyholder", type: "address" },
            { name: "apiTarget", type: "string" },
            { name: "premiumPaid", type: "uint256" },
            { name: "payoutAmount", type: "uint256" },
            { name: "expirationTime", type: "uint256" },
            { name: "isActive", type: "bool" },
            { name: "isClaimed", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "policyId", type: "bytes32" },
            { indexed: true, name: "policyholder", type: "address" },
            { indexed: false, name: "apiTarget", type: "string" },
            { indexed: false, name: "premiumPaid", type: "uint256" },
            { indexed: false, name: "payoutAmount", type: "uint256" },
            { indexed: false, name: "expirationTime", type: "uint256" },
        ],
        name: "PolicyPurchased",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "policyId", type: "bytes32" },
            { indexed: true, name: "policyholder", type: "address" },
            { indexed: false, name: "payoutAmount", type: "uint256" },
        ],
        name: "PolicyClaimed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, name: "policyId", type: "bytes32" }],
        name: "PolicyExpired",
        type: "event",
    },
] as const;


export { ENTERPRISE_ERC20 as ERC20_ABI };
export const LP_POOL_ABI = LIQUIDITY_POOL_ABI;
export const TRAVEL_ABI = PRODUCT_ABI;
export const AGRI_ABI = GENERIC_PRODUCT_ABI;
export const ENERGY_ABI = GENERIC_PRODUCT_ABI;
export const CATASTROPHE_ABI = GENERIC_PRODUCT_ABI;
export const MARITIME_ABI = GENERIC_PRODUCT_ABI;

export const CONTRACTS = {
    ESCROW: "0xb8387c02a388387c02a388387c02a388387c02a388" as `0x${string}`,
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65" as `0x${string}`,

    // Phase 72: Redeployed Enterprise Contracts (USDC flow fix + Keeper hooks)
    LP_POOL: "0xb4741AD6436023f275fD1725B0Df1042dDFd44Cc" as `0x${string}`,
    PRODUCT_FACTORY: "0xEDA58669214Ab2342bfD42f41FC8E4674931D72F" as `0x${string}`,
    TRAVEL: "0x860f5d9e6A6F7C2A6dBe8c396CA5dc37f298f86b" as `0x${string}`,
    AGRI: "0xA63CdC07ebC3B2deAF5faD45aabC35C2Dd86fF80" as `0x${string}`,
    ENERGY: "0xc8392691CC8e09fBc34a17cbCfb607e6a9a6d663" as `0x${string}`,
    CATASTROPHE: "0xaCbbeFe183Bff58FA57c99D0352d4cA1e720240A" as `0x${string}`,
    MARITIME: "0xfC873105314170de85A043fc39F332e203DA7B1a" as `0x${string}`
};
