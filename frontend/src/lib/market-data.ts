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
        basePremium: number;
        surgeMultiplier: number;
        surgeReason?: string;
    };
    about: string;
    rules: string;
};

export const ALL_MARKETS: MarketDetail[] = [
    {
        id: "flight",
        title: "Travel Solutions",
        category: "travel",
        description: "Binary flight delay protection providing automated settlement once historical arrival latencies exceed one hundred twenty minutes.",
        price: "$5 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "5%",
            maxPayout: "$100 USDT",
            basePremium: 5,
            surgeMultiplier: 1.0,
        },
        about: "This parametric protection protocol activates automatically when a registered commercial flight suffers an arrival delay exceeding one hundred twenty minutes. The infrastructure utilizes the FlightAware AeroAPI and a Decentralized Oracle Network to ensure mathematical certainty in settlement. Upon verification of the delay event, capital is routed directly to the policyholder with no administrative claims process required.",
        rules: "1. Policy acquisition must occur at least two hours before scheduled departure. 2. Resolution evaluates as Triggered if official arrival exceeds the schedule by two hours or in the event of cancellation. 3. Binary settlement provides the full maximum payout upon trigger and zero otherwise."
    },
    {
        id: "agri",
        title: "Agriculture Index",
        category: "agri",
        description: "Cumulative precipitation protection with linear liquidity scaling between designated Strike and Exit index thresholds.",
        price: "$50 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "5%",
            maxPayout: "Up to $10,000 USDT",
            basePremium: 50,
            surgeMultiplier: 1.0,
        },
        about: "Agricultural producers can hedge against atmospheric moisture volatility using this cumulative index protection. The protocol monitors rainfall data from the NOAA Climate API to determine regional hydration levels. Liquidity settlement scales linearly as the actual rainfall index moves between the Strike and Exit thresholds, providing a precise financial buffer against drought or flooding events.",
        rules: "1. The Strike threshold must be mathematically greater than the Exit index. 2. Settlement scales linearly as the index moves between defined boundaries. 3. Smart contract automation handles expiration and settlement windows. 4. Maximum aggregate exposure is capped at ten million dollars per policy holder."
    },
    {
        id: "energy",
        title: "Energy Solutions",
        category: "energy",
        description: "Heating and Cooling Degree Day protection with tick based settlement on verified temperature extremes.",
        price: "$100 USDT",
        unit: "/ season",
        icon: "bolt",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
        riskBase: "ENERGY-ENT",
        bullet1: "OpenWeatherMap Oracle",
        bullet2: "Degree Day Tick Payout",
        rgb: "245, 158, 11",
        marketData: {
            resolutionSource: "OpenWeatherMap API",
            oracleNode: "Chainlink DON",
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "5%",
            maxPayout: "Up to $50,000 USDT",
            basePremium: 100,
            surgeMultiplier: 1.0,
        },
        about: "Utility providers and industrial operators utilize this protocol to hedge against temperature driven demand volatility. Each degree deviation from the Strike threshold triggers a fixed tick value in USDT settlement. This product allows energy stakeholders to smooth their revenue curves against unexpected seasonable temperature fluctuations using OpenWeatherMap data feeds.",
        rules: "1. Settlement equals the product of degree deviation and tick value, capped at the maximum payout. 2. No settlement occurs if the actual temperature remains within Strike boundaries. 3. Automated expiration logic is executed via decentralized automation nodes."
    },
    {
        id: "cat",
        title: "Catastrophe Proximity",
        category: "catastrophe",
        description: "Seismic event protection with tiered liquidity release based on epicenter proximity to secured coordinates.",
        price: "$200 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "5%",
            maxPayout: "Up to $100,000 USDT",
            basePremium: 200,
            surgeMultiplier: 1.0,
        },
        about: "Property owners and municipalities near active fault lines can utilize this seismic risk protocol. Upon detection of a qualifying earthquake by the USGS, the contract calculates the distance between the epicenter and the insured coordinates. Liquidity is released in tiers, with closer proximities receiving higher percentages of the maximum payout to cover immediate structural remediation costs.",
        rules: "1. Tier one proximity receives one hundred percent of payout while tier two receives fifty percent. 2. Distance is measured in meters from the provided coordinates to the verified epicenter. 3. Policy parameters are immutably locked at the time of purchase."
    },
    {
        id: "maritime",
        title: "Maritime Solutions",
        category: "maritime",
        description: "Port wind speed protection providing binary settlement when sustained velocities exceed the strike threshold.",
        price: "$150 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "5%",
            maxPayout: "Up to $50,000 USDT",
            basePremium: 150,
            surgeMultiplier: 1.0,
        },
        about: "Cargo operators and port authorities utilize this maritime protocol to hedge against extreme wind events that disrupt docking and logistics operations. By monitoring the Stormglass.io marine data network, the contract verifies when wind speeds at the designated port exceed safety thresholds. Upon verification, the contract triggers a binary liquidity release to offset operational delays and demurrage costs.",
        rules: "1. Binary settlement triggers at one hundred percent when wind speed equals or exceeds the strike. 2. Wind velocities are measured in knots at the specific port coordinates. 3. Automation nodes handle the truing process after the voyage window concludes."
    },
    {
        id: "heat-wave",
        title: "Utility Subsidy",
        category: "weather",
        description: "Extreme heat protection triggering on verified NOAA temperature indexes for industrial cooling stability.",
        price: "$100 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "15%",
            maxPayout: "$1,000 USDT",
            basePremium: 100,
            surgeMultiplier: 1.0,
        },
        about: "Prolonged extreme temperatures cause massive volatility in electricity expenditure for temperature sensitive industrial facilities. This protocol offers a dedicated financial hedge against these events. By monitoring NOAA reporting stations, the contract verifies the onset of a heatwave and releases liquidity to subsidize increased cooling and utility costs for the operator.",
        rules: "1. Strike temperature and duration parameters are set at the time of contract execution. 2. Resolution is based exclusively on primary reporting station data. 3. Premiums are dynamically calculated based on historical climate models for the target geography."
    },
    {
        id: "powder-protect",
        title: "Ski Trip Guarantee",
        category: "weather",
        description: "Snowfall base depth protection for alpine resort destinations using verified weather data.",
        price: "$500 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "20%",
            maxPayout: "$5,000 USDT",
            basePremium: 500,
            surgeMultiplier: 1.0,
        },
        about: "Travelers can protect their winter destination investments against unfavorable snow conditions. Powder Protect allows participants to hedge their vacation costs against a lack of snowfall. If the verified base depth at the resort falls below the historical baseline preceding arrival, the smart contract settles the policy value in USDT to mitigate lost utility and travel expenses.",
        rules: "1. Policy resolution is strictly bounded to the official API base depth measurements. 2. Settlement occurs at eight in the morning locale time on the arrival date. 3. Protection must be acquired at least ten days before the scheduled trip."
    },
    {
        id: "peg-shield",
        title: "Stablecoin Depeg",
        category: "ecommerce",
        description: "Automated tail risk protection for stablecoin assets utilizing Chainlink price references.",
        price: "Dynamic",
        unit: "payout",
        icon: "currency_exchange",
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-400",
        riskBase: "RISK-L8",
        bullet1: "Chainlink USD Feeds",
        bullet2: "Tail Risk Protection",
        rgb: "16, 185, 129",
        marketData: {
            resolutionSource: "Chainlink Price Feeds",
            oracleNode: "Chainlink Data Streams",
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "1.5%",
            maxPayout: "100% of Covered TVL",
            basePremium: 1000,
            surgeMultiplier: 1.0,
        },
        about: "Peg Shield functions as a decentralized credit default swap for digital assets. Large treasuries can utilize this protocol to protect massive stablecoin positions against extreme market volatility. If the primary stablecoin falls below the reference rate for a sustained duration, the protocol releases liquidity from isolated risk pools to restore the value for the covered participant.",
        rules: "1. The de-peg event must be sustained over a specific duration to filter out transient volatility. 2. Payouts are sourced from isolated and over-collateralized counter-party liquidity pools. 3. Resolution is triggered automatically when price feeds verify the breach."
    },
    {
        id: "sun-yield",
        title: "Solar Energy Hedge",
        category: "energy",
        description: "Solar farm irradiance output smoothing for predictable renewable energy revenue generation.",
        price: "$100 USDT",
        unit: "/ month",
        icon: "solar_power",
        iconBg: "bg-yellow-500/20",
        iconColor: "text-yellow-400",
        riskBase: "RISK-L9",
        bullet1: "Irradiance Indexes",
        bullet2: "Output Smoothing",
        rgb: "234, 179, 8",
        marketData: {
            resolutionSource: "Solcast and ECMWF",
            oracleNode: "Chainlink DON",
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "9%",
            maxPayout: "$2,500 USDT",
            basePremium: 100,
            surgeMultiplier: 1.0,
        },
        about: "Renewable energy operators utilize this protocol to flatten revenue volatility caused by cloud cover and low solar irradiance. By integrating satellite derived irradiance data on chain, the instrument provides automated payouts when sunlight levels fall below established historical averages for a specific farm location, ensuring consistent cash flow for debt service and operations.",
        rules: "1. The protocol resolves as underperforming based on aggregate monthly irradiance data. 2. Data is validated against multiple satellite weather endpoints. 3. Pricing is mapped to local atmospheric volatility models."
    },
    {
        id: "freight-wait",
        title: "Supply Chain Delay",
        category: "logistics",
        description: "Maritime freight demurrage and port congestion hedging for international trade logistics.",
        price: "$200 USDT",
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
            settlement: "USDT on Arbitrum Sepolia",
            riskPremium: "6%",
            maxPayout: "$10,000 USDT",
            basePremium: 200,
            surgeMultiplier: 1.0,
        },
        about: "Importers and logistics operators can hedge against port congestion and demurrage fines using absolute vessel tracking data. Freight Wait monitors maritime AIS systems to verify when cargo vessels are stationary in congestion zones. If berthing is delayed beyond the scheduled window, the protocol automatically releases liquidity to cover daily holding fees and operational disruptions.",
        rules: "1. Vessel tracking numbers are immutably bound to the policy at the time of purchase. 2. Resolution is triggered by consecutive stationary geofence polling over forty eight hours. 3. Payouts increment based on twenty four hour delay blocks."
    }
];
