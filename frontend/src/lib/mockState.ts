import { ActivePolicy, OracleFeedLog, TreasuryMetrics, MarketProduct } from '../types/market';
import { CONTRACTS } from './contracts';

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
        title: "Travel Solutions",
        category: "Travel",
        description: "Binary delayed triggers executing direct linear compensation.",
        iconType: "Plane",
        badges: ["High Demand", "Instant Payout"],
        inputPlaceholder: "Enter Flight # (e.g. EK202)",
        contractAddress: CONTRACTS.TRAVEL,
        tooltipSummary: {
            oracle: "FlightAware AeroAPI via Chainlink DON",
            riskModel: "Binary trigger — delay ≥ 120 min = full payout",
            settlement: "USDC on Avalanche C-Chain",
            premiumRange: "$5 – $25 USDC per flight",
            trigger: "Arrival delay exceeds 120 minutes or cancellation"
        },
        calculationMethod: {
            formula: "Premium = P(delay) × MaxPayout × (1 + ProtocolMargin)",
            variables: [
                "P(delay) — Historical delay probability for the route (5–15%)",
                "MaxPayout — User-selected coverage cap (e.g. $100 USDC)",
                "ProtocolMargin — Fixed 10% fee for LP reserve contribution"
            ],
            example: "Route with 8% delay rate, $100 payout → $100 × 0.08 × 1.10 = $8.80 premium"
        }
    },
    {
        id: "prod-agri",
        title: "Agriculture Solutions",
        category: "Agriculture",
        description: "Rainfall/Drought cumulative index scaling dynamically from Strike to Exit.",
        iconType: "CloudRain",
        badges: ["B2B"],
        inputPlaceholder: "Select Zone (e.g. US-CORN)",
        contractAddress: CONTRACTS.AGRI,
        tooltipSummary: {
            oracle: "NOAA / OpenWeather via Chainlink Any-API",
            riskModel: "Cumulative index — linear payout between Strike and Exit",
            settlement: "USDC on Avalanche C-Chain",
            premiumRange: "$50 – $500 USDC per season",
            trigger: "Accumulated rainfall below Strike (drought) or above Exit (flood)"
        },
        calculationMethod: {
            formula: "Payout = MaxPayout × (Strike − Actual) / (Strike − Exit)",
            variables: [
                "Strike — Rainfall threshold that starts triggering payout (e.g. 80mm)",
                "Exit — Floor below which maximum payout is guaranteed (e.g. 40mm)",
                "Actual — Measured cumulative rainfall over the policy window"
            ],
            example: "Strike=80mm, Exit=40mm, Actual=60mm, MaxPayout=$1000 → $1000 × (80-60)/(80-40) = $500"
        }
    },
    {
        id: "prod-energy",
        title: "Energy Solutions",
        category: "Energy",
        description: "Degree Days index protection calculating base deviation tick limits.",
        iconType: "Zap",
        badges: ["Grid", "Linear Tick"],
        inputPlaceholder: "Target Grid (e.g. ERCOT)",
        contractAddress: CONTRACTS.ENERGY,
        tooltipSummary: {
            oracle: "ECMWF / NOAA Climate Data via Chainlink DON",
            riskModel: "Degree Days deviation — tick-based linear scaling",
            settlement: "USDC on Avalanche C-Chain",
            premiumRange: "$100 – $1,000 USDC per month",
            trigger: "Cooling/Heating Degree Days exceed the seasonal baseline by ≥ 15%"
        },
        calculationMethod: {
            formula: "Payout = TickValue × max(0, AccumulatedDD − BaselineDD)",
            variables: [
                "TickValue — USD per Degree Day above baseline (e.g. $5/DD)",
                "AccumulatedDD — Σ max(0, DailyTemp − 18°C) over the policy period",
                "BaselineDD — 10-year historical average for the target grid zone"
            ],
            example: "Baseline=200DD, Actual=260DD, TickValue=$5 → $5 × (260-200) = $300 payout"
        }
    },
    {
        id: "prod-cat",
        title: "Wildfire & Parametric Reinsurance",
        category: "Catastrophe",
        description: "Haversine off-chain Oracle tier mapping using absolute epicenter radii.",
        iconType: "Flame",
        badges: ["High Tier", "Geofenced"],
        inputPlaceholder: "Enter GPS Params...",
        contractAddress: CONTRACTS.CATASTROPHE,
        tooltipSummary: {
            oracle: "NASA FIRMS / Copernicus Satellite via Chainlink External Adapter",
            riskModel: "Proximity tiered — 100%/50%/0% based on distance from epicenter",
            settlement: "USDC on Avalanche C-Chain",
            premiumRange: "$200 – $5,000 USDC per policy",
            trigger: "Confirmed wildfire/earthquake epicenter within registered radius"
        },
        calculationMethod: {
            formula: "Tier = Haversine(UserGPS, EpicenterGPS); Payout = TierMultiplier × MaxPayout",
            variables: [
                "Haversine — Great-circle distance formula between two GPS coordinates",
                "Tier 1 (< 25km) → 100% payout",
                "Tier 2 (25–75km) → 50% payout",
                "Tier 3 (> 75km) → 0% payout (no claim)"
            ],
            example: "User at 34.05°N, epicenter 22km away → Tier 1 → 100% × $5,000 = $5,000"
        }
    },
    {
        id: "prod-maritime",
        title: "Maritime Solutions",
        category: "Maritime",
        description: "Absolute Windspeed/Wave limits protecting against port-closure logistics failure.",
        iconType: "Anchor",
        badges: ["Supply Chain"],
        inputPlaceholder: "Target Port Code",
        contractAddress: CONTRACTS.MARITIME,
        tooltipSummary: {
            oracle: "MarineTraffic AIS / NOAA Buoy Data via Chainlink Any-API",
            riskModel: "Threshold breach — binary trigger on windspeed or wave height",
            settlement: "USDC on Avalanche C-Chain",
            premiumRange: "$100 – $2,000 USDC per voyage",
            trigger: "Sustained winds > 50kn or wave height > 4m for ≥ 6 consecutive hours"
        },
        calculationMethod: {
            formula: "Premium = BaseRate × VoyageDuration × SeasonalMultiplier",
            variables: [
                "BaseRate — Historical port-closure frequency for the route (2–8%)",
                "VoyageDuration — Covered window in days",
                "SeasonalMultiplier — 1.0 (calm) to 2.5 (hurricane season)"
            ],
            example: "5% base, 14-day voyage, hurricane season (2.0x) → $1000 × 0.05 × 14 × 2.0 = $1,400"
        }
    }
];

export const generateTreasuryMetrics = (): TreasuryMetrics[] => {
    const data: TreasuryMetrics[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
        data.push({
            timestamp: new Date(now - (i * 86400000)).toISOString().split('T')[0],
            tvl: 5000000 + (Math.random() * 200000) + ((30 - i) * 15000),
            claimsPaid: 250000 + ((30 - i) * 5000) + (Math.random() * 4000),
            activePolicies: 1200 + ((30 - i) * 20),
            efficiencyRatio: 8.5 + (Math.random() * 2)
        });
    }
    return data;
};
