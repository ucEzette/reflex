"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Globe, Shield, Terminal, Activity } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-background border-t border-border mt-20">
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
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            The internet of value needs a safety net. Reflex provides hyper-efficient, parametric coverage for the most volatile real-world risks.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://x.com/ReflexProtocol" target="_blank" rel="noopener noreferrer" className="p-2 bg-accent/50 rounded-lg hover:text-primary transition-colors border border-border">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://github.com/ucEzette/reflex" target="_blank" rel="noopener noreferrer" className="p-2 bg-accent/50 rounded-lg hover:text-primary transition-colors border border-border">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="/analytics" className="p-2 bg-accent/50 rounded-lg hover:text-primary transition-colors border border-border">
                                <Activity className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Protocol */}
                    <div>
                        <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-muted-foreground">Protocol</h4>
                        <ul className="space-y-4">
                            <li><Link href="/market" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Markets Explorer</Link></li>
                            <li><Link href="/invest" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Liquidity Pools</Link></li>
                            <li><Link href="/docs#oracle-flow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Transparency Feed</Link></li>
                            <li><Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Risk Analytics</Link></li>
                        </ul>
                    </div>

                    {/* Developers */}
                    <div>
                        <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-muted-foreground">Developers</h4>
                        <ul className="space-y-4">
                            <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><Terminal className="w-3 h-3" /> Documentation</Link></li>
                            <li><a href="https://github.com/ucEzette/reflex" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><Github className="w-3 h-3" /> GitHub Org</a></li>
                            <li><Link href="/docs#contracts" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><Globe className="w-3 h-3" /> API Reference</Link></li>
                            <li><Link href="/docs#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><Shield className="w-3 h-3" /> Bug Bounty</Link></li>
                            <li><a href="mailto:support@reflex.finance" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-bold"><Activity className="w-3 h-3" /> Report Issue</a></li>
                        </ul>
                    </div>

                    {/* Stats / Status */}
                    <div className="p-6 bg-accent/30 rounded-2xl border border-border flex flex-col justify-between">
                        <div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">TVL Protected</span>
                            <p className="text-2xl font-bold text-foreground">$12.4M+</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <p>© 2026 Reflex Protocol. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
