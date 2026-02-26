export type PolicyStatus = "Active" | "Claimable" | "Expired" | "Processing" | "Claimed";

export interface Policy {
    id: string;
    type: "Flight" | "Cloud" | "Weather" | "Energy";
    status: PolicyStatus;
    premium: number;
    payout: number;
    expiration: string;
    metadata: {
        flightNumber?: string;
        serviceName?: string;
        location?: string;
    };
}

export interface OracleLog {
    id: string;
    target: string;
    status: "Success" | "Reverted" | "Pending";
    timestamp: string;
    message: string;
}

export interface TreasuryStat {
    timestamp: string;
    tvl: number;
    claimsPaid: number;
    activePolicies: number;
}
