"use client";

import React, { useState, useEffect } from 'react';
import { MarketCard } from '@/components/market/MarketCard';
import { Search, Filter, Shield, Activity, Plane, Globe, CloudSun, Zap, Anchor, Truck, ShoppingBag, Droplets, HeartPulse, Building2, X, Sparkles, MousePointerClick, Settings2, CreditCard, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
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

const GUIDE_STEPS = [
    {
        number: 1,
        icon: Search,
        title: 'Browse & Filter',
        description: 'Use the search bar and category filters to find the right parametric protection product for your needs.',
        accent: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
    },
    {
        number: 2,
        icon: MousePointerClick,
        title: 'Select a Product',
        description: 'Click on any product card to open its detail page and explore coverage options.',
        accent: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
    },
    {
        number: 3,
        icon: Settings2,
        title: 'Configure & Quote',
        description: 'Enter your parameters (flight number, zone, coordinates), set your payout, and get a live premium quote powered by on-chain oracles.',
        accent: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        number: 4,
        icon: CreditCard,
        title: 'Verify & Purchase',
        description: 'Verify your identity via World ID, approve USDT spending, and secure your parametric policy on-chain. Settlement is fully automatic.',
        accent: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
];

const GUIDE_STORAGE_KEY = 'reflex_marketplace_guide_dismissed';

export function MarketplaceClient() {
    const { products, isLoading, error } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showGuide, setShowGuide] = useState(false);
    const [guideCollapsed, setGuideCollapsed] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(GUIDE_STORAGE_KEY);
        if (!dismissed) {
            setShowGuide(true);
        }
    }, []);

    const dismissGuide = () => {
        setShowGuide(false);
        localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
    };

    const reopenGuide = () => {
        setShowGuide(true);
        setGuideCollapsed(false);
        localStorage.removeItem(GUIDE_STORAGE_KEY);
    };

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
                    <span className="text-primary">Protection Layer</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Browse and activate real-time protection protocols for global industrial risks.
                    100% collateralized, zero-deductible, instant settlement.
                </p>
            </header>

            {/* ── Marketplace Guide Banner ── */}
            {showGuide && (
                <section className="relative bg-card border border-border rounded-2xl overflow-hidden animate-guide-fade-in">
                    {/* Header Row */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">How It Works</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">4-Step Guide to Parametric Protection</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setGuideCollapsed(!guideCollapsed)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                                aria-label={guideCollapsed ? 'Expand guide' : 'Collapse guide'}
                            >
                                {guideCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={dismissGuide}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                                aria-label="Dismiss guide"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Steps Grid */}
                    {!guideCollapsed && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {GUIDE_STEPS.map((step, index) => (
                                    <div
                                        key={step.number}
                                        className={`relative group p-5 rounded-xl ${step.bg} border ${step.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Step Number Badge */}
                                        <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full bg-background border-2 ${step.border} flex items-center justify-center`}>
                                            <span className={`text-[10px] font-black ${step.accent}`}>{step.number}</span>
                                        </div>

                                        {/* Connector Line (between cards) */}
                                        {index < GUIDE_STEPS.length - 1 && (
                                            <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-white/10" />
                                        )}

                                        <div className="flex items-start gap-3 mt-1">
                                            <step.icon className={`w-5 h-5 ${step.accent} shrink-0 mt-0.5`} />
                                            <div>
                                                <h4 className={`text-sm font-bold ${step.accent} mb-1`}>{step.title}</h4>
                                                <p className="text-[11px] text-zinc-400 leading-relaxed">{step.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                Powered by Chainlink Oracles · Avalanche C-Chain · World ID · Autonomous Agent via Tether WDK
                                </p>
                                <button
                                    onClick={dismissGuide}
                                    className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Got it, dismiss →
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Reopen Guide Button (shown when guide is dismissed) */}
            {!showGuide && (
                <button
                    onClick={reopenGuide}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                >
                    <BookOpen className="w-3.5 h-3.5" /> How It Works
                </button>
            )}

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
                    <p className="text-xs text-slate-500 leading-relaxed">All protection policies are 100% backed by USDT liquidity in smart contract vaults.</p>
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
