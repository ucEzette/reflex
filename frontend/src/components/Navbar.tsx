"use client";

import Link from "next/link";
import { useAccount, useReadContract, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS, ERC20_ABI } from "@/lib/contracts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletConnect } from "@/components/WalletConnect";
import { Search, Wallet, User, Activity as ActivityIcon, BarChart3, Briefcase, ChevronDown, Trophy, Medal, Terminal, Code, Moon, LogOut, Settings, HelpCircle, FileText, CheckCircle2, Eye, EyeOff, TrendingUp, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ALL_MARKETS, MarketDetail } from "@/lib/market-data";

export function Navbar() {
    const { address, isConnected: authenticated, connector } = useAccount();
    const { disconnect } = useDisconnect();

    const { data: balanceData } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const displayBalance = balanceData ? Number(formatUnits(balanceData as bigint, 6)) : 0;

    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isBalanceHidden, setIsBalanceHidden] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchResults, setSearchResults] = useState<MarketDetail[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const filtered = ALL_MARKETS.filter(m =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.riskBase.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
        setSearchResults(filtered);
    }, [searchQuery]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const mobileNavLinks = [
        { href: "/market", label: "Markets", icon: <BarChart3 className="w-5 h-5" /> },
        { href: "/dashboard", label: "Portfolio", icon: <Briefcase className="w-5 h-5" /> },
        { href: "/transparency", label: "Activity", icon: <ActivityIcon className="w-5 h-5" /> },
        { href: "/invest", label: "Invest", icon: <TrendingUp className="w-5 h-5" /> },
        { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
        { href: "/docs", label: "Docs", icon: <FileText className="w-5 h-5" /> },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300 h-16">
                <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">

                    {/* Left: Logo + Mobile Hamburger */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-accent/50 border border-border text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                            <div className="w-7 h-7 flex items-center justify-center bg-primary rounded-md text-white">
                                <span className="material-symbols-outlined text-lg">bolt</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
                                Reflex
                            </span>
                        </Link>
                    </div>

                    {/* Center: Search Bar (Polymarket Style) */}
                    <div className="flex-1 max-w-2xl relative hidden md:block" ref={searchRef}>
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-accent/50 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />

                        {/* Search Results Dropdown */}
                        {isSearchFocused && searchQuery.trim() !== "" && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                                {searchResults.length > 0 ? (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">Markets</div>
                                        {searchResults.map(market => (
                                            <Link
                                                key={market.id}
                                                href={`/markets/${market.id}`}
                                                onClick={() => {
                                                    setIsSearchFocused(false);
                                                    setSearchQuery("");
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors group"
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${market.iconBg} ${market.iconColor} flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-base">{market.icon}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{market.title}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{market.riskBase} • {market.marketData.maxPayout} limit</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm text-muted-foreground">No markets found for "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Nav Links + Auth */}
                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Main Nav Links */}
                        <div className="hidden lg:flex items-center gap-6 mr-4 border-r border-border pr-6 h-8">
                            <Link href="/market" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Markets
                            </Link>
                            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Portfolio
                            </Link>
                            <Link href="/transparency" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <ActivityIcon className="w-4 h-4" />
                                Activity
                            </Link>
                            <Link href="/invest" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Invest
                            </Link>
                            <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </Link>
                            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Docs
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {!mounted ? null : !authenticated ? (
                                <WalletConnect />
                            ) : (
                                <div className="flex items-center gap-4">
                                    {/* Balance (Polymarket style) */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 mr-2">
                                            <button
                                                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                                                className="text-slate-400 hover:text-white transition-colors"
                                            >
                                                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <div className="flex flex-col items-end hidden sm:flex">
                                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Portfolio</span>
                                                <span className="text-sm font-bold text-slate-200">
                                                    {isBalanceHidden ? '***' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayBalance)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end hidden sm:flex">
                                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Cash</span>
                                                <span className="text-sm font-bold text-slate-200">
                                                    {isBalanceHidden ? '***' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayBalance)}
                                                </span>
                                            </div>
                                        </div>

                                        <WalletConnect />
                                    </div>

                                    {/* User Profile Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-green-400 via-blue-500 to-purple-500 p-0.5 hover:ring-2 ring-[#2490ff] ring-offset-2 ring-offset-background transition-all"
                                        >
                                            <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                                                {/* Gradient Avatar placeholder */}
                                                <div className="w-full h-full bg-gradient-to-tr from-green-400 via-blue-500 to-purple-500 opacity-80" />
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl shadow-2xl py-2 z-50 text-sm overflow-hidden flex flex-col">
                                                {/* Header */}
                                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 via-blue-500 to-purple-500 opacity-80" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white text-base">reflex_user</span>
                                                            <span className="text-xs font-mono text-slate-400">
                                                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x000...000'}
                                                                <span className="material-symbols-outlined text-[10px] ml-1 opacity-50">content_copy</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors cursor-pointer z-50 p-1" onClick={() => setIsProfileOpen(false)}>
                                                        <Settings className="w-5 h-5 pointer-events-none" />
                                                    </Link>
                                                </div>

                                                {/* Top Switches / Actions */}
                                                <div className="py-2 border-b border-white/5 flex flex-col gap-1">
                                                    <div className="w-full px-4 py-1.5 flex items-center justify-between text-slate-300">
                                                        <div className="flex items-center gap-3">
                                                            <Moon className="w-4 h-4 text-slate-400" /> Dark mode
                                                        </div>
                                                        <div className="scale-75 origin-right">
                                                            <ThemeToggle />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Links */}
                                                <div className="py-2 border-b border-white/5">
                                                    <Link href="/transparency" className="w-full px-4 py-1.5 flex text-left hover:bg-white/5 transition-colors text-slate-400 hover:text-white" onClick={() => setIsProfileOpen(false)}>Activity</Link>
                                                    <button className="w-full px-4 py-1.5 flex text-left hover:bg-white/5 transition-colors text-slate-400 hover:text-white">Support</button>
                                                    <Link href="/docs" className="w-full px-4 py-1.5 flex text-left hover:bg-white/5 transition-colors text-slate-400 hover:text-white" onClick={() => setIsProfileOpen(false)}>Documentation</Link>
                                                    <button className="w-full px-4 py-1.5 flex text-left hover:bg-white/5 transition-colors text-slate-400 hover:text-white">Help Center</button>
                                                    <button className="w-full px-4 py-1.5 flex text-left hover:bg-white/5 transition-colors text-slate-400 hover:text-white">Terms of Use</button>
                                                </div>

                                                {/* Footer Logging out */}
                                                <div className="py-2">
                                                    <button
                                                        onClick={() => {
                                                            if (connector) {
                                                                disconnect({ connector });
                                                            } else {
                                                                disconnect();
                                                            }
                                                            setIsProfileOpen(false);
                                                        }}
                                                        className="w-full px-4 py-2 flex text-left hover:bg-white/5 transition-colors text-red-500 font-medium"
                                                    >
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Navigation Drawer ── */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl animate-fade-in-up overflow-y-auto max-h-[calc(100vh-4rem)]">
                        <div className="p-4 border-b border-white/5 md:hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search markets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-accent/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                        <div className="py-2">
                            {mobileNavLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-6 py-3.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all active:bg-white/10"
                                >
                                    {link.icon}
                                    <span className="text-base font-medium">{link.label}</span>
                                </Link>
                            ))}
                        </div>
                        {authenticated && (
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</span>
                                    <span className="text-lg font-bold text-foreground">
                                        {isBalanceHidden ? '•••' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayBalance)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-2"
                                >
                                    {isBalanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
