"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ALL_MARKETS, MarketDetail } from "@/lib/market-data";

const CATEGORIES = ["All Assets", "Travel", "Agriculture", "Energy", "Infrastructure", "Crypto"];

const CATEGORY_MAP: Record<string, string[]> = {
  "All Assets": [],
  Travel: ["travel"],
  Agriculture: ["agri"],
  Energy: ["energy", "solar"],
  Infrastructure: ["catastrophe", "maritime", "logistics", "utility"],
  Crypto: ["depeg"],
};

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState("All Assets");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMarkets = useMemo(() => {
    let markets = ALL_MARKETS;

    // Category filter
    if (activeFilter !== "All Assets") {
      const cats = CATEGORY_MAP[activeFilter] || [];
      markets = markets.filter((m) =>
        cats.some((c) => m.category.toLowerCase().includes(c) || m.id.toLowerCase().includes(c))
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.riskBase.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    return markets;
  }, [activeFilter, searchQuery]);

  return (
    <div className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-16 max-w-2xl">
        <h1 className="text-6xl font-bold tracking-tight mb-4 leading-tight">
          Protection <span className="text-primary">Marketplace</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Browse and purchase parametric micro-insurance. Trustless settlement powered by real-world oracles.
        </p>
      </header>

      {/* Filter Bar */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-institutional whitespace-nowrap transition-colors ${
                  activeFilter === cat
                    ? "bg-primary-container text-on-primary-fixed"
                    : "bg-surface-container-low text-zinc-400 hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative min-w-[320px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-zinc-500 text-sm">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by ID or keyword..."
              className="w-full bg-surface-container-lowest border-none rounded-lg pl-12 pr-4 py-3 text-sm font-body focus:ring-1 focus:ring-secondary/50 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
        {filteredMarkets.length === 0 && (
          <div className="col-span-full text-center py-20">
            <span className="material-symbols-outlined text-6xl text-zinc-700 mb-4">search_off</span>
            <p className="text-zinc-500 text-lg">No markets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: MarketDetail }) {
  return (
    <Link
      href={`/market/${market.id}`}
      className="group relative bg-surface-container-low p-6 rounded-lg transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 specular-border flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-8 z-50">
        <div className="p-3 bg-surface-container-highest rounded-2xl group-hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-primary text-3xl group-hover:text-on-primary-container">
            {market.icon}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Tooltip Trigger & Overlay */}
          <div className="group/tt">
            <div className="p-1 rounded-full hover:bg-surface-container-highest transition-colors flex items-center justify-center cursor-help" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined text-zinc-500 group-hover/tt:text-zinc-300 text-[18px]">info</span>
            </div>
            
            {/* ── All-in-One Hover Tooltip ── */}
            <div className="absolute inset-0 bg-zinc-950 rounded-lg opacity-0 invisible group-hover/tt:opacity-100 group-hover/tt:visible transition-all duration-300 z-50 flex flex-col p-6 shadow-2xl border border-white/10 text-left cursor-default" onClick={(e) => e.preventDefault()}>
              <h4 className="text-red-500 uppercase tracking-[0.2em] text-[10px] font-bold mb-4">Risk Attribution</h4>
              <p className="text-zinc-200 text-sm leading-relaxed overflow-y-auto no-scrollbar">
                {market.about}
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-widest font-bold">
                View Details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </div>
          
          <span className="font-mono text-[10px] text-zinc-500 bg-surface-container-lowest px-2 py-1 rounded">
            {market.riskBase}
          </span>
        </div>
      </div>
      <div className="mb-auto z-10">
        <h3 className="text-xl font-bold mb-6">{market.title}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-institutional">Oracle Source</span>
            <span className="font-mono text-xs text-on-surface">{market.marketData.oracleNode}</span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-institutional">Trigger</span>
            <span className="font-mono text-xs text-on-surface">{market.bullet2}</span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-institutional">Settlement</span>
            <span className="font-mono text-[10px] text-on-surface">{market.marketData.settlement}</span>
          </div>
        </div>
      </div>

      <button className="mt-8 w-full py-3 bg-surface-container-highest text-on-surface font-bold text-institutional rounded-xl group-hover:bg-primary-container group-hover:text-on-primary-fixed transition-all z-10">
        Select Risk
      </button>
    </Link>
  );
}
