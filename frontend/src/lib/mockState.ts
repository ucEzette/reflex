import { ActivePolicy, OracleFeedLog, TreasuryMetrics, MarketProduct } from '../types/core';

export const generateMockPolicies = (): ActivePolicy[] => [
    {
        id: "POL-X89B-4412",
        type: "Flight",
        status: "Monitoring",
        premium: 50,
        payout: 500,
        purchaseDate: new Date(Date.now() - 86400000).toISOString(),
        expiration: new Date(Date.now() + 86400000 * 2).toISOString(),
        context: "UA123: In Air - 5m Late",
        oracleData: {
            lastCheck: new Date(Date.now() - 300000).toISOString(),
            rawPayload: "{ status: 'Active', delay: 5, source: 'FlightAware' }"
        }
    },
    {
        id: "POL-C77A-9901",
        type: "Cloud",
        status: "Risk Detected",
        premium: 150,
        payout: 3000,
        purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiration: new Date(Date.now() + 86400000 * 25).toISOString(),
        context: "AWS us-east-1: Elevated Error Rates",
        oracleData: {
            lastCheck: new Date(Date.now() - 60000).toISOString(),
            rawPayload: "{ region: 'us-east-1', errors: '+15%', source: 'DownDetector' }"
        }
    },
    {
        id: "POL-W22F-1188",
        type: "Web3",
        status: "Claim Triggered",
        premium: 20,
        payout: 100,
        purchaseDate: new Date(Date.now() - 86400000 * 15).toISOString(),
        expiration: new Date().toISOString(),
        context: "Gas > 150 Gwei for 3 Blocks",
        oracleData: {
            lastCheck: new Date().toISOString(),
            rawPayload: "{ network: 'Ethereum', gwei: 165, blocks: 3, source: 'Etherscan' }"
        }
    }
];

export const generateOracleLogs = (): OracleFeedLog[] => [
    {
        id: "LOG-A19",
        requestID: "REQ-998",
        target: "Flight UA123",
        status: "Success",
        timestamp: new Date(Date.now() - 15000).toISOString(),
        message: "Status: In Air (5m Late). No automatic trigger required."
    },
    {
        id: "LOG-A18",
        requestID: "REQ-997",
        target: "AWS us-east-1",
        status: "Pending",
        timestamp: new Date(Date.now() - 45000).toISOString(),
        message: "Elevated API errors detected. Querying secondary consensus node."
    },
    {
        id: "LOG-A17",
        requestID: "REQ-996",
        target: "ETH Gas Tracker",
        status: "Reverted",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        message: "Gas spike confirmed. Triggering Payout Module: POL-W22F-1188."
    }
];

export const generateMarketProducts = (): MarketProduct[] => [
    {
        id: "prod-flight",
        title: "Flight Delay",
        category: "Travel",
        description: "Instant compensation if your flight is delayed over 2 hours or cancelled.",
        iconType: "Plane",
        badges: ["High Demand", "Instant Payout"],
        inputPlaceholder: "Enter Flight # (e.g. EK202)"
    },
    {
        id: "prod-cloud",
        title: "Cloud-Down Outage",
        category: "Web3",
        description: "Income protection for remote workers dependent on SaaS tools.",
        iconType: "Cloud",
        badges: ["B2B"],
        inputPlaceholder: "Select Service (e.g. AWS)"
    },
    {
        id: "prod-rain",
        title: "Rain-Check Event",
        category: "Weather",
        description: "Guarantee a perfect day for your outdoor festival or wedding.",
        iconType: "CloudRain",
        badges: ["Seasonal"],
        inputPlaceholder: "Enter GPS Coordinates"
    },
    {
        id: "prod-gas",
        title: "Gas-Guzzler Hedge",
        category: "Web3",
        description: "Protection against sudden L1 transaction fee spikes during launches.",
        iconType: "Zap",
        badges: ["Degen Favorite"],
        inputPlaceholder: "Target Gwei Limit"
    }
];

export const generateTreasuryMetrics = (): TreasuryMetrics[] => {
    const data: TreasuryMetrics[] = [];
    const now = Date.now();
    for(let i=30; i>=0; i--) {
        data.push({
            timestamp: new Date(now - (i * 86400000)).toISOString().split('T')[0],
            tvl: 5000000 + (Math.random() * 200000) + ((30-i) * 15000),
            claimsPaid: 250000 + ((30-i) * 5000) + (Math.random() * 4000),
            activePolicies: 1200 + ((30-i) * 20),
            efficiencyRatio: 8.5 + (Math.random() * 2)
        });
    }
    return data;
};
