import React from 'react';
import { MarketDetail } from '@/lib/market-data';

export function MarketInformationArea({ market }: { market: MarketDetail }) {
    return (
        <div className="flex flex-col gap-6 mt-8">

            {/* About the Market Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    About the Market
                </h2>
                <div className="prose prose-invert max-w-none text-foreground">
                    <p className="leading-relaxed">
                        {market.about}
                    </p>
                </div>
            </div>

            {/* Resolution Rules Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-400">gavel</span>
                    Resolution Rules
                </h2>
                <div className="prose prose-invert max-w-none text-foreground">
                    <ul className="space-y-3 list-none p-0 m-0">
                        {market.rules.split(/[0-9]\./).filter(rule => rule.trim() !== '').map((rule, idx) => (
                            <li key={idx} className="flex gap-3 text-sm md:text-base leading-relaxed">
                                <span className="font-mono text-cyan-500 font-bold shrink-0">{idx + 1}.</span>
                                <span>{rule.trim()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* On-Chain Metrics Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Oracle</span>
                    <span className="text-sm font-bold text-foreground max-w-[120px] truncate">{market.marketData.oracleNode}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Source</span>
                    <span className="text-sm font-bold text-foreground max-w-[120px] truncate">{market.marketData.resolutionSource}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Max Payout</span>
                    <span className="text-sm font-bold text-green-400 max-w-[120px] truncate">{market.marketData.maxPayout}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center justify-center">
                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Risk Fee</span>
                    <span className="text-sm font-bold text-primary max-w-[120px] truncate">{market.marketData.riskPremium}</span>
                </div>
            </div>

        </div>
    );
}
