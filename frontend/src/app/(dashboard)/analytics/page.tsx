"use client";

import React, { useState } from "react";
import { useReadContract } from "wagmi";
import { CONTRACTS, LP_POOL_ABI, POOLS } from "@/lib/contracts";
import { formatUnits } from "viem";

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
    <div className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Analytics <span className="text-primary">HUD</span>
        </h1>
        <p className="text-zinc-400 text-lg">Real-time protocol health metrics, risk simulation, and oracle monitoring.</p>
      </header>

      {/* Health HUD */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-surface-container-low p-8 rounded-lg specular-border">
          <span className="text-institutional block mb-4">Protocol TVL</span>
          <span className="mono-data text-4xl text-secondary">${totalTvlNum.toLocaleString()}</span>
          <p className="text-zinc-500 text-xs mt-2">Across {POOLS.length} isolated pools</p>
        </div>
        <div className="bg-surface-container-low p-8 rounded-lg specular-border">
          <span className="text-institutional block mb-4">Utilization Rate</span>
          <span className="mono-data text-4xl text-on-surface">{utilizationRate}%</span>
          <div className="mt-4 h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${utilizationRate}%` }} />
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-lg specular-border">
          <span className="text-institutional block mb-4">Risk Score</span>
          <span className={`mono-data text-4xl ${Number(riskScore) > 7 ? 'text-red-400' : Number(riskScore) > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {riskScore}/10
          </span>
          <p className="text-zinc-500 text-xs mt-2">{Number(riskScore) > 7 ? "HIGH RISK" : Number(riskScore) > 4 ? "MODERATE" : "LOW RISK"}</p>
        </div>
      </section>

      {/* Pool TVL Breakdown */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-8">Pool TVL Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {poolTvls.map((pool) => {
            const tvl = pool.tvl ? Number(formatUnits(pool.tvl as bigint, 6)) : 0;
            const pct = totalTvlNum > 0 ? ((tvl / totalTvlNum) * 100).toFixed(1) : "0.0";
            return (
              <div key={pool.name} className="bg-surface-container-low p-6 rounded-lg specular-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${pool.color}`} />
                  <span className="text-institutional">{pool.name}</span>
                </div>
                <span className="mono-data text-xl text-on-surface block mb-2">${tvl.toFixed(2)}</span>
                <span className="mono-data text-xs text-zinc-500">{pct}% of total</span>
                <div className="mt-3 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${pool.color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Risk Simulator */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-8">Risk Simulator</h2>
        <div className="bg-surface-container-low p-8 rounded-lg specular-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-institutional">Weather Severity</span>
                <span className="mono-data text-xs text-primary">{severity}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-institutional">Payout Ratio</span>
                <span className="mono-data text-xs text-secondary">{payoutRatio}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={payoutRatio}
                onChange={(e) => setPayoutRatio(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-institutional">Reserve Depletion</span>
                <span className="mono-data text-xs text-tertiary">{reserveDepletion}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={reserveDepletion}
                onChange={(e) => setReserveDepletion(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
            <div>
              <span className="text-institutional block mb-2">Projected Claims</span>
              <span className="mono-data text-2xl text-on-surface">{(severity * 12.5).toFixed(0)} USDT</span>
            </div>
            <div>
              <span className="text-institutional block mb-2">Reserve Remaining</span>
              <span className="mono-data text-2xl text-secondary">{(100 - reserveDepletion).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-institutional block mb-2">System Load</span>
              <span className={`mono-data text-2xl ${Number(utilizationRate) > 80 ? "text-red-400" : "text-emerald-400"}`}>
                {utilizationRate}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Oracle Console */}
      <section>
        <h2 className="text-xl font-bold mb-8">Live Oracle Console</h2>
        <div className="bg-surface-container-lowest rounded-lg p-6 specular-border h-64 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2">
            {[
              { time: "00:00:01", msg: "[SYSTEM] Oracle monitoring initialized", type: "system" },
              { time: "00:00:02", msg: "[CHAINLINK] ARB/USD price feed connected", type: "info" },
              { time: "00:00:03", msg: `[TVL] Total protocol value: $${totalTvlNum.toFixed(2)}`, type: "data" },
              { time: "00:00:04", msg: "[POOL] Travel pool: ACTIVE", type: "info" },
              { time: "00:00:05", msg: "[POOL] Agriculture pool: ACTIVE", type: "info" },
              { time: "00:00:06", msg: "[POOL] Energy pool: ACTIVE", type: "info" },
              { time: "00:00:07", msg: "[POOL] Catastrophe pool: ACTIVE", type: "info" },
              { time: "00:00:08", msg: "[POOL] Maritime pool: ACTIVE", type: "info" },
              { time: "00:00:09", msg: "[ORACLE] All DON nodes responding", type: "success" },
              { time: "00:00:10", msg: `[RISK] Current risk score: ${riskScore}/10`, type: "data" },
            ].map((entry, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="mono-data text-[10px] text-zinc-600 min-w-[70px]">{entry.time}</span>
                <span className={`mono-data text-xs ${
                  entry.type === "success" ? "text-emerald-400"
                  : entry.type === "data" ? "text-secondary"
                  : entry.type === "info" ? "text-zinc-400"
                  : "text-zinc-600"
                }`}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
