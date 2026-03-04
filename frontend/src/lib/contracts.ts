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
    ESCROW: "0x64ab02e78655f0dfda736200f28a96ba93c19942" as `0x${string}`,
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65" as `0x${string}`,

    // Phase 91: Mainnet Candidate Rollout
    LP_POOL: "0xb60f052c279db25a068decf9e12d5b44673f0775" as `0x${string}`,
    PRODUCT_FACTORY: "0x27d6efff0f9f48606641b8034772f0796a6e61e4" as `0x${string}`,
    TRAVEL: "0xf8f72710f2e9cd46626193d52fe5e636c3717849" as `0x${string}`,
    AGRI: "0x1170aeb2fcaddf9a0c4d3fb5c6a4d0181e85ede0" as `0x${string}`,
    ENERGY: "0x5c3e14b7bacb12042ff5899c9cb47628146e677a" as `0x${string}`,
    CATASTROPHE: "0xcfb14105c3ba4075e34495ebb829f220e6567271" as `0x${string}`,
    MARITIME: "0xb9833d0a8676ae20c436e03d1de2cda0356bbac5" as `0x${string}`,
    CROSS_CHAIN_RECEIVER: "0x89C6F7C2A6dbe8c396CA5dc37f298f86b" as `0x${string}`
};

// Chainlink CCIP Selectors and Routers
export const CCIP_CONFIG = {
    DESTINATION_CHAIN_SELECTOR: "14767482510784806043", // Avalanche Fuji
    ROUTERS: {
        "43113": "0xF694E193200268f9a4868e4Aa017A0118C9a8177", // Avalanche Fuji
        "11155111": "0x0BF3dE8c5D3d8A2B34D2BEeB17ABfCeBaf363A59", // Sepolia
        "421614": "0x2a13872f132646d705c879857d4715494d458568", // Arbitrum Sepolia
        "84532": "0xD3b0651d97492A7E0427678083822afecbbDC67B", // Base Sepolia
    }
};
