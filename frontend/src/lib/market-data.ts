export type MarketDetail = {
    id: string;
    title: string;
    category: string;
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
        title: "Travel Solutions",
        category: "travel",
        description: "Binary flight delay insurance — automatic payout on delays exceeding 120 minutes.",
        price: "~$5 USDC",
        unit: "/ flight",
        icon: "flight_takeoff",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400",
        riskBase: "TRAVEL-ENT",
        bullet1: "FlightAware DON Oracle",
        bullet2: "Binary Trigger Payout",
        rgb: "0, 240, 255",
        marketData: {
            resolutionSource: "FlightAware AeroAPI",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "$100 USDC",
        },
        about: "This parametric insurance policy automatically triggers if your registered commercial flight is delayed by more than 120 minutes past scheduled arrival. The smart contract is wired directly to the FlightAware AeroAPI via a Chainlink Decentralized Oracle Network. On qualifying delay, your USDC payout is routed directly to your wallet — no claims needed.",
        rules: "1. Policy must be purchased at least 2 hours prior to scheduled departure. 2. Resolves 'DELAYED' if official arrival exceeds schedule by 120+ minutes or cancellation. 3. Binary payout — full maxPayout on trigger, zero otherwise."
    },
    {
        id: "agri",
        title: "Agriculture Index",
        category: "agri",
        description: "Cumulative rainfall insurance with linear payout scaling from Strike to Exit index.",
        price: "~$50 USDC",
        unit: "/ season",
        icon: "grass",
        iconBg: "bg-green-500/20",
        iconColor: "text-green-400",
        riskBase: "AGRI-ENT",
        bullet1: "NOAA Rainfall Oracle",
        bullet2: "Linear Index Payout",
        rgb: "34, 197, 94",
        marketData: {
            resolutionSource: "NOAA Climate API",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "Up to $10,000 USDC",
        },
        about: "Farmers and agricultural businesses can hedge against drought or excess rainfall using cumulative index-based insurance. Set a strike index (normal conditions) and exit index (catastrophe threshold). If the actual rainfall index falls between strike and exit, payout scales linearly. Below exit = full payout. Above strike = zero payout. Powered by NOAA weather data via Chainlink DON.",
        rules: "1. Strike must exceed exit index. 2. Payout linearly interpolated between strike and exit thresholds. 3. Chainlink Keepers auto-expire policies past their duration window. 4. Maximum payout capped at $10M per policy."
    },
    {
        id: "energy",
        title: "Energy Solutions",
        category: "energy",
        description: "Heating/Cooling Degree Day insurance — tick-based payout on temperature extremes.",
        price: "~$100 USDC",
        unit: "/ season",
        icon: "bolt",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
        riskBase: "ENERGY-ENT",
        bullet1: "OpenWeatherMap Oracle",
        bullet2: "Degree-Day Tick Payout",
        rgb: "245, 158, 11",
        marketData: {
            resolutionSource: "OpenWeatherMap API",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "Up to $50,000 USDC",
        },
        about: "Energy producers and consumers can hedge against temperature-driven demand spikes. Each degree above the strike threshold adds a fixed tick value to the payout. For example: if strike = 100 HDD, tick = $10 USDC, and actual = 150 HDD, payout = 50 ticks × $10 = $500. Payout is capped at maxPayout. Designed for utilities, data centers, and industrial operators with temperature-sensitive costs.",
        rules: "1. Payout = (actualDegree - strike) × tickValue, capped at maxPayout. 2. No payout if actual is below strike. 3. Auto-expires via Chainlink Keepers. 4. Maximum policy cap: $10M."
    },
    {
        id: "cat",
        title: "Catastrophe Proximity",
        category: "catastrophe",
        description: "Seismic event insurance with tiered payouts based on epicenter distance.",
        price: "~$200 USDC",
        unit: "/ event",
        icon: "earthquake",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400",
        riskBase: "CAT-ENT",
        bullet1: "USGS Earthquake Oracle",
        bullet2: "Tiered Distance Payout",
        rgb: "239, 68, 68",
        marketData: {
            resolutionSource: "USGS Earthquake API",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "Up to $100,000 USDC",
        },
        about: "Property owners, businesses, and municipalities near fault lines can insure against seismic events. Specify your coordinates and two tier radii. If an earthquake epicenter falls within Tier 1 (closest), you receive 100% of maxPayout. Within Tier 2, you receive 50%. Beyond Tier 2, no payout. Distance calculated from USGS earthquake data via Chainlink DON.",
        rules: "1. Two-tier payout: <Tier1 radius = 100%, <Tier2 radius = 50%, beyond = 0%. 2. Distance measured in meters from policy coordinates. 3. Auto-expires via Chainlink Keepers. 4. Maximum policy cap: $10M."
    },
    {
        id: "maritime",
        title: "Maritime Solutions",
        category: "maritime",
        description: "Port wind speed insurance — binary payout when wind exceeds the strike threshold.",
        price: "~$150 USDC",
        unit: "/ voyage",
        icon: "sailing",
        iconBg: "bg-indigo-500/20",
        iconColor: "text-indigo-400",
        riskBase: "MARITIME-ENT",
        bullet1: "Stormglass.io Oracle",
        bullet2: "Binary Wind Trigger",
        rgb: "99, 102, 241",
        marketData: {
            resolutionSource: "Stormglass.io API",
            oracleNode: "Chainlink DON",
            settlement: "USDC on Avalanche",
            riskPremium: "5%",
            maxPayout: "Up to $50,000 USDC",
        },
        about: "Shipping companies, port operators, and importers can insure against extreme wind conditions that cause port closures, vessel delays, and cargo damage. Set a wind speed strike (e.g., 34 knots — gale force). If the oracle reports wind speed at the target port exceeding the strike, the full maxPayout is released. Powered by Stormglass.io marine weather data via Chainlink DON.",
        rules: "1. Binary trigger: wind >= strike = 100% payout, below strike = 0%. 2. Wind speed measured in knots at the designated port. 3. Auto-expires via Chainlink Keepers. 4. Maximum policy cap: $10M."
    },
    {
        id: "heat-wave",
        title: "Utility Subsidy",
        category: "weather",
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
        category: "weather",
        description: "Snowfall deficit coverage for winter resorts.",
        price: "$500 USDC",
        unit: "/ trip",
        icon: "ac_unit",
        iconBg: "bg-slate-300/20",
        iconColor: "text-foreground",
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
        category: "ecommerce",
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
        category: "energy",
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
        category: "logistics",
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
