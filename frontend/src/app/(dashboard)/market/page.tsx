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
    { name: "All", count: 12 },
    { name: "Travel", count: 4 },
    { name: "Weather", count: 4 },
    { name: "Web3", count: 4 }
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

    return (
        <article className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            {/* Upper Section */}
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary border border-border/50 group-hover:rotate-6 transition-transform">
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                {product.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{product.category}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                        <Info className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6 line-clamp-2 min-h-[32px]">
                    {product.description}
                </p>

                {/* Quoting Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={product.inputPlaceholder}
                        className="w-full bg-accent/30 border border-border rounded-xl py-3 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Bottom Section (Pricing) */}
            <div className="px-5 py-4 bg-accent/20 border-t border-border mt-auto flex items-center justify-between gap-4">
                {isQuoting ? (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary animate-pulse uppercase tracking-wider">
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Calculating Premium...
                    </div>
                ) : quote ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Premium</span>
                            <span className="text-lg font-bold text-foreground">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote)}
                            </span>
                        </div>
                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs transition-shadow shadow-lg shadow-primary/20">
                            Buy Protection
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground/60 w-full justify-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest">Enter details to quote</p>
                    </div>
                )}
            </div>
        </article>
    );
}
