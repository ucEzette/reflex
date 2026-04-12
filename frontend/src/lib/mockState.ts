import { MarketProduct } from '../types/market';
import { CONTRACTS } from './contracts';

export const generateMarketProducts = (): MarketProduct[] => [
    {
        id: "flight",
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
            settlement: "USDT on Arbitrum Sepolia",
            premiumRange: "$15 – $120 USDT per flight (2.5× loading)",
            trigger: "Arrival delay exceeds 120 minutes or cancellation"
        },
        calculationMethod: {
            formula: "Premium = P(delay) × MaxPayout × LoadingFactor × (1 + ProtocolMargin)",
            variables: [
                "P(delay) — Historical delay probability for the route (FlightAware)",
                "MaxPayout — User-selected coverage cap (e.g. $1000 USDT)",
                "LoadingFactor — 2.5× actuarial loading for capital reserves",
                "ProtocolMargin — 30% fee for LP reserve contribution"
            ],
            example: "Route with 3.3% delay rate, $1000 payout → $1000 × 0.083 × 1.30 = $107.90 premium"
        }
    },
    {
        id: "agri",
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
            settlement: "USDT on Arbitrum Sepolia",
            premiumRange: "$50 – $500 USDT per season",
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
        id: "energy",
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
            settlement: "USDT on Arbitrum Sepolia",
            premiumRange: "$100 – $1,000 USDT per month",
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
        id: "cat",
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
            settlement: "USDT on Arbitrum Sepolia",
            premiumRange: "$200 – $5,000 USDT per policy",
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
        id: "maritime",
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
            settlement: "USDT on Arbitrum Sepolia",
            premiumRange: "$100 – $2,000 USDT per voyage",
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
