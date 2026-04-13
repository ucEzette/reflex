"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Globe, Shield, Terminal, Activity } from "lucide-react";
import { useBlockNumber, useReadContract } from 'wagmi';
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { CONTRACTS, LP_POOL_ABI } from "@/lib/contracts";

export function Footer() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const { data: totalAssets } = useReadContract({
        address: CONTRACTS.LP_POOL as `0x${string}`,
        abi: LP_POOL_ABI,
        functionName: "totalAssets",
        query: { enabled: mounted }
    });

    return (
        <footer className="w-full bg-[#030406] border-t border-white/5 mt-20 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
            <div className="max-w-[1600px] mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center group">
                            <img
                                src="/logoD.png"
                                alt="Reflex Logo"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs font-light">
                            The internet of value needs a safety net. Reflex provides hyper-efficient, parametric coverage for the most volatile real-world risks.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://x.com/runicsorcerer" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/10">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://github.com/ucEzette/reflex" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/10">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="/analytics" className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/10">
                                <Activity className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Protocol */}
                    <div>
                        <h4 className="font-black text-[10px] mb-8 uppercase tracking-[0.2em] text-zinc-500">Protocol</h4>
                        <ul className="space-y-4">
                            <li><Link href="/market" className="text-sm text-zinc-400 hover:text-white transition-colors">Markets Explorer</Link></li>
                            <li><Link href="/invest" className="text-sm text-zinc-400 hover:text-white transition-colors">Liquidity Pools</Link></li>
                            <li><Link href="/docs#oracle-flow" className="text-sm text-zinc-400 hover:text-white transition-colors">Transparency Feed</Link></li>
                            <li><Link href="/analytics" className="text-sm text-zinc-400 hover:text-white transition-colors">Risk Analytics</Link></li>
                        </ul>
                    </div>

                    {/* Developers */}
                    <div>
                        <h4 className="font-black text-[10px] mb-8 uppercase tracking-[0.2em] text-zinc-500">Developers</h4>
                        <ul className="space-y-4">
                            <li><a href="https://docs.google.com/presentation/d/1RAQHRFVr9NHClst8C7FdOXr4fHUsxcsug20wHwEC8Ak/present" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"><Terminal className="w-3 h-3" /> Our Intro Deck</a></li>
                            <li><a href="https://github.com/ucEzette/reflex" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"><Github className="w-3 h-3" /> GitHub Org</a></li>
                            <li><Link href="/widget-demo" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"><Activity className="w-3 h-3" /> Widget Demo</Link></li>
                            <li><Link href="/docs#contracts" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"><Globe className="w-3 h-3" /> API Reference</Link></li>
                            <li><Link href="/docs#security" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"><Shield className="w-3 h-3" /> Bug Bounty</Link></li>
                            <li><a href="mailto:sneppsezette@gmail.com" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"><Activity className="w-3 h-3" /> Report Issue</a></li>
                        </ul>
                    </div>

                    <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-primary/20 transition-all">
                        <div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">TVL Protected</span>
                            <p className="text-3xl font-black text-white mt-1">
                                {mounted ? (
                                    (() => {
                                        const assets = Number(formatUnits(totalAssets || BigInt(0), 6));
                                        if (assets >= 1_000_000) return `$${(assets / 1_000_000).toFixed(1)}M+`;
                                        if (assets >= 1_000) return `$${(assets / 1_000).toFixed(1)}K+`;
                                        return `$${assets.toLocaleString()}`;
                                    })()
                                ) : (
                                    "$0"
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <p>© 2026 Reflex Protocol. All rights reserved.</p>
                        <p className="text-[8px] opacity-40 font-mono tracking-tight">Autonomous Agent Monitoring via Tether WDK • Active</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-white transition-colors text-[9px]">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors text-[9px]">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors text-[9px]">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
