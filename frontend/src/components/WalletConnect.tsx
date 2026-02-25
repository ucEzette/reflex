"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { avalancheFuji } from "wagmi/chains";

export function WalletConnect() {
    const { address, isConnected, chainId } = useAccount();
    const { connectors, connect } = useConnect();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Prompt user to switch to Fuji testnet if they are connected to another network
    useEffect(() => {
        if (isConnected && chainId !== avalancheFuji.id && switchChain) {
            switchChain({ chainId: avalancheFuji.id });
        }
    }, [isConnected, chainId, switchChain]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Fuji Testnet
                </div>
                <button
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 bg-surface-dark hover:bg-white/5 border border-white/10 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    <span className="font-mono text-xs">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(231,64,67,0.3)]"
            >
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                Connect Wallet
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 z-50">
                    <div className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">
                        Select Wallet Provider
                    </div>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={() => {
                                connect({ connector });
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary/70">
                                {connector.name.toLowerCase().includes('meta') ? 'account_balance_wallet' :
                                    connector.name.toLowerCase().includes('core') ? 'token' :
                                        connector.name.toLowerCase().includes('safe') ? 'security' :
                                            'link'}
                            </span>
                            <span className="text-sm font-medium">{connector.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
