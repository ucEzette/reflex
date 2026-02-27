"use client";

import React, { useState, useEffect } from 'react';
import { Plane, CloudRain, Zap, Cloud, Search, Share2, Info, RefreshCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateMarketProducts } from '@/lib/mockState';
import { MarketProduct } from '@/types/core';

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
    Cloud: Cloud,
    CloudRain: CloudRain,
    Zap: Zap
};

const CATEGORIES = [
    { name: "All", count: 4 },
    { name: "Travel", count: 1 },
    { name: "Weather", count: 1 },
    { name: "Web3", count: 2 }
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

            {/* Sidebar Filters (Polymarket Style) */}
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
                        <button className="p-2 bg-accent border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Market Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((prod) => (
                        <SemanticProductCard key={prod.id} product={prod} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function SemanticProductCard({ product }: { product: MarketProduct }) {
    const Icon = IconMap[product.iconType] || Plane;
    const [input, setInput] = useState("");
    const debouncedInput = useDebounce(input, 500);
    const [isQuoting, setIsQuoting] = useState(false);
    const [quote, setQuote] = useState<number | null>(null);

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

    const linkHref = product.id === 'prod-flight' || product.title === 'Flight Delay' ? '/markets/flight' : '#dashboard';

    return (
        <article className="market3d-parent group w-full relative">
            <div className="market3d-card relative flex flex-col items-start justify-start text-left">
                {/* Background Glass Plate */}
                <div className="market3d-glass pointer-events-none"></div>

                {/* Animated 3D Logo Circles */}
                <div className="market3d-logo pointer-events-none overflow-hidden rounded-tr-[50px]">
                    <span className="market3d-circle market3d-circle1"></span>
                    <span className="market3d-circle market3d-circle2"></span>
                    <span className="market3d-circle market3d-circle3"></span>
                    <span className="market3d-circle market3d-circle4"></span>
                    <span className="market3d-circle market3d-circle5">
                        <Icon className="w-5 h-5 text-white" />
                    </span>
                </div>

                {/* Main Content Area */}
                <div className="market3d-content pointer-events-none w-full pr-8">
                    <div className="flex flex-col items-start mb-2">
                        <span className="text-[10px] font-bold text-white/50 bg-black/20 px-2 py-0.5 rounded uppercase tracking-wider mb-2">{product.category}</span>
                        <span className="market3d-title leading-tight">{product.title}</span>
                    </div>
                    <span className="market3d-text line-clamp-2 min-h-[40px]">
                        {product.description}
                    </span>

                    {/* Quoting Input (Interactive) */}
                    <div className="mt-6 relative z-50 pointer-events-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={product.inputPlaceholder}
                            className="w-full bg-black/20 border border-white/20 rounded-xl py-3 px-4 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-all font-medium"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                {/* Bottom Actions Area */}
                <div className="market3d-bottom z-40 pointer-events-auto w-[calc(100%-40px)]">
                    {isQuoting ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/90 animate-pulse uppercase tracking-wider mx-auto">
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Calculating...
                        </div>
                    ) : quote ? (
                        <div className="flex items-center justify-between w-full h-full">
                            <span className="text-xl font-black text-white ml-2">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote)}
                            </span>
                            <a href={linkHref} className="bg-white hover:bg-white/90 text-[#800020] font-black px-4 py-2 rounded-xl text-xs transition-shadow shadow-lg shadow-black/20 uppercase tracking-wide">
                                Buy Protect
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="market3d-social-buttons-container pointer-events-auto">
                                <a href={linkHref} className="market3d-social-button flex items-center justify-center">
                                    <Info className="w-4 h-4 text-[#800020]" />
                                </a>
                                <button className="market3d-social-button flex items-center justify-center">
                                    <Share2 className="w-4 h-4 text-[#800020]" />
                                </button>
                            </div>
                            <div className="market3d-view-more group w-auto ml-auto cursor-pointer">
                                <a href={linkHref} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                                    <span className="market3d-view-more-button text-[#ffb3c6]">Details</span>
                                    <svg className="svg text-[#ffb3c6] ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
