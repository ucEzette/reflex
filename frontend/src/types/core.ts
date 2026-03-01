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
    category: "Travel" | "Agriculture" | "Energy" | "Catastrophe" | "Maritime";
    description: string;
    iconType: string;
    badges: string[];
    inputPlaceholder: string;
    contractAddress?: `0x${string}`;
    tooltipSummary: {
        oracle: string;
        riskModel: string;
        settlement: string;
        premiumRange: string;
        trigger: string;
    };
    calculationMethod: {
        formula: string;
        variables: string[];
        example: string;
    };
}
