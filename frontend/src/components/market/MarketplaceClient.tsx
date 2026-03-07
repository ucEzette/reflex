"use client";

import React, { useState, useEffect } from 'react';
import { MarketCard } from '@/components/market/MarketCard';
import { Search, Filter, Shield, Activity, Plane, Globe, CloudSun, Zap, Anchor, Truck, ShoppingBag, Droplets, HeartPulse, Building2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { MarketDetail as Product } from '@/lib/market-data';

const categories = [
    { id: 'all', label: 'All Risks', icon: Globe },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'aviation', label: 'Aviation', icon: Plane },
    { id: 'agri', label: 'Agriculture', icon: CloudSun },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'maritime', label: 'Maritime', icon: Anchor },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'ecommerce', label: 'Ecommerce', icon: ShoppingBag },
    { id: 'weather', label: 'Weather', icon: Droplets },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'property', label: 'Property', icon: Building2 },
];

export function MarketplaceClient() {
    const { products, isLoading, error } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Filter products based on search and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' ||
            product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            product.id.split('-')[1]?.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <p className="text-primary font-bold">Error loading marketplace</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-12 space-y-12 max-w-7xl mx-auto pb-24">
            {/* Hero Header */}
            <header className="relative space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Global Protection Market</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                    Instant Parametric <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">Protection Layer</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Browse and activate real-time protection protocols for global industrial risks.
                    100% collateralized, zero-deductible, instant settlement.
                </p>
            </header>

            {/* Controls */}
            <section className="sticky top-20 z-30 py-4 bg-background/80 backdrop-blur-xl border-y border-white/5 -mx-6 px-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search protocols (e.g. Flight Delay, Drought...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <div className="flex bg-zinc-900/50 border border-white/5 rounded-2xl p-1 gap-1">
                            {categories.slice(0, 4).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                        ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                >
                                    <cat.icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <button className="p-3 bg-zinc-900/50 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Market Grid */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> Live Protocols
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                        {filteredProducts.length} Results
                    </span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[420px] bg-zinc-900/50 border border-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
                        <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">No protocols found</h3>
                        <p className="text-sm text-slate-600">Try adjusting your search or category filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {filteredProducts.map((product) => (
                            <MarketCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Trust Footer */}
            <section className="py-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center md:justify-start text-primary font-black uppercase text-[10px] tracking-widest">
                        <Shield className="w-3 h-3" /> Fully Collateralized
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">All protection policies are 100% backed by USDC liquidity in smart contract vaults.</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center md:justify-start text-primary font-black uppercase text-[10px] tracking-widest">
                        <Activity className="w-3 h-3" /> Programmable Payouts
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Claims are settled automatically via decentralized oracle triggers with zero manual filing.</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center md:justify-start text-primary font-black uppercase text-[10px] tracking-widest">
                        <Globe className="w-3 h-3" /> Transparent Governance
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Risk parameters and yield distributions are governed by the Reflex Protocol DAO.</p>
                </div>
            </section>
        </div>
    );
}
