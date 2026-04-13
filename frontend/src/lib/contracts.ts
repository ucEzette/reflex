import { LIQUIDITY_POOL_ABI, PRODUCT_ABI, GENERIC_PRODUCT_ABI, VAULT_FACTORY_ABI, ERC20_ABI as ENTERPRISE_ERC20 } from './enterprise_abis';

export const ESCROW_ABI = [
    {
        inputs: [
            { name: "_teleporter", type: "address" },
            { name: "_usdt", type: "address" },
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


export { ENTERPRISE_ERC20 as ERC20_ABI, PRODUCT_ABI, GENERIC_PRODUCT_ABI, VAULT_FACTORY_ABI };
export const LP_POOL_ABI = LIQUIDITY_POOL_ABI;
export const TRAVEL_ABI = PRODUCT_ABI;
export const AGRI_ABI = GENERIC_PRODUCT_ABI;
export const ENERGY_ABI = GENERIC_PRODUCT_ABI;
export const CATASTROPHE_ABI = GENERIC_PRODUCT_ABI;
export const MARITIME_ABI = GENERIC_PRODUCT_ABI;

export const CONTRACTS = {
    VAULT_FACTORY: "0xFaAb070d6f017955252e0a19CC532f227eDb2425" as `0x${string}`, // Placeholder for new deployment
    ESCROW: "0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4" as `0x${string}`,
    USDT: "0x4F6d9867564b31bD7Bd1ADA8376640201bf15e0B" as `0x${string}`,

    // Phase 97: Redeployment with PROTOCOL_MARGIN=3000 (30%)
    // Institutional Sector Isolated Pools
    LP_TRAVEL: "0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c" as `0x${string}`,
    LP_AGRI: "0xcb4c97087ed4c858281c39df44ae0997561ffe8c" as `0x${string}`,
    LP_ENERGY: "0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6" as `0x${string}`,
    LP_CAT: "0x9d803a3066c858d714c4f5ee286eaa6249d451ab" as `0x${string}`,
    LP_MARITIME: "0x6586035d5e39e30bf37445451b43eeaeeaa1405a" as `0x${string}`,

    // Previous global addresses kept for backward compatibility if needed
    LP_POOL: "0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c" as `0x${string}`,
    PRODUCT_FACTORY: "0x870268aafe40b15f6bf14d42c435e6d2c7b660fe" as `0x${string}`,
    TRAVEL: "0x98ce0538928303b6e31a9c376a1d4a37374f1d93" as `0x${string}`,
    AGRI: "0xfaab070d6f017955252e0a19cc532f227edb2425" as `0x${string}`,
    ENERGY: "0x762285536f8f07fe75706bb429d230a0e7b22966" as `0x${string}`,
    CATASTROPHE: "0x9b0378eeb2b22367183c09dc79966a32c79074c5" as `0x${string}`,
    MARITIME: "0x255ff883066744bf2d2914da1ebc26ff4d4b58c8" as `0x${string}`,
    CROSS_CHAIN_RECEIVER: "0xc7a297de87890728453daa240a8373d7d5cee90b" as `0x${string}`
};

export const POOLS = [
    {
        id: 'travel',
        name: 'Reflex Travel Protection Pool',
        description: 'Yield from flight delay and cancellation premiums. Capital isolated for travel disruptions.',
        address: CONTRACTS.LP_TRAVEL,
        sector: 'Travel',
        color: 'text-primary',
        borderColor: 'border-primary/20',
        icon: 'flight'
    },
    {
        id: 'agriculture',
        name: 'Reflex Agriculture Yield Pool',
        description: 'Parametric drought and yield protection for global food security.',
        address: CONTRACTS.LP_AGRI,
        sector: 'Agriculture',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
        icon: 'agriculture'
    },
    {
        id: 'energy',
        name: 'Reflex Energy Volatility Pool',
        description: 'Hedging solutions for renewable energy fluctuations and extreme price volatility.',
        address: CONTRACTS.LP_ENERGY,
        sector: 'Energy',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        icon: 'bolt'
    },
    {
        id: 'catastrophe',
        name: 'Reflex Catastrophe & Reinsurance',
        description: 'High-yield secondary market for wildfire, hurricane, and seismic risk.',
        address: CONTRACTS.LP_CAT,
        sector: 'Catastrophe',
        color: 'text-rose-500',
        borderColor: 'border-rose-500/20',
        icon: 'warning'
    },
    {
        id: 'maritime',
        name: 'Reflex Maritime Logistics Pool',
        description: 'Shipping and freight disruption protection for global trade corridors.',
        address: CONTRACTS.LP_MARITIME,
        sector: 'Maritime',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        icon: 'ship'
    }
];

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

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDT (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDT (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
