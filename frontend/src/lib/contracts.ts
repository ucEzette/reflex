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

export const ERC20_ABI = [
    {
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;
