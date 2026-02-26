"use client";

import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Wallet, ExternalLink, Download, ArrowUpRight, Copy, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function WalletManager() {
    const { authenticated, exportWallet } = usePrivy();
    const { wallets } = useWallets();
    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied to clipboard");
    };

    if (!authenticated || !embeddedWallet) return null;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header / Balance Section */}
            <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Embedded Wallet</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        SECURE
                    </div>
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-1 flex items-baseline gap-2">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(12450.50)}
                    <span className="text-sm font-medium text-muted-foreground uppercase">usdc</span>
                </h3>
                <p className="text-xs text-muted-foreground">Available balance on Avalanche Fuji</p>
            </div>

            {/* Wallet Info & Actions */}
            <div className="p-6 space-y-6">
                {/* Address Row */}
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl border border-border group">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Your Address</span>
                        <span className="text-sm font-mono text-foreground tracking-tight">
                            {embeddedWallet.address.slice(0, 10)}...{embeddedWallet.address.slice(-10)}
                        </span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(embeddedWallet.address)}
                        className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all shadow-none group-hover:shadow-sm"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* Primary Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        <ArrowUpRight className="w-4 h-4" />
                        Deposit
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-accent border border-border text-foreground py-3 rounded-xl font-bold text-sm hover:bg-accent/80 transition-all">
                        <Download className="w-4 h-4" />
                        Withdraw
                    </button>
                </div>

                {/* Security / Advanced Options */}
                <div className="pt-4 border-t border-border">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Security & Advanced</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => exportWallet()}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/5 hover:text-red-500 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Export Private Key</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <a
                            href={`https://testnet.snowtrace.io/address/${embeddedWallet.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm font-medium">View on Snowtrace</span>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="px-6 py-4 bg-accent/30 border-t border-border mt-auto">
                <div className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-snug">
                        Your private key is secured by Privy and can be exported at any time. We never have access to your funds.
                    </p>
                </div>
            </div>
        </div>
    );
}
