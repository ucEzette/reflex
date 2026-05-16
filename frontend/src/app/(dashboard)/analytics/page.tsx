"use client";

import React, { useState } from "react";
import { useReadContract } from "wagmi";
import { CONTRACTS, LP_POOL_ABI, POOLS } from "@/lib/contracts";
import { formatUnits } from "viem";
import { GovernanceForum } from "@/components/governance/GovernanceForum";
import { Info, DollarSign, AlertTriangle, Layers, Lock, Shield, Zap, Activity, Globe, Cpu, Radio } from "lucide-react";

function HUDCard({ title, tooltip, value, subIcon: SubIcon, subText, subColor, topIcon: TopIcon, topColor }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group transition-all hover:border-black/[0.06] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TopIcon className={`w-12 h-12 ${topColor}`} />
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 group/tip cursor-help">
          <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">{title}</span>
          <Info className="w-3 h-3 text-[#D1CBC5] group-hover/tip:text-[#71717A] transition-colors" />
          
          {/* Tooltip Overlay */}
          <div className="absolute top-12 left-8 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity font-medium">
            <div className="w-2 h-2 bg-[#FF6B00] rounded-full mb-2" />
            {tooltip}
          </div>
        </div>
      </div>
      
      <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tighter mb-4">${value}</div>
      
      <div className="flex items-center gap-2 mt-auto px-1">
        {SubIcon && <SubIcon className={`w-3 h-3 ${subColor} opacity-50`} />}
        <span className={`text-[10px] font-bold uppercase tracking-widest ${subColor}`}>{subText}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [severity, setSeverity] = useState(50);
  const [payoutRatio, setPayoutRatio] = useState(65);
  const [reserveDepletion, setReserveDepletion] = useState(30);

  // Read TVLs from each pool
  const { data: travelTvl } = useReadContract({ address: CONTRACTS.LP_TRAVEL, abi: LP_POOL_ABI, functionName: "totalAssets" });
  const { data: agriTvl } = useReadContract({ address: CONTRACTS.LP_AGRI, abi: LP_POOL_ABI, functionName: "totalAssets" });
  const { data: energyTvl } = useReadContract({ address: CONTRACTS.LP_ENERGY, abi: LP_POOL_ABI, functionName: "totalAssets" });
  const { data: catTvl } = useReadContract({ address: CONTRACTS.LP_CAT, abi: LP_POOL_ABI, functionName: "totalAssets" });
  const { data: maritimeTvl } = useReadContract({ address: CONTRACTS.LP_MARITIME, abi: LP_POOL_ABI, functionName: "totalAssets" });

  const poolTvls = [
    { name: "Travel", tvl: travelTvl, color: "bg-blue-500" },
    { name: "Agriculture", tvl: agriTvl, color: "bg-emerald-500" },
    { name: "Energy", tvl: energyTvl, color: "bg-amber-500" },
    { name: "Catastrophe", tvl: catTvl, color: "bg-red-500" },
    { name: "Maritime", tvl: maritimeTvl, color: "bg-indigo-500" },
  ];

  const totalTvlNum = poolTvls.reduce((sum, p) => sum + (p.tvl ? Number(formatUnits(p.tvl as bigint, 6)) : 0), 0);

  // Simulated metrics
  const utilizationRate = Math.min(severity * 1.2 + payoutRatio * 0.3, 100).toFixed(1);
  const riskScore = ((severity * 0.4 + payoutRatio * 0.35 + reserveDepletion * 0.25) / 10).toFixed(1);

  return (
    <div className="pt-40 pb-32 px-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-1.5 bg-[#FF6B00] rounded-full" />
             <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-[0.5em]">System Intelligence</span>
          </div>
          <h1 className="text-7xl font-bold tracking-[ -0.05em] mb-6 text-[#1A1A1A] uppercase">
            Protocol HUD
          </h1>
          <p className="text-[#71717A] text-lg font-medium leading-relaxed max-w-xl">
             Real-time monitoring of decentralized risk vectors, capital utilization, and parametric settlement telemetry.
          </p>
        </div>
        <div className="flex items-center gap-8 py-4 px-8 bg-black/[0.02] rounded-3xl border border-black/[0.04]">
             <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Network Speed</span>
                 <span className="mono-data text-sm text-emerald-500 font-bold">1.4ms Settle</span>
             </div>
             <div className="w-[1px] h-8 bg-black/[0.03]" />
             <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Oracle Health</span>
                 <span className="mono-data text-sm text-[#1A1A1A] font-bold">Online / DON-7</span>
             </div>
        </div>
      </header>

      {/* Health HUD */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        <HUDCard 
            title="Total Value Locked"
            tooltip="Sum of all USDT supplied by Liquidity Providers across the 5 isolated risk pools. Backs system solvency."
            value={totalTvlNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            subIcon={Lock}
            subText="On-chain USDT"
            subColor="text-emerald-500"
            topIcon={DollarSign}
            topColor="text-emerald-500"
        />
        <HUDCard 
            title="Escrowed Claims"
            tooltip="Total USDT currently escrowed for triggered parameters that have not been claimed by end users."
            value={(severity / 5).toFixed(0)}
            subIcon={Activity}
            subText="Reserved Capacity"
            subColor="text-[#71717A]"
            topIcon={AlertTriangle}
            topColor="text-[#FF6B00]"
        />
        <div className="bg-white p-8 rounded-[2rem] border border-black/[0.04] relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Layers className="w-12 h-12 text-cyan-500" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 group/tip cursor-help">
              <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider">Capital Utilization</span>
              <Info className="w-3 h-3 text-[#D1CBC5]" />
              
              <div className="absolute top-12 left-8 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity">
                Ratio of locked funds against total liquidity. Under 20% is extremely safe.
              </div>
            </div>
          </div>
          <div className="mono-data text-3xl text-[#1A1A1A] font-bold tracking-tighter mb-4">{Math.min(Number(utilizationRate) / 100, 100).toFixed(1)}%</div>
          <div className="flex items-center gap-2 mt-auto px-1">
            <Shield className="w-3 h-3 text-emerald-500 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">100% collateralized</span>
          </div>
        </div>
        <HUDCard 
            title="Available Alpha"
            tooltip="Remaining system liquidity available to underwrite newly purchased policies in real-time."
            value={Math.max(totalTvlNum - (severity / 5), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            subIcon={Zap}
            subText="Market Depth"
            subColor="text-[#1A1A1A]"
            topIcon={Lock}
            topColor="text-[#D1CBC5]"
        />
      </section>

      {/* Real-Time Pool Health & Market Participation Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        <section>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3 group relative">
              <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Risk Matrix Health</h2>
              <div className="cursor-help">
                <Info className="w-4 h-4 text-[#B0AAA4] hover:text-[#71717A] transition-colors" />
                <div className="absolute top-8 left-0 z-50 w-72 p-5 bg-white border border-black/[0.06] rounded-[2rem] text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  Isolated pool telemetry. Shows individual sector solvency and capital weighting within the protocol.
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poolTvls.map((pool) => {
              const tvl = pool.tvl ? Number(formatUnits(pool.tvl as bigint, 6)) : 0;
              const pct = totalTvlNum > 0 ? ((tvl / totalTvlNum) * 100).toFixed(1) : "0.0";
              return (
                <div key={pool.name} className="bg-white p-6 rounded-3xl border border-black/[0.04] hover:border-black/[0.06] transition-all group/p">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${pool.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                        <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest group-hover/p:text-[#71717A] transition-colors">{pool.name}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#D1CBC5] uppercase tracking-widest">{pct}% ALPHA</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                      <span className="mono-data text-2xl text-[#1A1A1A] font-bold tracking-tighter">${tvl.toLocaleString()}</span>
                  </div>
                  <div className="h-1 w-full bg-black/[0.03] rounded-full overflow-hidden">
                    <div className={`h-full ${pool.color} transition-all duration-1000 shadow-[2px_0_8px_rgba(0,0,0,0.5)]`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Participation Vector</h2>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-black/[0.04] shadow-2xl relative overflow-hidden group/vector h-[calc(100%-80px)]">
            <div className="absolute -right-20 -bottom-20 opacity-[0.03] group-hover/vector:opacity-[0.05] transition-opacity">
                <Globe className="w-80 h-80 text-[#1A1A1A]" />
            </div>
            <div className="grid grid-cols-2 gap-12 relative z-10">
              <div className="space-y-2 group/tip relative">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Active Nodes</span>
                    <Info className="w-3 h-3 text-zinc-900 group-hover/tip:text-[#71717A] transition-colors cursor-help" />
                </div>
                <div className="absolute top-8 left-0 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity">
                  Count of decentralized relayers currently synchronizing with the Arbitrum Sepolia sequencer.
                </div>
                <span className="mono-data text-4xl text-[#1A1A1A] font-bold tracking-tighter">1,242</span>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">+12.4% Δ</p>
                </div>
              </div>
              <div className="space-y-2 group/tip relative">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Settlements</span>
                    <Info className="w-3 h-3 text-zinc-900 group-hover/tip:text-[#71717A] transition-colors cursor-help" />
                </div>
                <div className="absolute top-8 left-0 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity">
                  Total volume of parametric insurance contracts finalized and settled across all high-frequency markets.
                </div>
                <span className="mono-data text-4xl text-[#1A1A1A] font-bold tracking-tighter">8,492</span>
                <p className="text-[9px] font-bold text-[#D1CBC5] uppercase tracking-widest">Global Ingestion</p>
              </div>
              <div className="space-y-2 group/tip relative">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Latency</span>
                    <Info className="w-3 h-3 text-zinc-900 group-hover/tip:text-[#71717A] transition-colors cursor-help" />
                </div>
                <div className="absolute top-8 left-0 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity">
                  Average time between oracle parameter hit and cryptographic settlement commitment on-chain.
                </div>
                <span className="mono-data text-4xl text-[#1A1A1A] font-bold tracking-tighter">14.2s</span>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Target Met</p>
              </div>
              <div className="space-y-2 group/tip relative">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-widest block">Security</span>
                    <Info className="w-3 h-3 text-zinc-900 group-hover/tip:text-[#71717A] transition-colors cursor-help" />
                </div>
                <div className="absolute top-8 left-0 z-50 w-64 p-4 bg-white border border-black/[0.06] rounded-2xl text-[10px] leading-relaxed text-[#71717A] shadow-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity">
                  Real-time protocol integrity score. Measures relayer consensus and oracle finality verification.
                </div>
                <span className="mono-data text-4xl text-[#1A1A1A] font-bold tracking-tighter uppercase">High</span>
                <p className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-widest">DON Active</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Risk Simulator */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-10 group relative">
            <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center border border-[#FF6B00]/20">
                <Radio className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Quantum Simulation</h2>
        </div>
        
        <div className="bg-white p-12 rounded-[3.5rem] border border-black/[0.04] shadow-2xl relative overflow-hidden group/sim">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu className="w-32 h-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            <div className="space-y-6 p-8 bg-black/40 rounded-[2.5rem] border border-black/[0.04] hover:border-[#FF6B00]/30 transition-colors">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest leading-none">Intensity Factor</span>
                <span className="mono-data text-xl text-[#FF6B00] font-bold tracking-tight">{severity}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[#FF6B00] h-1.5 bg-black/[0.03] rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Adjust potential weather trauma</p>
            </div>
            <div className="space-y-6 p-8 bg-black/40 rounded-[2.5rem] border border-black/[0.04] hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest leading-none">Payout Vector</span>
                <span className="mono-data text-xl text-blue-500 font-bold tracking-tight">{payoutRatio}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={payoutRatio}
                onChange={(e) => setPayoutRatio(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-black/[0.03] rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Simulate loss magnitude</p>
            </div>
            <div className="space-y-6 p-8 bg-black/40 rounded-[2.5rem] border border-black/[0.04] hover:border-emerald-500/30 transition-colors">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest leading-none">Vault Shock</span>
                <span className="mono-data text-xl text-emerald-500 font-bold tracking-tight">{reserveDepletion}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={reserveDepletion}
                onChange={(e) => setReserveDepletion(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-black/[0.03] rounded-full appearance-none cursor-pointer"
              />
              <p className="text-[9px] font-bold text-[#B0AAA4] uppercase tracking-widest">Stress test collateral reserves</p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-black/[0.04] relative z-10">
            <div className="flex flex-col gap-3 group/stat">
              <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider mb-2 flex items-center gap-3">
                <div className="w-1.5 h-4 bg-zinc-800 rounded-full group-hover/stat:bg-white transition-colors" />
                Projected Liability
              </span>
              <span className="mono-data text-5xl text-[#1A1A1A] font-bold tracking-tighter">
                ${(severity * 12.5).toLocaleString()} 
                <span className="text-xs text-[#B0AAA4] font-bold ml-2 uppercase">USDV</span>
              </span>
            </div>
            <div className="flex flex-col gap-3 group/stat">
              <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider mb-2 flex items-center gap-3">
                <div className="w-1.5 h-4 bg-emerald-900 rounded-full group-hover/stat:bg-emerald-500 transition-colors" />
                Reserve Viability
              </span>
              <span className="mono-data text-5xl text-emerald-500 font-bold tracking-tighter">{(100 - reserveDepletion).toFixed(0)}%</span>
            </div>
            <div className="flex flex-col gap-3 group/stat">
              <span className="text-[10px] font-bold text-[#B0AAA4] uppercase tracking-wider mb-2 flex items-center gap-3">
                <div className={`w-1.5 h-4 rounded-full transition-colors ${Number(utilizationRate) > 80 ? 'bg-red-500' : 'bg-cyan-900 group-hover/stat:bg-cyan-500'}`} />
                System Load Index
              </span>
              <span className={`mono-data text-5xl font-bold tracking-tighter ${Number(utilizationRate) > 80 ? "text-red-500" : "text-[#1A1A1A]"}`}>
                {utilizationRate}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Oracle Console */}
      <section className="mb-24 px-1">
        <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center border border-black/[0.06] text-[10px] font-bold text-[#71717A]">
                CLI
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Ingestion Stream</h2>
        </div>
        <div className="bg-black/100 rounded-[3rem] p-10 border border-black/[0.04] h-[400px] overflow-y-auto no-scrollbar font-mono shadow-[inset_0_20px_50px_rgba(0,0,0,0.8)] border-t-[#FF6B00]/20">
          <div className="flex flex-col gap-5">
            {[
              { time: "00:00:01", msg: "KERNEL Initialization Complete. All risk vectors operational.", type: "system" },
              { time: "00:01:42", msg: "Establishing secure handshake with Chainlink DON cluster-7...", type: "info" },
              { time: "00:01:44", msg: `Heartbeat detected. TVL Consensus reached: $${totalTvlNum.toFixed(2)}`, type: "data" },
              { time: "00:02:12", msg: "Travel Sector Ingress: Flight telemetry syncing (282 endpoints active)", type: "info" },
              { time: "00:02:15", msg: "Agriculture Sector Ingress: Soil moisture sensors online (L1-L5)", type: "info" },
              { time: "00:02:18", msg: "Energy Sector Ingress: Latency data ingested via GridWatch API", type: "info" },
              { time: "00:02:22", msg: "Ingestion Integrity Check: [PASSED - 100.0%]", type: "success" },
              { time: "00:03:01", msg: `Protocol Threat Level: [MINIMAL] Risk Score ${riskScore}/10`, type: "data" },
              { time: "00:03:15", msg: "Awaiting user-triggered event simulation...", type: "system" },
            ].map((entry, i) => (
              <div key={i} className="flex items-start gap-10 group/line py-1 transition-colors border-b border-white/[0.02] last:border-none">
                <span className="text-[10px] text-[#D1CBC5] min-w-[70px] font-bold tracking-widest uppercase">{entry.time}</span>
                <span className={`text-[11px] leading-relaxed ${
                  entry.type === "success" ? "text-emerald-500 font-bold"
                  : entry.type === "data" ? "text-[#1A1A1A] font-bold underline decoration-[#FF6B00]/40 underline-offset-4"
                  : entry.type === "info" ? "text-[#FF6B00] font-medium opacity-80"
                  : entry.type === "system" ? "text-[#71717A]"
                  : "text-[#B0AAA4]"
                }`}>
                  <span className="text-zinc-900 mr-4 font-bold">»</span>
                  {entry.msg}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 text-[11px] text-emerald-500 font-bold mt-4 animate-pulse">
                <Radio className="w-3 h-3" />
                <span>LISTENING FOR ON-CHAIN FINALITY...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Forum */}
      <section className="mt-16">
        <GovernanceForum />
      </section>
    </div>
  );
}
