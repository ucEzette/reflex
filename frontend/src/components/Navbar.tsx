"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FiatOnRamp } from "@/components/FiatOnRamp";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-primary rounded-lg text-white transform group-hover:rotate-12 transition-transform duration-300">
                        <span className="material-symbols-outlined text-xl">bolt</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        Reflex L1
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link
                        href="/markets"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative group"
                    >
                        Markets
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link
                        href="/profile"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative group"
                    >
                        Profile
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link
                        href="/docs"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative group"
                    >
                        Docs
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link
                        href="/#how-it-works"
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative group"
                    >
                        How It Works
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <FiatOnRamp />
                    <WalletConnect />
                </div>
            </div>
        </nav>
    );
}
