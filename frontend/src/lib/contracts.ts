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
    VAULT_FACTORY: "0x29Fc20d0b2bF7db3325da8a7E1Fc422C91773eD8" as `0x${string}`, // ProductFactory on Arbitrum Sepolia
    ESCROW: "0x69Cb9508033578358046d0E071a299b2faDA7AE0" as `0x${string}`, // Escrow Proxy on Arbitrum Sepolia
    USDT: "0xeD2a67a8D4d6add0a278841A9E96B92858EBE736" as `0x${string}`, // Mock USDT on Arbitrum Sepolia

    // Simplified Protocol (No Aave) — Arbitrum Sepolia Deployment
    // Institutional Sector Isolated Pools
    LP_TRAVEL: "0x7FafA41d52eFa6Ad03cB51A877602F6CB0CC5431" as `0x${string}`,
    LP_AGRI: "0xa5C91b1eCB72bCAbc09B4fefd13175eC16ef3e72" as `0x${string}`,
    LP_ENERGY: "0x8f3f5a247E97F78DdDEae96A358aC5Cd175bd7b3" as `0x${string}`,
    LP_CAT: "0x60C09F174A9007D9A1E457b95E67738acFdCf1ad" as `0x${string}`,
    LP_MARITIME: "0x9Cfbc7AA845a5900CFe30F9C8e0cd5f2c36E6d31" as `0x${string}`,

    // Product Contracts
    LP_POOL: "0x7FafA41d52eFa6Ad03cB51A877602F6CB0CC5431" as `0x${string}`, // Legacy fallback → Travel pool
    PRODUCT_FACTORY: "0x29Fc20d0b2bF7db3325da8a7E1Fc422C91773eD8" as `0x${string}`,
    TRAVEL: "0x3158a074FE3E79B03d311572ED500A0cf978164f" as `0x${string}`,
    AGRI: "0xc8906E54e8A43D44d817599EAd14B3De40C1d7af" as `0x${string}`,
    ENERGY: "0xb4741AD6436023f275fD1725B0Df1042dDFd44Cc" as `0x${string}`,
    CATASTROPHE: "0xEDA58669214Ab2342bfD42f41FC8E4674931D72F" as `0x${string}`,
    MARITIME: "0x5C0eC4fe89708bf6D5521f7c9a1f8A72062ebee4" as `0x${string}`,
    CROSS_CHAIN_RECEIVER: "0x0000000000000000000000000000000000000000" as `0x${string}` // Optional CCIP expansion
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
    DESTINATION_CHAIN_SELECTOR: "3478487238524512106", // Arbitrum Sepolia
    ROUTERS: {
        "43113": "0xF694E193200268f9a4868e4Aa017A0118C9a8177", // Arbitrum Sepolia
        "11155111": "0x0BF3dE8c5D3d8A2B34D2BEeB17ABfCeBaf363A59", // Sepolia
        "421614": "0x2a13872f132646d705c879857d4715494d458568", // Arbitrum Sepolia
        "84532": "0xD3b0651d97492A7E0427678083822afecbbDC67B", // Base Sepolia
    }
};

// Policy constants
export const POLICY_PREMIUM = BigInt(5_000_000); // $5 USDT (6 decimals)
export const POLICY_PAYOUT = BigInt(50_000_000); // $50 USDT (6 decimals)
export const POLICY_DURATION_HOURS = BigInt(24); // 24 hours coverage
