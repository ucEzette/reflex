import React from 'react';
import { notFound } from 'next/navigation';
import { ALL_MARKETS } from '@/lib/market-data';
import { MarketActionCard } from '@/components/simulation/MarketActionCard';
import { MarketInformationArea } from '@/components/simulation/MarketInformationArea';

export default function GenericMarketPage({ params }: { params: { id: string } }) {
    const market = ALL_MARKETS.find((m) => m.id === params.id);

    if (!market) {
        notFound();
    }

    return (
        <main className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex flex-col pt-24 pb-20">

            {/* Ambient Background Glow based on market color */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full mix-blend-screen opacity-10 pointer-events-none"
                style={{ backgroundColor: `rgb(${market.rgb})` }}
            />

            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">

                {/* Header Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 font-mono mb-8">
                    <a href="/" className="hover:text-white transition-colors">Markets</a>
                    <span>/</span>
                    <span className="text-slate-300">{market.riskBase}</span>
                    <span>/</span>
                    <span className="text-white font-medium">{market.title}</span>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8 lg:gap-12">

                    {/* Left Column: Data & Information */}
                    <div className="flex flex-col gap-8 order-2 lg:order-1">

                        {/* Title Section */}
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`${market.iconBg} ${market.iconColor} p-3 rounded-xl border border-white/5`}>
                                    <span className="material-symbols-outlined text-3xl">{market.icon}</span>
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{market.title}</h1>
                            </div>
                            <p className="text-xl text-slate-400 font-light max-w-3xl leading-relaxed">
                                {market.description}
                            </p>
                        </div>

                        {/* Interactive Area / Chart Placeholder */}
                        <div className="w-full h-[300px] md:h-[400px] rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center group">
                            {/* Abstract Risk Visualization */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                                <span className={`material-symbols-outlined text-6xl mb-4 ${market.iconColor}`}>{market.icon}</span>
                                <p className="font-mono text-sm text-slate-400">Risk Model Visualization Loading...</p>
                                <div className="mt-4 flex gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${market.iconBg}`} style={{ animationDelay: '0ms' }} />
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${market.iconBg}`} style={{ animationDelay: '150ms' }} />
                                    <div className={`w-2 h-2 rounded-full animate-bounce ${market.iconBg}`} style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>

                        <MarketInformationArea market={market} />

                    </div>

                    {/* Right Column: Purchasing Card (Sticky) */}
                    <div className="order-1 lg:order-2">
                        <div className="sticky top-28">
                            <MarketActionCard market={market} />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
