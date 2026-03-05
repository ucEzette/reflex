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
    ESCROW: "0x6b37b0fc861b0fa22242ec92c25f2643876e4fbf" as `0x${string}`,
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65" as `0x${string}`,

    // Phase 97: Redeployment with PROTOCOL_MARGIN=3000 (30%)
    LP_POOL: "0x4e70e0c76499876d575650fe73a397570aaf17e5" as `0x${string}`,
    PRODUCT_FACTORY: "0x90d97d7bac01bc2504c6d2d81ffbc7254339db70" as `0x${string}`,
    TRAVEL: "0xea8f12bfed818cbf45715783c95d47c90b2e6b42" as `0x${string}`,
    AGRI: "0x708ad64cc8d70f0be380ca725ff8989836b5451a" as `0x${string}`,
    ENERGY: "0x2e7b9ac02f629aa62e7009f0fa5ee040c250d266" as `0x${string}`,
    CATASTROPHE: "0x8782f5d44f4d14a082595b7e2b1941cb5b8be86d" as `0x${string}`,
    MARITIME: "0x4fe5833da6ba27a28dc7a921ba300ea8e831d85d" as `0x${string}`,
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
