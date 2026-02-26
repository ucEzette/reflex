"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Plus, User, Activity as ActivityIcon, BarChart3, Briefcase } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const { login, logout, authenticated } = usePrivy();
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300 h-16">
            <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">

                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-7 h-7 flex items-center justify-center bg-primary rounded-md text-white">
                        <span className="material-symbols-outlined text-lg">bolt</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
                        Reflex
                    </span>
                </Link>

                {/* Center: Search Bar (Polymarket Style) */}
                <div className="flex-1 max-w-2xl relative hidden md:block">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-accent/50 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
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
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {!authenticated ? (
                            <button
                                onClick={login}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                Log In
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Balance & Deposit (Polymarket style) */}
                                <div className="flex items-center gap-2 bg-accent/50 border border-border rounded-lg pl-3 pr-1 py-1">
                                    <span className="text-xs font-bold text-foreground">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(12450.50)}
                                    </span>
                                    <button className="bg-primary text-primary-foreground p-1 rounded-md hover:opacity-90 transition-opacity">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* User Dropdown / Avatar */}
                                <button
                                    onClick={logout}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-accent border border-border hover:bg-accent/80 transition-colors"
                                    title="Log Out"
                                >
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
