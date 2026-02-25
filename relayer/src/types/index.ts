export interface PolicyInfo {
    policyId: string;
    policyholder: string;
    apiTarget: string;
    premiumPaid: bigint;
    payoutAmount: bigint;
    expirationTime: bigint;
    isActive: boolean;
    isClaimed: boolean;
}

export interface FlightData {
    flightId: string;
    flightDate: string;
    scheduledArrival: string;
    actualArrival: string;
    delaySeconds: number;
    status: string;
}
