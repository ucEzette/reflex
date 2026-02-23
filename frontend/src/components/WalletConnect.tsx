"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

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
        <button
            onClick={() => connect({ connector: injected() })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(231,64,67,0.3)]"
        >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            Connect Wallet
        </button>
    );
}
