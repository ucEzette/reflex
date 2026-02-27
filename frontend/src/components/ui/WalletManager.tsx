"use client";

import React, { useEffect } from 'react';
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';
import { Wallet, ExternalLink, Download, ArrowUpRight, Copy, ShieldCheck, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { ERC20_ABI } from '@/lib/contracts';
import { CONTRACTS } from '@/lib/wagmiConfig';

export function WalletManager() {
    const { authenticated, exportWallet } = usePrivy();
    const { wallets } = useWallets();
    const { createWallet } = useCreateWallet();
    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const { data: balanceData, refetch } = useReadContract({
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: embeddedWallet ? [embeddedWallet.address as `0x${string}`] : undefined,
        query: {
            enabled: !!embeddedWallet,
        }
    });

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Successfully deposited 10,000 test USDC!");
            refetch();
        }
    }, [isConfirmed, refetch]);

    const handleDeposit = () => {
        if (!embeddedWallet) return;
        toast.info("Minting 10,000 MOCK USDC...");
        writeContract({
            address: CONTRACTS.USDC,
            abi: ERC20_ABI,
            functionName: 'mint',
            args: [embeddedWallet.address as `0x${string}`, parseUnits('10000', 6)],
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied to clipboard");
    };

    if (!authenticated) return null;

    if (!embeddedWallet) {
        return (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                    <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Enterprise Wallet Infrastructure</h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
                    Provision a secure, non-custodial embedded wallet tied to your session to enable gasless micro-insurance policies and instant auto-payouts.
                </p>
                <button
                    onClick={createWallet}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <ShieldCheck className="w-4 h-4" />
                    Provision Abstracted Wallet
                </button>
            </div>
        );
    }

    const displayBalance = balanceData ? Number(formatUnits(balanceData, 6)) : 0;

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
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayBalance)}
                    <span className="text-sm font-medium text-muted-foreground uppercase">usdc</span>
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    Available balance on Avalanche Fuji
                    {(isPending || isConfirming) && <RefreshCcw className="w-3 h-3 animate-spin text-primary" />}
                </p>
            </div>

            {/* Wallet Info & Actions */}
            <div className="p-6 space-y-6">
                {/* Address Row */}
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl border border-border group">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Your Address</span>
                        <span className="text-sm font-mono text-foreground tracking-tight opacity-70">
                            {embeddedWallet.address.slice(0, 10)}...{embeddedWallet.address.slice(-10)}
                        </span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(embeddedWallet.address)}
                        className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all shadow-none group-hover:shadow-sm shrink-0"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* Primary Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleDeposit}
                        disabled={isPending || isConfirming}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending || isConfirming ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                        {isPending || isConfirming ? 'Depositing...' : 'Deposit'}
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
