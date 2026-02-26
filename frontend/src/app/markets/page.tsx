import React from 'react';
import Link from 'next/link';

interface MarketItem {
    id: string;
    title: string;
    description: string;
    trigger: string;
    policy: string;
    icon: string;
    active?: boolean;
    href?: string;
    accentColor: string;
}

const markets: MarketItem[] = [
    {
        id: "flight",
        title: "Reflex L1: Flight Delay",
        description: "Instant, automated compensation for travelers stuck at the gate.",
        trigger: "FlightAware AeroAPI / Aviationstack status",
        policy: "If Flight delayed >2h or cancelled ➔ $50 USDC",
        icon: "flight_takeoff",
        active: true,
        href: "/markets/flight",
        accentColor: "from-cyan-500 to-blue-600"
    },
    {
        id: "cloud-down",
        title: "Cloud-Down: SaaS Outage",
        description: "Income protection for remote workers dependent on cloud tools.",
        trigger: "DownDetector / Status Page APIs",
        policy: "If Slack/AWS down >30 min (Biz Hrs) ➔ $50 USDC",
        icon: "cloud_off",
        accentColor: "from-purple-500 to-pink-600"
    },
    {
        id: "rain-check",
        title: "Rain-Check: Event Cover",
        description: "\"Perfect Day\" guarantee for outdoor events, festivals, and weddings.",
        trigger: "OpenWeatherMap / NOAA historical precipitation",
        policy: "If rain >5mm at GPS during event ➔ $100 USDC",
        icon: "umbrella",
        accentColor: "from-blue-400 to-cyan-400"
    },
    {
        id: "gas-guzzler",
        title: "Gas-Guzzler: ETH Gas Hedge",
        description: "Protection against sudden spikes in blockchain transaction fees.",
        trigger: "Etherscan Gas Tracker API",
        policy: "If average gas >150 gwei for 3 blocks ➔ 0.05 ETH",
        icon: "local_gas_station",
        accentColor: "from-amber-500 to-orange-600"
    },
    {
        id: "shipping-shield",
        title: "Shipping-Shield: Delivery Guarantee",
        description: "Compensation for missed '2-Day Shipping' promises.",
        trigger: "FedEx / UPS / DHL Tracking APIs",
        policy: "If package not 'Delivered' by promised date ➔ $20 USDC",
        icon: "local_shipping",
        accentColor: "from-green-500 to-emerald-600"
    },
    {
        id: "heat-wave",
        title: "Heat-Wave: Utility Subsidy",
        description: "Financial relief for households during extreme temperature spikes.",
        trigger: "Local Weather Station APIs",
        policy: "If temp >95°F for 5 consecutive days ➔ $100 USDC",
        icon: "thermostat",
        accentColor: "from-red-500 to-orange-500"
    },
    {
        id: "powder-protect",
        title: "Powder-Protect: Ski Trip Guarantee",
        description: "Vacation insurance for skiers who fear empty, green grass slopes.",
        trigger: "OnTheSnow / WeatherUnlocked APIs",
        policy: "If total snowfall <2 inches during trip ➔ $500 USDC",
        icon: "ac_unit",
        accentColor: "from-slate-300 to-white"
    },
    {
        id: "peg-shield",
        title: "Peg-Shield: Stablecoin De-Peg",
        description: "Catastrophe insurance and tail-risk protection for stablecoin holders.",
        trigger: "Chainlink USDC/USD Price Feed",
        policy: "If 24h VWAP of USDC drops below $0.98 ➔ Payout difference",
        icon: "currency_exchange",
        accentColor: "from-emerald-400 to-teal-500"
    },
    {
        id: "sun-yield",
        title: "Sun-Yield: Solar Energy Hedge",
        description: "Income protection for solar panel owners during cloudy months.",
        trigger: "Solargis / OpenWeather Solar Irradiance",
        policy: "If irradiance 20% below 10-yr average ➔ $100 USDC",
        icon: "solar_power",
        accentColor: "from-yellow-400 to-amber-500"
    },
    {
        id: "freight-wait",
        title: "Freight-Wait: Supply Chain Delay",
        description: "Revenue protection for small businesses importing port goods.",
        trigger: "MarineTraffic / Kpler Vessel APIs",
        policy: "If container dwells in port >7 days ➔ $200 USDC/day",
        icon: "directions_boat",
        accentColor: "from-indigo-500 to-blue-700"
    },
    {
        id: "ride-surge",
        title: "Ride-Surge: Uber/Lyft Price Cap",
        description: "Cost protection against 5x surge pricing after nightlife events.",
        trigger: "Ride-share estimate aggregated APIs",
        policy: "If ride home exceeds $50 from 1AM-3AM ➔ Payout difference",
        icon: "local_taxi",
        accentColor: "from-pink-500 to-rose-600"
    },
    {
        id: "aqi-guard",
        title: "AQI-Guard: Pollution Health Shield",
        description: "Health-related financial aid during hazardous air quality events.",
        trigger: "World Air Quality Index (WAQI) API",
        policy: "If AQI > 200 for 3 consecutive days ➔ $50 USDC",
        icon: "masks",
        accentColor: "from-zinc-400 to-stone-500"
    },
];

export default function MarketsHub() {
    return (
        <div className="min-h-screen bg-[#050510] text-[#E0E0E0] pt-32 pb-24 overflow-hidden relative">
            {/* Background aesthetics */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-32 left-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-64 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 font-display tracking-tight mb-4">
                        Parametric Markets
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Automated, frictionless insurance products powered by <span className="text-cyan-400 font-mono text-sm tracking-wide bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">Chainlink Functions</span> and Decentralized Oracle Networks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {markets.map((market) => (
                        <div key={market.id} className={`parent group transition-transform duration-500 ${market.active ? 'live-market cursor-pointer hover:-translate-y-2' : 'opacity-80 grayscale-[30%] hover:grayscale-0 hover:-translate-y-2'}`}>
                            <div className="card-3d relative">
                                <div className="logo">
                                    <span className="circle circle1"></span>
                                    <span className="circle circle2"></span>
                                    <span className="circle circle3"></span>
                                    <span className="circle circle4"></span>
                                    <span className="circle circle5">
                                        <span className="material-symbols-outlined text-white text-[20px] drop-shadow-md">{market.icon}</span>
                                    </span>
                                </div>
                                <div className="glass"></div>

                                {/* Card Content */}
                                <div className="content relative z-10 w-full h-full flex flex-col text-left">
                                    {/* Header Status */}
                                    <div className="mb-4">
                                        {market.active ? (
                                            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)] w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                LIVE
                                            </span>
                                        ) : (
                                            <span className="bg-white/5 text-slate-300 text-[10px] font-bold font-mono tracking-widest px-3 py-1 rounded-full border border-white/10 w-fit">
                                                COMING SOON
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 font-display drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                                        {market.title}
                                    </h3>
                                    <p className="text-sm text-slate-200 mb-6 flex-grow leading-relaxed max-w-[95%]">
                                        {market.description}
                                    </p>
                                </div>

                                <div className="bottom z-20 w-full flex-col items-start gap-4">
                                    {/* Data Trigger & Policy blocks */}
                                    <div className="w-full flex flex-col gap-3 border-t border-white/10 pt-4 pr-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-300 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[12px]">link</span>
                                                Oracle Trigger
                                            </span>
                                            <span className="text-xs text-white font-medium drop-shadow-md">{market.trigger}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-300 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[12px]">gavel</span>
                                                Smart Policy
                                            </span>
                                            <span className="text-[11px] text-white font-mono bg-black/40 px-2 py-1.5 rounded border border-white/10 leading-snug drop-shadow-lg break-words">{market.policy}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Overlay link for active cards */}
                                {market.active && market.href && (
                                    <Link href={market.href} className="absolute inset-0 z-30">
                                        <span className="sr-only">Go to {market.title}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
