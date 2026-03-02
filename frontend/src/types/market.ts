export type MarketCategory = "Travel" | "Agriculture" | "Energy" | "Catastrophe" | "Maritime";

export interface MarketProduct {
    id: string;
    title: string;
    category: MarketCategory;
    description: string;
    iconType: string;
    badges: string[];
    inputPlaceholder: string;
    contractAddress: `0x${string}`;
    tooltipSummary?: {
        oracle: string;
        riskModel: string;
        settlement: string;
        premiumRange: string;
        trigger: string;
    };
    calculationMethod?: {
        formula: string;
        variables: string[];
        example: string;
    };
}

export interface PoolMetrics {
    id: string;
    productId: string;
    productTitle: string;
    tvl: number;
    apy: number;
    baseAaveApy: number;
    riskPremiumApy: number;
    utilization: number;
    maxPayouts: number;
}

export interface ActivePolicy {
    id: string;
    type: string;
    status: "Monitoring" | "Risk Detected" | "Claim Triggered" | "Claimed" | "Expired";
    premium: number;
    payout: number;
    purchaseDate: string;
    expiration: string;
    context: string;
    oracleData: {
        lastCheck: string;
        rawPayload: string;
    };
}

export interface OracleFeedLog {
    id: string;
    requestID: string;
    target: string;
    status: "Success" | "Pending" | "Reverted";
    timestamp: string;
    message: string;
}

export interface TreasuryMetrics {
    timestamp: string;
    tvl: number;
    claimsPaid: number;
    activePolicies: number;
    efficiencyRatio: number;
}
