"use client";

import React, { useState, useEffect } from 'react';
import { Plane, CloudRain, Zap, Flame, Anchor, Search, Share2, Info, RefreshCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateMarketProducts } from '@/lib/mockState';
import { MarketProduct } from '@/types/core';
import { OnboardingTour } from '@/components/ui/OnboardingTour';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const IconMap: Record<string, React.ElementType> = {
    Plane: Plane,
    CloudRain: CloudRain,
    Zap: Zap,
    Flame: Flame,
    Anchor: Anchor
};

const CATEGORIES = [
    { name: "All", count: 5 },
    { name: "Travel", count: 1 },
    { name: "Agriculture", count: 1 },
    { name: "Energy", count: 1 },
    { name: "Catastrophe", count: 1 },
    { name: "Maritime", count: 1 }
];

export default function CoverageMarketplace() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const products = generateMarketProducts();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = products.filter(p => {
        const matchesTab = activeTab === "All" || p.category === activeTab;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row pb-12">
            <OnboardingTour />

            {/* Sidebar Filters (Protection Market Style) */}
            <aside className="w-full lg:w-64 shrink-0 lg:border-r border-border p-4 lg:p-6 space-y-8 sticky top-16 h-fit lg:h-[calc(100vh-64px)] overflow-y-auto">
                <div>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Categories</h3>
                    <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveTab(cat.name)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                                    activeTab === cat.name
                                        ? "bg-primary/10 text-primary font-bold shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <span>{cat.name}</span>
                                <span className="text-[10px] font-mono opacity-60">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Status</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border bg-accent text-primary focus:ring-primary/50" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">Active Markets</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-border bg-accent text-primary focus:ring-primary/50" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">Completed</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">How it Works</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">1</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">Search</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">Enter your flight or asset details.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">2</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">Quote</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">See your custom premium instantly.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">3</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">Secure</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">Pay premium to lock protection.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">4</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">Settle</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">Auto-payout if event is verified.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content area */}
            <main className="flex-1 p-4 lg:p-8 space-y-6">

                {/* Market Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by flight, event, or asset..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium mr-2">{filtered.length} markets found</span>
                        <button
                            onClick={() => {
                                localStorage.removeItem('reflex_onboarding_seen');
                                window.location.reload();
                            }}
                            className="p-2 bg-accent border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                        >
                            <Info className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Guide</span>
                        </button>
                        <button className="p-2 bg-accent border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Market Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((prod, idx) => (
                        <div key={prod.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'backwards' }}>
                            <SemanticProductCard product={prod} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

function ProductTooltip({ product, onClose }: { product: MarketProduct, onClose: () => void }) {
    const tip = product.tooltipSummary;
    if (!tip) return null;
    return (
        <div className="absolute inset-0 z-50 bg-zinc-950 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-2xl" style={{ transform: 'translate3d(0, 0, 150px)', backfaceVisibility: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{product.title}</span>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xs font-black">✕</button>
                </div>
                <div className="space-y-3 text-[11px]">
                    <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold">Oracle</span>
                        <span className="text-zinc-200 text-right max-w-[60%]">{tip.oracle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold">Risk Model</span>
                        <span className="text-zinc-200 text-right max-w-[60%]">{tip.riskModel}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold">Settlement</span>
                        <span className="text-zinc-200 text-right max-w-[60%]">{tip.settlement}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold">Premium</span>
                        <span className="text-emerald-400 font-bold text-right max-w-[60%]">{tip.premiumRange}</span>
                    </div>
                    <div className="border-t border-white/5 pt-3 mt-1">
                        <span className="text-zinc-500 font-bold block mb-1">Trigger Condition</span>
                        <span className="text-amber-400/90 text-[10px] leading-relaxed">{tip.trigger}</span>
                    </div>
                </div>
            </div>
            <a href={`/market/${product.id}`} className="mt-4 block w-full text-center bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-primary/20 transition-all">
                View Full Details →
            </a>
        </div>
    );
}

function SemanticProductCard({ product }: { product: MarketProduct }) {
    const Icon = IconMap[product.iconType] || Plane;
    const [input, setInput] = useState("");
    const debouncedInput = useDebounce(input, 500);
    const [isQuoting, setIsQuoting] = useState(false);
    const [quote, setQuote] = useState<number | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (!debouncedInput) {
            setQuote(null);
            return;
        }
        setIsQuoting(true);
        const timer = setTimeout(() => {
            setQuote(Math.floor(Math.random() * 50) + 10);
            setIsQuoting(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [debouncedInput]);

    const linkHref = `/market/${product.id}`;

    return (
        <article className="market3d-parent">
            <div className="market3d-card">
                {/* Background Glass Plate */}
                <div className="market3d-glass"></div>

                {/* Tooltip Overlay */}
                {showTooltip && <ProductTooltip product={product} onClose={() => setShowTooltip(false)} />}

                {/* Main Content Area */}
                <div className="market3d-content">
                    <span className="market3d-title">{product.title}</span>
                    <span className="market3d-text">
                        {product.description}
                    </span>

                    {/* Quoting Input (Interactive) */}
                    <div className="mt-4 relative" style={{ transform: 'translate3d(0,0,10px)' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={product.inputPlaceholder}
                            className="w-full bg-black/30 border border-white/20 rounded-xl py-2 px-3 text-xs text-foreground placeholder:text-foreground/60 focus:outline-none focus:border-white/50 transition-all font-medium"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                {/* Bottom Actions Area */}
                <div className="market3d-bottom">
                    {isQuoting ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/90 animate-pulse uppercase tracking-wider mx-auto w-full justify-center">
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Calculating...
                        </div>
                    ) : quote ? (
                        <div className="flex items-center justify-between w-full h-full text-foreground">
                            <span className="text-xl font-black">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote)}
                            </span>
                            <a href={linkHref} className="bg-white hover:bg-white/90 text-[#800020] font-black px-4 py-2 rounded-xl text-xs transition-shadow shadow-lg shadow-black/20 uppercase tracking-wide">
                                Buy Protect
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="market3d-social-buttons-container">
                                <button onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }} className="market3d-social-button flex items-center justify-center">
                                    <Info className="w-4 h-4 text-[#800020]" />
                                </button>
                                <button className="market3d-social-button flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-[#800020]" />
                                </button>
                            </div>
                            <div className="market3d-view-more">
                                <a href={linkHref} className="flex items-center hover:opacity-80 transition-opacity">
                                    <button className="market3d-view-more-button">Details</button>
                                    <svg className="market3d-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </a>
                            </div>
                        </>
                    )}
                </div>

                {/* Animated 3D Logo Circles */}
                <div className="market3d-logo">
                    <span className="market3d-circle market3d-circle1"></span>
                    <span className="market3d-circle market3d-circle2"></span>
                    <span className="market3d-circle market3d-circle3"></span>
                    <span className="market3d-circle market3d-circle4"></span>
                    <span className="market3d-circle market3d-circle5">
                        <Icon className="w-5 h-5 text-foreground" />
                    </span>
                </div>
            </div>
        </article>
    );
}
