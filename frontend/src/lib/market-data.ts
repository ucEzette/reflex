export type MarketDetail = {
    id: string;
    title: string;
    description: string;
    price: string;
    unit: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    riskBase: string;
    bullet1: string;
    bullet2: string;
    rgb: string;
    marketData: {
        resolutionSource: string;
        oracleNode: string;
        settlement: string;
        riskPremium: string;
        maxPayout: string;
    };
    about: string;
    rules: string;
};

export const ALL_MARKETS: MarketDetail[] = [
    {
        id: "flight",
        title: "Flight Delay",
        description: "Insure your flight against delays exceeding 120 minutes.",
        price: "$5 USDC",
        unit: "/ flight",
        icon: "flight_takeoff",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400",
        riskBase: "RISK-L1",
        bullet1: "Instant Oracle Payout",
        bullet2: "Global Coverage",
        rgb: "0, 240, 255",
        marketData: {
            resolutionSource: "FlightAware API",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "$100 USDC",
        },
        about: "This parametric insurance policy automatically triggers if your registered commercial flight is delayed by more than predefined parameters (e.g., 120 minutes past scheduled arrival time). Rather than waiting weeks for a human claims adjuster, the smart contract is wired directly to the FlightAware AeroAPI via a Chainlink Decentralized Oracle Network. If the oracle observes a qualifying delay, your USDC payout is routed directly to your connected wallet instantly while you are still at the terminal.",
        rules: "1. Policy must be purchased at least 2 hours prior to scheduled departure. 2. Resolves 'DELAYED' if the official arrival time exceeds the scheduled time by 120 minutes or the flight is cancelled. 3. Payouts are hardcoded to the maximum policy limit established at purchase."
    },
    {
        id: "cloud-down",
        title: "SaaS Outage",
        description: "Hedge against critical AWS, GCP, or Azure regional downtime.",
        price: "$50 USDC",
        unit: "/ down hr",
        icon: "cloud_off",
        iconBg: "bg-purple-500/20",
        iconColor: "text-purple-400",
        riskBase: "RISK-L2",
        bullet1: "API Disruption Monitor",
        bullet2: "Lost Income Cover",
        rgb: "168, 85, 247",
        marketData: {
            resolutionSource: "AWS Health API",
            oracleNode: "Chainlink Keepers",
            settlement: "USDC on Avalanche",
            riskPremium: "8%",
            maxPayout: "$500 USDC / Day",
        },
        about: "Enterprise businesses lose thousands of dollars per minute when primary cloud providers go offline. This micro-policy creates a direct financial hedge against infrastructure blackouts (e.g., AWS us-east-1 outages). The smart contract continuously polls official provider health endpoints. The moment an outage is confirmed across multiple nodes, the policy activates a tiered hourly payout to subsidize your lost enterprise revenue—no impact reports required.",
        rules: "1. Policy covers a single designated cloud region. 2. Resolves 'OUTAGE' if the official API reports a Sev-1 degradation lasting longer than 15 consecutive minutes. 3. Hourly payouts cap at the 24-hour maximum."
    },
    {
        id: "rain-check",
        title: "Event Cover",
        description: "Raincheck protection for outdoor events and festivals.",
        price: "$100 USDC",
        unit: "/ mm rain",
        icon: "umbrella",
        iconBg: "bg-cyan-500/20",
        iconColor: "text-cyan-400",
        riskBase: "RISK-L3",
        bullet1: "Weather Data Oracle",
        bullet2: "Automated Claims",
        rgb: "6, 182, 212",
        marketData: {
            resolutionSource: "NOAA / OpenWeather",
            oracleNode: "Chainlink Any-API",
            settlement: "USDC on Avalanche",
            riskPremium: "12%",
            maxPayout: "$10,000 USDC",
        },
        about: "Weather risk can bankrupt independent event organizers. This policy replaces complex traditional event cancellation insurance with a binary, code-driven agreement. By locking premium into the pool, you buy specific weather conditions (e.g., < 0.5 inches of rain at a specific lat/long during a 6-hour window). If a decentralized oracle consensus determines precipitation breached the threshold during your event, the smart contract immediately releases your payout.",
        rules: "1. Coordinates and activation window must be finalized 72 hours prior to the event. 2. Resolves 'BREACH' via median precipitation data across three independent weather APIs. 3. Payout triggers regardless of whether the event is actually cancelled."
    },
    {
        id: "gas-guzzler",
        title: "ETH Gas Hedge",
        description: "Protect against sudden Ethereum layer 1 base fee spikes.",
        price: "0.05 ETH",
        unit: "/ spike",
        icon: "local_gas_station",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
        riskBase: "RISK-L4",
        bullet1: "Etherscan Tracker",
        bullet2: "Tx Fee Subsidy",
        rgb: "245, 158, 11",
        marketData: {
            resolutionSource: "Ethereum Mempool",
            oracleNode: "Chainlink OCR",
            settlement: "WETH on Avalanche",
            riskPremium: "3%",
            maxPayout: "0.5 ETH",
        },
        about: "For heavily active DeFi traders, sudden gas wars can obliterate profit margins. The Gas Guzzler policy is a financial derivative acting as insurance against network congestion. You select a strike price (e.g., 150 Gwei). If the 15-minute Time-Weighted Average Price (TWAP) of Ethereum L1 base fees exceeds your strike, the contract pays out a subsidy to offset your execution costs. Perfect for complex smart-contract deployments or arbitrage bots.",
        rules: "1. Resolves 'SPIKE' if the median Gwei over any 15-minute epoch breaches the strike price. 2. Payout scales linearly up to the max payout limit. 3. Settled entirely on a low-fee L2/L1 to avoid gas costs on the payout itself."
    },
    {
        id: "shipping-shield",
        title: "Delivery Guarantee",
        description: "Supply chain SLA enforcement and demurrage protection.",
        price: "$20 USDC",
        unit: "/ day late",
        icon: "local_shipping",
        iconBg: "bg-green-500/20",
        iconColor: "text-green-400",
        riskBase: "RISK-L5",
        bullet1: "Logistics Oracle",
        bullet2: "SLA Enforcement",
        rgb: "34, 197, 94",
        marketData: {
            resolutionSource: "FedEx/UPS/DHL API",
            oracleNode: "Chainlink External Adapter",
            settlement: "USDC on Avalanche",
            riskPremium: "4%",
            maxPayout: "$200 USDC",
        },
        about: "If an e-commerce platform promises 2-day delivery and fails, this contract forces the logistics provider to automatically compensate the consumer. Built specifically for wholesale shippers and high-value B2C platforms, the Delivery Guarantee pings tracking numbers against official carrier APIs. When a package drops past its guaranteed Service Level Agreement (SLA), the late fees are automatically escrowed to the buyer.",
        rules: "1. Valid tracking number must be submitted at time of purchase. 2. Resolves 'LATE' if package status is not 'Delivered' by 23:59 local time on the guaranteed date. 3. Force-majeure exceptions (acts of god) are not coded; payout is absolute."
    },
    {
        id: "heat-wave",
        title: "Utility Subsidy",
        description: "Heatwave protection triggering on NOAA temperature indexes.",
        price: "$100 USDC",
        unit: "/ wave",
        icon: "thermostat",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400",
        riskBase: "RISK-L6",
        bullet1: "NOAA Temperature Feed",
        bullet2: "AC Cost Cover",
        rgb: "239, 68, 68",
        marketData: {
            resolutionSource: "NOAA Climate Data",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "15%",
            maxPayout: "$1,000 USDC",
        },
        about: "Extreme summer temperatures lead to massive, unpredictable spikes in electricity bills for industrial cooled warehouses, server farms, and residential consumers alike. This parametric contract offers a clean financial hedge against the weather. By monitoring NOAA temperature reporting stations in your ZIP code, the policy triggers a cash injection the moment a 'Heatwave' (e.g., 3 consecutive days over 100°F) is mathematically verified.",
        rules: "1. Strike temperature and duration parameters set at execution. 2. Resolves 'TRIGGERED' based exclusively on primary reporting station data, ignoring micro-climates. 3. Premium dynamically priced based on historical climate models for the target area."
    },
    {
        id: "powder-protect",
        title: "Ski Trip Guarantee",
        description: "Snowfall deficit coverage for winter resorts.",
        price: "$500 USDC",
        unit: "/ trip",
        icon: "ac_unit",
        iconBg: "bg-slate-300/20",
        iconColor: "text-slate-300",
        riskBase: "RISK-L7",
        bullet1: "Snowfall API Link",
        bullet2: "Resort Weather Truing",
        rgb: "203, 213, 225",
        marketData: {
            resolutionSource: "OnTheSnow API",
            oracleNode: "Chainlink External Adapter",
            settlement: "USDC on Avalanche",
            riskPremium: "20%",
            maxPayout: "$5,000 USDC",
        },
        about: "Booking a $10,000 ski trip months in advance carries the massive risk of encountering a barren, snowless mountain. Powder Protect allows tourists to hedge their vacation investment. If the aggregate accumulated snowfall at the target resort over the 14 days preceding your arrival falls below the historical baseline (e.g., < 12 inches base depth), the smart contract refunds your lift tickets and lodging costs via stablecoin.",
        rules: "1. Policy strictly bounded to the official API base-depth measurements of the designated resort. 2. Resolves 'DEFICIT' at 08:00 AM local time on the arrival date. 3. Cannot be purchased within 10 days of the trip."
    },
    {
        id: "peg-shield",
        title: "Stablecoin De-Peg",
        description: "USDT/USDC tail-risk protection for DeFi treasuries.",
        price: "Dynamic",
        unit: "payout",
        icon: "currency_exchange",
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-400",
        riskBase: "RISK-L8",
        bullet1: "Chainlink USD Feeds",
        bullet2: "Tail-Risk Protection",
        rgb: "16, 185, 129",
        marketData: {
            resolutionSource: "Chainlink Price Feeds",
            oracleNode: "Chainlink Data Streams",
            settlement: "USDC on Avalanche",
            riskPremium: "1.5%",
            maxPayout: "100% of Covered TVL",
        },
        about: "In the wake of algorithmic stablecoin collapses and banking crises, 'stable' assets are never entirely without risk. Peg Shield operates as a decentralized Credit Default Swap. Treasuries deposit multi-million dollar premiums to protect massive stablecoin positions. If the primary stablecoin (e.g., USDT) falls below $0.95 against the USD reference rate for longer than a 2-hour TWAP, the protocol pays out 1:1 using heavily collateralized, isolated risk pools.",
        rules: "1. De-peg must be sustained over the TWAP duration to filter out flash-crashes. 2. Payouts are sourced from isolated, over-collateralized counter-party pools. 3. Resolves 'DEFAULT' automatically if the Chainlink feed confirms the breach."
    },
    {
        id: "sun-yield",
        title: "Solar Energy Hedge",
        description: "Solar farm irradiance output smoothing.",
        price: "$100 USDC",
        unit: "/ month",
        icon: "solar_power",
        iconBg: "bg-yellow-500/20",
        iconColor: "text-yellow-400",
        riskBase: "RISK-L9",
        bullet1: "Irradiance Indexes",
        bullet2: "Output Smoothing",
        rgb: "234, 179, 8",
        marketData: {
            resolutionSource: "Solcast / ECMWF",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "9%",
            maxPayout: "$2,500 USDC",
        },
        about: "Commercial solar farms require predictable megawatt generation to satisfy debt obligations. Prolonged overcast weather patterns can destroy monthly yield. By utilizing satellite-derived Direct Normal Irradiance (DNI) data pushed on-chain, this parametric instrument issues payouts when sunlight falls 15% or more below the 10-year historical average for the farm's geographic sector. This completely flattens volatile revenue curves for renewable energy operators.",
        rules: "1. Resolves 'UNDER_PERFORMING' based on aggregate monthly DNI data. 2. Validated against multi-source satellite irradiance endpoints. 3. Premium dynamically mapped to local atmospheric volatility models."
    },
    {
        id: "freight-wait",
        title: "Supply Chain Delay",
        description: "Maritime freight demurrage and port-congestion hedge.",
        price: "$200 USDC",
        unit: "/ day",
        icon: "directions_boat",
        iconBg: "bg-indigo-500/20",
        iconColor: "text-indigo-400",
        riskBase: "RISK-L10",
        bullet1: "Maritime Fleet Tracking",
        bullet2: "Demurrage Hedge",
        rgb: "99, 102, 241",
        marketData: {
            resolutionSource: "MarineTraffic AIS",
            oracleNode: "Chainlink Any-API",
            settlement: "USDC on Avalanche",
            riskPremium: "6%",
            maxPayout: "$10,000 USDC",
        },
        about: "When container ships idle outside congested ports (like Long Beach or Rotterdam), importers are hit with catastrophic demurrage (late/holding) fees that destroy product margins. Freight Wait utilizes absolute GPS positioning via maritime AIS systems. If the target vessel drops anchor in a designated congestion zone outside the port for more than 48 hours past scheduled berthing, the contract automatically releases daily liquidity to cover the importer's fines.",
        rules: "1. Vessel IMO tracking number legally bound to the hash at purchase. 2. Resolves 'DEMURRAGE' triggered by consecutive stationary geofence polling over 48 hours. 3. Payouts increment strictly per 24 hours delayed."
    }
];
