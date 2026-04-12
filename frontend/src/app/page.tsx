"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, ESCROW_ABI, LP_POOL_ABI } from "@/lib/contracts";
import { POOLS } from "@/lib/contracts";
import { formatUnits } from "viem";

const CATEGORY_CARDS = [
  { name: "Travel", icon: "flight_takeoff", color: "text-blue-400", hoverBg: "hover:bg-blue-900/20", apr: "8.4%", height: "h-[320px] lg:h-[400px]" },
  { name: "Agriculture", icon: "agriculture", color: "text-emerald-400", hoverBg: "hover:bg-emerald-900/20", apr: "12.1%", height: "h-[320px] lg:h-[450px]" },
  { name: "Energy", icon: "bolt", color: "text-amber-400", hoverBg: "hover:bg-amber-900/20", apr: "15.7%", height: "h-[320px] lg:h-[500px]" },
  { name: "Catastrophe", icon: "tsunami", color: "text-red-400", hoverBg: "hover:bg-red-900/20", apr: "22.4%", height: "h-[320px] lg:h-[450px]" },
  { name: "Maritime", icon: "sailing", color: "text-indigo-400", hoverBg: "hover:bg-indigo-900/20", apr: "9.8%", height: "h-[320px] lg:h-[400px]" },
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Travel: "Flight delay & cancellation triggers.",
  Agriculture: "Crop yield & moisture parity triggers.",
  Energy: "Grid failure & fuel price hedging.",
  Catastrophe: "Seismic activity & flood protection.",
  Maritime: "Supply chain & piracy coverage.",
};
const SIM_MULTIPLIERS: Record<string, { multiplier: number, color: string, shadow: string, triggerText: string, icon: string, oracleMin: number, oracleMax: number, oracleTrigger: number, oracleUnit: string, id: string }> = {
  Travel: { multiplier: 31.09, color: "#60a5fa", shadow: "rgba(96, 165, 250, 0.2)", triggerText: "Flight Delay > 2 Hours", icon: "flight_takeoff", oracleMin: 0, oracleMax: 12, oracleTrigger: 2, oracleUnit: "Hours", id: "flight" },
  Agriculture: { multiplier: 15.2, color: "#34d399", shadow: "rgba(52, 211, 153, 0.2)", triggerText: "Rainfall Deficit > 30%", icon: "agriculture", oracleMin: 0, oracleMax: 60, oracleTrigger: 30, oracleUnit: "% Deficit", id: "agri" },
  Energy: { multiplier: 12.5, color: "#fbbf24", shadow: "rgba(251, 191, 36, 0.2)", triggerText: "Grid Failure > 4 Hours", icon: "bolt", oracleMin: 0, oracleMax: 24, oracleTrigger: 4, oracleUnit: "Hours", id: "energy" },
  Catastrophe: { multiplier: 25.0, color: "#f87171", shadow: "rgba(248, 113, 113, 0.2)", triggerText: "Seismic Magnitude > 6.0", icon: "tsunami", oracleMin: 0, oracleMax: 10, oracleTrigger: 6, oracleUnit: "Magnitude", id: "cat" },
  Maritime: { multiplier: 18.4, color: "#818cf8", shadow: "rgba(129, 140, 248, 0.2)", triggerText: "Port Closure > 48 Hours", icon: "sailing", oracleMin: 0, oracleMax: 120, oracleTrigger: 48, oracleUnit: "Hours", id: "maritime" },
};

export default function LandingPage() {
  const [selectedSimMarket, setSelectedSimMarket] = useState("Travel");
  const [premiumInput, setPremiumInput] = useState(10);
  const [oracleSlider, setOracleSlider] = useState(1); // Starting value below trigger
  
  const activeSim = SIM_MULTIPLIERS[selectedSimMarket];
  
  const isTriggered = oracleSlider >= activeSim.oracleTrigger;
  const potentialPayout = premiumInput * activeSim.multiplier;
  const netProfit = isTriggered ? potentialPayout - premiumInput : -premiumInput;

  // Read TVL from Travel LP pool as representative
  const { data: travelTvl } = useReadContract({
    address: CONTRACTS.LP_TRAVEL,
    abi: LP_POOL_ABI,
    functionName: "totalAssets",
  });

  const formattedTvl = travelTvl ? `$${Number(formatUnits(travelTvl as bigint, 6)).toLocaleString()}` : "$0.00";

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 bg-[url('/agriculture.jpg')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity brightness-[0.7]" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#131318]/40 via-transparent to-[#131318]" />
        
        <div className="z-10 max-w-6xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 block">
            Decentralized Risk Sovereignty
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-8">
            Micro-Insurance,<br />
            <span className="text-[#800020]">Macro Speed.</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-12 font-light">
            The first institutional-grade parametric protection market. Secure instant liquidity against real-world volatility with Arbitrum-native settlements.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href="/market"
              className="bg-[#800020] text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-primary-container/20"
            >
              Launch App
            </Link>
            <Link
              href="/whitepaper"
              className="ghost-border text-on-surface px-10 py-4 rounded-full text-lg font-medium hover:bg-surface-container-high transition-all"
            >
              Our Intro Deck
            </Link>
          </div>
        </div>

        {/* Global Stats Row */}
        <div className="z-10 mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Total Value Locked</span>
            <p className="text-2xl mono-data text-secondary mt-1">{formattedTvl}</p>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Active Policies</span>
            <p className="text-2xl mono-data text-[#E4E1E9] mt-1">—</p>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Markets Live</span>
            <p className="text-2xl mono-data text-[#E4E1E9] mt-1">10</p>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Claims Paid</span>
            <p className="text-2xl mono-data text-emerald-400 mt-1">{formattedTvl !== "$0.00" ? "$—" : "$0.00"}</p>
          </div>
        </div>
      </section>

      {/* Active Markets */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#FFB3B5]">Protection Ecosystem</span>
          <h2 className="text-5xl font-bold mt-4 tracking-tight">Select a risk category.</h2>
        </div>
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.name}
              href={`/market/${SIM_MULTIPLIERS[cat.name].id}`}
              className={`group relative w-full sm:w-[calc(50%-8px)] lg:w-64 ${cat.height} bg-surface-container-low rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] lg:hover:-translate-y-12 lg:hover:scale-100 ${cat.hoverBg} ghost-border flex flex-col justify-between`}
            >
              <div>
                <span className={`material-symbols-outlined ${cat.color} text-4xl mb-4`}>{cat.icon}</span>
                <h3 className="text-xl font-bold">{cat.name}</h3>
                <p className="text-sm text-zinc-500 mt-2">{CATEGORY_DESCRIPTIONS[cat.name]}</p>
              </div>
              <div className={`mono-data text-xs ${cat.color}`}>APR: {cat.apr}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-surface-container-low/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="glass-panel p-8 lg:p-10 rounded-[2rem] ghost-border">
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Lock Premium</h3>
              <p className="text-zinc-500 leading-relaxed">
                Deposit collateral into immutable vaults. Your assets are secured by the Arbitrum L2 infrastructure with zero counterparty risk.
              </p>
            </div>
            <div className="glass-panel p-8 lg:p-10 rounded-[2rem] ghost-border lg:translate-y-8">
              <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-tertiary">hub</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Verification</h3>
              <p className="text-zinc-500 leading-relaxed">
                External data is fed via Chainlink Oracles. Triggers are executed based on objective, tamper-proof real-world events.
              </p>
            </div>
            <div className="glass-panel p-8 lg:p-10 rounded-[2rem] ghost-border lg:translate-y-16">
              <div className="w-12 h-12 bg-on-secondary-fixed-variant rounded-full flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-secondary">flash_on</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Payout</h3>
              <p className="text-zinc-500 leading-relaxed">
                Upon verification, funds are instantly released to the policyholder. No paperwork, no disputes, just code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Simulator */}
      <section className="py-40 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-6 block">Dynamic Simulation</span>
            <h2 className="text-5xl font-bold tracking-tight mb-8">Visualize Your Protection Scaling</h2>
            <p className="text-zinc-400 mb-10 text-lg">
              Select a risk sector to see how Reflex instantly computes premiums and scales maximum recovery dynamically.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-10">
              {Object.keys(SIM_MULTIPLIERS).map((marketName) => (
                <button
                  key={marketName}
                  onClick={() => setSelectedSimMarket(marketName)}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all border ${
                    selectedSimMarket === marketName
                      ? "bg-surface-container-highest border-transparent text-white"
                      : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span 
                    className="material-symbols-outlined text-[14px]"
                    style={{ color: selectedSimMarket === marketName ? SIM_MULTIPLIERS[marketName].color : "" }}
                  >
                    {SIM_MULTIPLIERS[marketName].icon}
                  </span>
                  {marketName}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl mb-6 border border-white/5">
                  <span className="text-sm text-zinc-400">Trigger Condition</span>
                  <span className="text-sm font-bold" style={{ color: activeSim.color }}>{activeSim.triggerText}</span>
                </div>
                
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-medium">Premium Purchase (USDC)</span>
                  <span className="mono-data text-sm" style={{ color: activeSim.color }}>${premiumInput}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={premiumInput}
                  onChange={(e) => setPremiumInput(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: activeSim.color }}
                />
              </div>

              <div>
                <div className="flex justify-between mb-4 pt-4">
                  <span className="text-sm font-medium">Simulate Oracle ({activeSim.oracleUnit})</span>
                  <span className="mono-data text-sm" style={{ color: activeSim.color }}>{oracleSlider} {activeSim.oracleUnit}</span>
                </div>
                <input
                  type="range"
                  min={activeSim.oracleMin}
                  max={activeSim.oracleMax}
                  step={activeSim.oracleMax > 50 ? 1 : 0.1}
                  value={oracleSlider}
                  onChange={(e) => setOracleSlider(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: activeSim.color }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-8">
                <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to right, transparent, ${activeSim.color})` }} />
                  <span className="text-[10px] font-bold uppercase text-zinc-500 relative z-10">Max Coverage</span>
                  <p className="text-xl mono-data mt-2 text-on-surface relative z-10">${potentialPayout.toFixed(2)}</p>
                </div>
                <div className={`bg-surface-container-lowest p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${isTriggered ? 'shadow-lg' : ''}`} style={{ boxShadow: isTriggered ? `0 0 20px ${activeSim.shadow}` : 'none' }}>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 relative z-10">Net Profit/Loss</span>
                  <p className="text-xl mono-data mt-2 relative z-10" style={{ color: isTriggered ? activeSim.color : '#ef4444' }}>
                    {netProfit > 0 ? '+' : ''}{netProfit.toFixed(2)} USDC
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link 
                  href={`/market/${activeSim.id}`}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: activeSim.color, boxShadow: `0 8px 32px ${activeSim.shadow}` }}
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  Purchase Product
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full h-[400px] bg-surface-container-low rounded-[3rem] p-8 ghost-border relative overflow-hidden group">
            <div className={`absolute inset-0 transition-opacity duration-700 ${isTriggered ? 'opacity-100' : 'opacity-0'}`} style={{ background: `radial-gradient(circle at top right, ${activeSim.shadow}, transparent 70%)` }} />
            
            <div className="relative h-full w-full flex items-end gap-1">
              {Array.from({ length: 40 }).map((_, i) => {
                const val = activeSim.oracleMin + (i / 39) * (activeSim.oracleMax - activeSim.oracleMin);
                const isPastTrigger = val >= activeSim.oracleTrigger;
                const curveHeight = 20 + Math.sin(i / 5) * 10 + (i / 40) * 60;
                
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${curveHeight}%`,
                      backgroundColor: isPastTrigger ? activeSim.shadow : "rgba(255,255,255,0.05)",
                      borderColor: isPastTrigger ? activeSim.color : "transparent",
                      borderTopWidth: isPastTrigger ? "2px" : "0px",
                      opacity: oracleSlider >= val ? 1 : 0.3
                    }}
                  />
                );
              })}
            </div>
            
            <div className="absolute top-8 right-8 z-30">
              <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isTriggered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface-container-highest text-zinc-500'}`}>
                {isTriggered ? 'TRIGGERED' : 'SAFE'}
              </span>
            </div>

            <div className="absolute top-0 bottom-0 border-l border-dashed transition-all duration-500 z-20 flex flex-col justify-end pb-8" 
                 style={{ 
                   left: `${((activeSim.oracleTrigger - activeSim.oracleMin) / (activeSim.oracleMax - activeSim.oracleMin)) * 100}%`, 
                   borderColor: activeSim.color 
                 }}>
              <span className="bg-surface-container-highest px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest absolute -translate-x-1/2 bottom-0 shadow-lg whitespace-nowrap" style={{ color: activeSim.color }}>
                Trigger: {activeSim.oracleTrigger}
              </span>
            </div>

            <div className="absolute top-0 bottom-0 border-l-2 transition-all duration-100 z-30 flex flex-col justify-start pt-8" 
                 style={{ 
                   left: `${((oracleSlider - activeSim.oracleMin) / (activeSim.oracleMax - activeSim.oracleMin)) * 100}%`, 
                   borderColor: '#fff' 
                 }}>
              <div className="w-3 h-3 bg-white rounded-full absolute -left-[7px] top-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <span className="bg-white text-black px-2 py-1 rounded text-[10px] font-bold absolute -translate-x-1/2 mt-4 whitespace-nowrap shadow-xl">
                {oracleSlider.toFixed(1)} {activeSim.oracleUnit}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Solvency Dashboard */}
      <section className="py-32 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 ghost-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 lg:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Solvency Dashboard</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Oracle Live</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Protocol TVL</span>
                <p className="text-3xl mono-data mt-4">{formattedTvl}</p>
                <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%]" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Collateral Ratio</span>
                <p className="text-3xl mono-data mt-4 text-emerald-400">100%</p>
                <p className="text-[10px] mt-2 text-zinc-600">Min. Threshold: 100%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Reserve Breakdown</span>
                <div className="mt-4 flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 mono-data">USDT</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 mono-data">ETH</div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 mono-data">ARB</div>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Chainlink Feed</span>
                <p className="text-sm mono-data mt-4 text-on-surface">ARB/USD: Live</p>
                <p className="text-[10px] mt-1 text-zinc-600">Arbitrum Sepolia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-40 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-container/10 blur-[120px] rounded-full -z-10" />
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-12 px-4">Ready to secure your future?</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/market"
            className="bg-[#800020] text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all"
          >
            Launch App
          </Link>
          <Link
            href="/analytics"
            className="ghost-border text-on-surface px-10 py-4 rounded-full text-lg font-medium hover:bg-surface-container-high transition-all"
          >
            View Analytics
          </Link>
        </div>
      </section>
    </div>
  );
}
