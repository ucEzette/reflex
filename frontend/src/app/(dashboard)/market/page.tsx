"use client";

import React, { useState, useEffect } from 'react';
import { Plane, CloudRain, Zap, Cloud, Search, CheckCircle2 } from 'lucide-react';
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

const CATEGORIES = ["All", "Travel", "Weather", "Web3"];

export default function CoverageMarketplace() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const products = generateMarketProducts();
    const [activeTab, setActiveTab] = useState("All");
    
    const filtered = products.filter(p => activeTab === "All" || p.category === activeTab);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12 max-w-7xl mx-auto space-y-8">
            {/* Market Header Hero */}
            <header className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
                <div className="max-w-2xl relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">Coverage Marketplace</h1>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        Browse our collection of deterministic parametric policies. Instantly quote and purchase transparent, oracle-verified protection that pays out automatically.
                    </p>
                </div>
                <div className="relative z-10 flex shrink-0 gap-4 text-primary">
                    <CheckCircle2 className="w-12 h-12 opacity-80" />
                </div>
            </header>

            {/* Sticky Category Tabs */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border py-4">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                activeTab === cat 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((prod) => (
                    <SemanticProductCard key={prod.id} product={prod} />
                ))}
            </div>
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
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:bg-accent/10 hover:border-primary/30 flex flex-col justify-between h-[340px] shadow-sm">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent rounded-xl border border-border/50 text-primary group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground tracking-tight">{product.title}</h3>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{product.category}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {product.badges.map(badge => (
                        <span key={badge} className="text-[9px] font-bold uppercase tracking-wider bg-accent text-foreground px-2 py-0.5 rounded border border-border/50">
                            {badge}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 h-10">
                    {product.description}
                </p>

                {/* Inline Quote Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={product.inputPlaceholder}
                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* Pricing Section */}
            <div className="p-5 bg-accent/20 border-t border-border min-h-[84px] flex items-center justify-between">
                {isQuoting ? (
                    <div className="w-full flex items-center justify-between animate-pulse">
                        <div className="space-y-2">
                            <div className="w-24 h-3 bg-accent rounded" />
                            <div className="w-16 h-5 bg-accent rounded" />
                        </div>
                        <div className="w-20 h-10 bg-accent rounded-lg" />
                    </div>
                ) : quote ? (
                    <>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Estimated Premium</span>
                            <span className="text-xl font-bold text-foreground tracking-tight">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote)}
                            </span>
                        </div>
                        <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                            Select
                        </button>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground/80 italic w-full text-center">Enter data to quote coverage</p>
                )}
            </div>
        </article>
    );
}
