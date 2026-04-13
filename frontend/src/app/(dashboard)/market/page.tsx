"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ALL_MARKETS, MarketDetail } from "@/lib/market-data";
import { Search, Filter, ArrowRight, Shield, Globe, Droplets, Zap, Info, ChevronRight } from "lucide-react";

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-[#D31027] text-white shadow-[0_0_20px_rgba(211,16,39,0.3)]"
                    : "bg-[#0A0A0A] text-zinc-500 border border-white/5 hover:border-white/10 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative min-w-[360px] group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#D31027]">
              <Search className="w-4 h-4 text-zinc-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by ID or keyword..."
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-body focus:border-[#D31027]/40 focus:ring-0 focus:outline-none transition-all placeholder:text-zinc-700"
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
      className="group relative bg-[#0A0A0A] p-7 rounded-3xl transition-all duration-500 hover:bg-[#101216] hover:-translate-y-2 border border-white/5 hover:border-white/10 flex flex-col h-[480px] overflow-hidden"
    >
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D31027]/5 blur-[60px] rounded-full group-hover:bg-[#D31027]/10 transition-colors" />

      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#D31027]/10 transition-colors border border-white/5">
          <span className="material-symbols-outlined text-[#D31027] text-3xl transition-transform duration-500 group-hover:scale-110">
            {market.icon}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Tooltip trigger wrapped in a nicer UI */}
          <div className="group/tt relative">
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors cursor-help" onClick={(e) => e.preventDefault()}>
                <Info className="w-3.5 h-3.5 text-zinc-600 group-hover/tt:text-zinc-300" />
            </div>
            
            <div className="absolute top-10 right-0 w-64 p-4 bg-[#15151A] rounded-2xl opacity-0 invisible group-hover/tt:opacity-100 group-hover/tt:visible transition-all duration-300 z-[100] border border-white/10 shadow-2xl backdrop-blur-xl" onClick={(e) => e.preventDefault()}>
              <h4 className="text-[#D31027] uppercase tracking-[0.2em] text-[9px] font-black mb-3">Risk Attribution</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {market.about}
              </p>
            </div>
          </div>
          
          <span className="font-mono text-[9px] font-black text-zinc-600 bg-white/5 px-2.5 py-1.5 rounded uppercase tracking-widest border border-white/5">
            {market.riskBase}
          </span>
        </div>
      </div>

      <div className="mb-auto relative z-10">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3 bg-[#D31027] rounded-full" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{market.category}</span>
        </div>
        <h3 className="text-2xl font-bold mb-8 text-white group-hover:text-[#FFB3B5] transition-colors leading-tight">{market.title}</h3>
        
        <div className="space-y-5">
          <div className="flex justify-between items-center group/metric">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover/metric:text-zinc-400">Oracle Node</span>
            <span className="font-mono text-[11px] text-zinc-400 font-bold group-hover/metric:text-white transition-colors">{market.marketData.oracleNode}</span>
          </div>
          <div className="flex justify-between items-center group/metric">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover/metric:text-zinc-400">Trigger</span>
            <span className="font-mono text-[11px] text-zinc-400 font-bold group-hover/metric:text-white transition-colors">{market.bullet2}</span>
          </div>
          <div className="flex justify-between items-center group/metric">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover/metric:text-zinc-400">Settlement</span>
            <span className="font-mono text-[10px] text-zinc-500 font-bold group-hover/metric:text-[#D31027] transition-colors">{market.marketData.settlement}</span>
          </div>
        </div>
      </div>

      <button className="mt-10 w-full py-4 bg-white/5 text-zinc-400 font-black text-[10px] tracking-[0.2em] uppercase rounded-2xl group-hover:bg-[#D31027] group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 relative z-10">
        SELECT RISK
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </Link>
  );
}
