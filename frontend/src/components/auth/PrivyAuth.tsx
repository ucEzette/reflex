"use client";

import React from 'react';
import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useBalance } from "wagmi";
import { Copy, ExternalLink, LogOut, Wallet, CreditCard, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import Link from 'next/link';

/**
 * Integrated Authentication and Funding HUD for Privy + Safe.
 * Includes "Auto-Repair" logic for missing wallets.
 */
export function PrivyAuth() {
    const { login, logout, authenticated, user, connectWallet } = usePrivy();
    const { wallets } = useWallets();
    const { client, createSmartWallet } = useSmartWallets();
    const { fundWallet } = useFundWallet();
    
    // 1. The Safe smart account address
    const smartAccountAddress = client?.account?.address;
    
    // 2. Fallback EOA address (Embedded or External)
    const embeddedWallet = user?.linkedAccounts.find(account => account.type === 'wallet');
    const eoaAddress = (embeddedWallet as any)?.address;

    // 3. Provisioning Watchdog: Automatically trigger vault creation once authenticated
    React.useEffect(() => {
        if (!authenticated) return;

        // If no smart account, but we have an EOA, create the Safe
        if (!client && eoaAddress) {
            console.log("Safe Auth Watchdog: Initializing Safe provisioning...");
            createSmartWallet?.().catch(err => {
                console.warn("Auto-provisioning deferred:", err);
            });
        }
        
        // If logged in but NO wallet at all, we need to create one (should have been auto-created)
        if (!eoaAddress && authenticated) {
            console.log("Safe Auth Watchdog: No owner wallet found. Attempting repair...");
            // In a real app, you might call createWallet() if the SDK supports it without interaction
            // For now, we nudge the user if it's really stuck
        }
    }, [authenticated, client, createSmartWallet, eoaAddress]);

    // USDC Balance of the Smart Wallet (Arbitrum Sepolia)
    const { data: balance, isLoading: balanceLoading } = useBalance({
        address: smartAccountAddress as `0x${string}`,
        token: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
        chainId: 421614, // Arbitrum Sepolia
        query: { enabled: !!smartAccountAddress },
    });

    const copyAddress = (e: React.MouseEvent) => {
        e.preventDefault();
        const addr = smartAccountAddress || eoaAddress;
        if (addr) {
            navigator.clipboard.writeText(addr);
            toast.success("Address copied to clipboard!");
        }
    };

    if (!authenticated) {
        return (
            <button
                onClick={login}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D31027] hover:bg-[#A9081E] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl transition-all group"
            >
                <Wallet className="w-4 h-4 transition-transform group-hover:scale-110" />
                Initialize Vault Access
            </button>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Safe HUD - Click to Profile */}
            <Link 
                href="/dashboard"
                className="flex flex-col items-end gap-1.5 p-3 px-4 bg-[#0A0A0A]/80 border border-white/5 rounded-2xl backdrop-blur-xl hover:bg-white/5 transition-all text-right group/hud"
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none group-hover/hud:text-[#D31027] transition-colors">
                            {smartAccountAddress ? "Smart Account (Safe)" : "Identity Vault"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            {authenticated && !smartAccountAddress ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-500 animate-pulse uppercase tracking-widest">
                                        {eoaAddress ? "Assigning_Safe..." : "Creating_Owner_Secure..."}
                                    </span>
                                    {!eoaAddress && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); login(); }}
                                            className="p-1 px-2 bg-emerald-500/10 text-[8px] text-emerald-500 rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                                        >
                                            REPAIR
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <span className="text-[11px] font-mono font-bold text-zinc-400 group-hover/hud:text-white transition-colors">
                                        {(smartAccountAddress || eoaAddress)?.slice(0, 6)}...{(smartAccountAddress || eoaAddress)?.slice(-4)}
                                    </span>
                                    <button onClick={copyAddress} className="text-zinc-600 hover:text-white transition-colors p-1">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 mx-1" />
                    <div className="flex flex-col items-start min-w-[80px]">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            {smartAccountAddress ? "Gasless Enabled" : "Identity Verified"}
                        </span>
                        <div className="text-[14px] font-black text-white italic tracking-tighter mt-1 group-hover/hud:scale-105 transition-transform origin-left">
                             {balanceLoading ? "..." : balance ? `${Number(formatUnits(balance.value, 6)).toFixed(2)}` : "0.00"} 
                             <span className="text-[8px] text-zinc-500 ml-1 not-italic font-black">USDC</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Fund Wallet Trigger */}
            <button
                onClick={() => (smartAccountAddress || eoaAddress) && fundWallet(smartAccountAddress || eoaAddress)}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group relative"
                title="Purchase USDC with Card (MoonPay/Transak)"
            >
                <CreditCard className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </button>

            {/* Logout Trigger */}
            <button
                onClick={logout}
                className="p-3.5 bg-[#D31027]/10 hover:bg-[#D31027]/20 border border-[#D31027]/20 rounded-2xl transition-all group"
                title="Disconnect Vault"
            >
                <LogOut className="w-4 h-4 text-[#D31027] group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
}
