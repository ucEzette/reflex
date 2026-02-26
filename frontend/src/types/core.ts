export type TriggerStatus = "Monitoring" | "Risk Detected" | "Claim Triggered" | "Settled";

export interface ActivePolicy {
    id: string;
    type: "Flight" | "Cloud" | "Weather" | "Web3";
    status: TriggerStatus;
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
    status: "Success" | "Reverted" | "Pending";
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

export interface MarketProduct {
    id: string;
    title: string;
    category: "Travel" | "Weather" | "Web3" | "Lifestyle";
    description: string;
    iconType: string;
    badges: string[];
    inputPlaceholder: string;
}
