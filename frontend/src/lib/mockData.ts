import { OracleLog, Policy, TreasuryStat } from "../types/dashboard";

export const mockPolicies: Policy[] = [
    {
        id: "POL-[...1092]",
        type: "Flight",
        status: "Active",
        premium: 50,
        payout: 500,
        expiration: new Date(Date.now() + 86400000 * 2).toISOString(),
        metadata: { flightNumber: "EK202" }
    },
    {
        id: "POL-[...1088]",
        type: "Cloud",
        status: "Claimable",
        premium: 100,
        payout: 2500,
        expiration: new Date(Date.now() - 3600000).toISOString(),
        metadata: { serviceName: "AWS us-east-1" }
    },
    {
        id: "POL-[...1075]",
        type: "Weather",
        status: "Expired",
        premium: 200,
        payout: 10000,
        expiration: new Date(Date.now() - 86400000 * 10).toISOString(),
        metadata: { location: "Miami, FL" }
    }
];

export const mockOracleLogs: OracleLog[] = [
    { id: "LOG-[...991]", target: "FlightAware API", status: "Success", timestamp: new Date(Date.now() - 120000).toISOString(), message: "EK202 departed on time." },
    { id: "LOG-[...990]", target: "AWS Status Page", status: "Reverted", timestamp: new Date(Date.now() - 3600000).toISOString(), message: "us-east-1 outage detected. Fetching confirmation." },
    { id: "LOG-[...989]", target: "Chainlink Data Feed", status: "Success", timestamp: new Date(Date.now() - 7200000).toISOString(), message: "USDC/USD peg verified." }
];

export const mockTreasuryStats: TreasuryStat[] = Array.from({ length: 30 }).map((_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    tvl: 4500000 + Math.random() * 500000 + i * 14000,
    claimsPaid: 120000 + i * 5000 + Math.random() * 2000,
    activePolicies: 1500 + i * 10 + Math.floor(Math.random() * 20),
}));
