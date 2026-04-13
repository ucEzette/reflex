"use client";

import React from 'react';
import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useBalance } from "wagmi";
import { Copy, ExternalLink, LogOut, Wallet, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";

/**
 * Integrated Authentication and Funding HUD for Privy + Safe.
 */
export function PrivyAuth() {
    const { login, logout, authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const { client } = useSmartWallets();
    const { fundWallet } = useFundWallet();
    
    // The Safe smart account address
    const smartAccountAddress = client?.account?.address;
    
    // USDC Balance of the Smart Wallet (Arbitrum Sepolia)
    const { data: balance, isLoading: balanceLoading } = useBalance({
        address: smartAccountAddress,
        token: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
        chainId: 421614, // Arbitrum Sepolia
        query: { enabled: !!smartAccountAddress },
    });

    const copyAddress = () => {
        if (smartAccountAddress) {
            navigator.clipboard.writeText(smartAccountAddress);
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
            {/* Safe HUD */}
            <div className="flex flex-col items-end gap-1.5 p-3 px-4 bg-[#0A0A0A]/80 border border-white/5 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Smart Account (Safe)</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono font-bold text-zinc-400">
                                {smartAccountAddress?.slice(0, 6)}...{smartAccountAddress?.slice(-4)}
                            </span>
                            <button onClick={copyAddress} className="text-zinc-600 hover:text-white transition-colors">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 mx-1" />
                    <div className="flex flex-col items-start min-w-[80px]">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Gasless Enabled
                        </span>
                        <div className="text-[14px] font-black text-white italic tracking-tighter mt-1">
                             {balanceLoading ? "..." : balance ? `${Number(formatUnits(balance.value, balance.decimals)).toFixed(2)}` : "0.00"} 
                             <span className="text-[8px] text-zinc-500 ml-1 not-italic font-black">USDC</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fund Wallet Trigger */}
            <button
                onClick={() => smartAccountAddress && fundWallet(smartAccountAddress)}
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
