"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, LP_POOL_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";

const CATEGORY_CARDS = [
  { name: "Travel", icon: "flight_takeoff", color: "#3B82F6", apr: "8.4%", desc: "Flight delay & cancellation triggers.", id: "flight" },
  { name: "Agriculture", icon: "agriculture", color: "#10B981", apr: "12.1%", desc: "Crop yield & moisture parity triggers.", id: "agri" },
  { name: "Energy", icon: "bolt", color: "#F59E0B", apr: "15.7%", desc: "Grid failure & fuel price hedging.", id: "energy" },
  { name: "Catastrophe", icon: "tsunami", color: "#EF4444", apr: "22.4%", desc: "Seismic activity & flood protection.", id: "cat" },
  { name: "Maritime", icon: "sailing", color: "#6366F1", apr: "9.8%", desc: "Supply chain & piracy coverage.", id: "maritime" },
];

const STEPS = [
  { num: "01", title: "Discover", desc: "Select your risk category and configure protection parameters." },
  { num: "02", title: "Secure", desc: "Lock premium into immutable on-chain vaults with zero counterparty risk." },
  { num: "03", title: "Verify", desc: "Chainlink Oracles feed real-world data to trigger smart contracts." },
  { num: "04", title: "Settle", desc: "Instant automated payouts — no paperwork, no disputes, just code." },
];

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { data: travelTvl } = useReadContract({
    address: CONTRACTS.LP_TRAVEL,
    abi: LP_POOL_ABI,
    functionName: "totalAssets",
  });

  const formattedTvl = travelTvl ? `$${Number(formatUnits(travelTvl as bigint, 6)).toLocaleString()}` : "$0.00";

  return (
    <div className="pt-[72px]">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FF6B00] mb-6 block">
              Parametric Protection Protocol
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold tracking-[-0.03em] leading-[0.95] text-[#1A1A1A] mb-8">
              Micro-Insurance.<br />
              Macro Speed.
            </h1>
            <p className="text-[#71717A] max-w-lg text-lg mb-10 leading-relaxed font-light">
              The first institutional-grade parametric protection market. Secure instant liquidity against real-world volatility with Arbitrum-native settlements.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/market" className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-8 py-4 rounded-full text-[15px] font-semibold hover:bg-[#E55E00] transition-all shadow-[0_8px_25px_rgba(255,107,0,0.2)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.3)] hover:-translate-y-0.5">
                Launch App
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-45"><path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/whitepaper" className="inline-flex items-center gap-2 border border-[#1A1A1A]/15 text-[#1A1A1A] px-8 py-4 rounded-full text-[15px] font-medium hover:bg-white/60 hover:border-[#1A1A1A]/25 transition-all">
                Our Intro Deck
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-45"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
            <p className="text-[12px] text-[#71717A] mt-8 flex items-center gap-2">
              <span className="w-[6px] h-[6px] rounded-full bg-[#FF6B00] inline-block" />
              Protection with purpose.
            </p>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <img src="/hero-glass.png" alt="Reflex Protection" className="w-full max-w-[520px] h-auto object-contain animate-float drop-shadow-2xl" />
            {/* Floating glass stat cards */}
            <div className="absolute bottom-8 left-0 glass-card rounded-2xl p-4 shadow-glass-lg animate-slide-up" style={{animationDelay:'0.3s',animationFillMode:'backwards'}}>
              <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">TVL</span>
              <p className="text-xl font-bold text-[#1A1A1A] mono-data mt-1">{formattedTvl}</p>
            </div>
            <div className="absolute top-12 right-0 glass-card rounded-2xl p-4 shadow-glass-lg animate-slide-up" style={{animationDelay:'0.5s',animationFillMode:'backwards'}}>
              <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Markets</span>
              <p className="text-xl font-bold text-[#FF6B00] mono-data mt-1">10</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-12 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {[
            { label: "Total Value Locked", value: formattedTvl, color: "#FF6B00" },
            { label: "Active Policies", value: "—", color: "#1A1A1A" },
            { label: "Markets Live", value: "10", color: "#1A1A1A" },
            { label: "Claims Paid", value: formattedTvl !== "$0.00" ? "$—" : "$0.00", color: "#10B981" },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">{stat.label}</span>
              <p className="text-2xl mono-data mt-2 font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ RISK CATEGORIES ═══ */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FF6B00] mb-4 block">Protection Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">Select a risk category.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.name}
                href={`/market/${cat.id}`}
                className="group relative bg-white rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover border border-black/[0.04] flex flex-col justify-between min-h-[280px]"
                onMouseEnter={() => setHoveredCard(cat.name)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}03)` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300" style={{ backgroundColor: `${cat.color}10` }}>
                    <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>{cat.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{cat.name}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">{cat.desc}</p>
                </div>
                <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-black/[0.04]">
                  <span className="mono-data text-xs font-semibold" style={{ color: cat.color }}>APR: {cat.apr}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"><path d="M1 8h14M9 2l6 6-6 6" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 md:py-32 bg-black/[0.03]0">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FF6B00] mb-4 block">Our Process</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-6">From insight<br/>to impact.</h2>
              <p className="text-[#71717A] text-lg leading-relaxed mb-10 max-w-md">A human-centered process powered by smart contracts and real-world oracle data.</p>
              <div className="space-y-8">
                {STEPS.map((step) => (
                  <div key={step.num} className="flex gap-5 group">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-[#FF6B00] mono-data">{step.num}</span>
                      <div className="w-px flex-1 bg-[#EDE8E3] mt-2" />
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{step.title}</h3>
                      <p className="text-sm text-[#71717A] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#71717A] mt-4 flex items-center gap-2">
                <span className="w-[6px] h-[6px] rounded-full bg-[#FF6B00] inline-block" />
                Collaborative. Transparent. Results-driven.
              </p>
            </div>
            <div className="flex justify-center">
              <img src="/process-glass.png" alt="Process" className="w-full max-w-[500px] h-auto object-contain rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROTECTION SHIELD ═══ */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <img src="/protection-glass.png" alt="Shield" className="w-full max-w-[420px] h-auto object-contain animate-float" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FF6B00] mb-4 block">Built with Trust</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-6">Real impact.<br/>Trusted by builders.</h2>
              <p className="text-[#71717A] text-lg leading-relaxed mb-10 max-w-md">We partner with forward-thinking teams to deliver AI-powered protection products that perform.</p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="glass-card rounded-2xl p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-[#FF6B00] inline-block" />Settlement Speed</span>
                  <p className="text-3xl font-bold text-[#1A1A1A] mono-data mt-2">&lt;3s</p>
                  <span className="text-xs text-[#71717A]">average</span>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6B00] flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-[#FF6B00] inline-block" />Collateral Ratio</span>
                  <p className="text-3xl font-bold text-[#10B981] mono-data mt-2">100%</p>
                  <span className="text-xs text-[#71717A]">fully backed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SOLVENCY DASHBOARD ═══ */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-black/[0.04] shadow-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A1A]">Solvency Dashboard</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Oracle Live</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#71717A] tracking-wider">Protocol TVL</span>
                <p className="text-3xl mono-data mt-3 font-bold text-[#1A1A1A]">{formattedTvl}</p>
                <div className="mt-3 h-1.5 w-full bg-[#EDE8E3] rounded-full overflow-hidden"><div className="h-full bg-[#FF6B00] w-[80%] rounded-full" /></div>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#71717A] tracking-wider">Collateral Ratio</span>
                <p className="text-3xl mono-data mt-3 font-bold text-emerald-500">100%</p>
                <p className="text-[11px] mt-2 text-[#71717A]">Min. Threshold: 100%</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#71717A] tracking-wider">Reserve Breakdown</span>
                <div className="mt-3 flex gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[10px] text-blue-600 mono-data font-bold border border-blue-100">USDT</div>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] text-emerald-600 mono-data font-bold border border-emerald-100">ETH</div>
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-[10px] text-amber-600 mono-data font-bold border border-amber-100">ARB</div>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-[#71717A] tracking-wider">Chainlink Feed</span>
                <p className="text-sm mono-data mt-3 text-[#1A1A1A] font-medium">ARB/USD: Live</p>
                <p className="text-[11px] mt-1 text-[#71717A]">Arbitrum Sepolia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 md:py-40 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00]/[0.06] blur-[120px] rounded-full -z-10" />
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#1A1A1A] mb-6">Ready to secure<br/>your future?</h2>
          <p className="text-[#71717A] text-lg mb-10 max-w-lg mx-auto">Join the next generation of decentralized parametric protection.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/market" className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#E55E00] transition-all shadow-[0_8px_25px_rgba(255,107,0,0.2)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.3)] hover:-translate-y-0.5">
              Launch App
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-45"><path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/analytics" className="inline-flex items-center gap-2 border border-[#1A1A1A]/15 text-[#1A1A1A] px-10 py-4 rounded-full text-lg font-medium hover:bg-white/60 transition-all">
              View Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
