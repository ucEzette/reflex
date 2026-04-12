import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { arbitrumSepolia } from "viem/chains";

export function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const chainId = useChainId();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prompt user to switch to Arbitrum Sepolia testnet if they are connected to another network
    useEffect(() => {
        if (isConnected && chainId && chainId !== arbitrumSepolia.id) {
            const timer = setTimeout(() => {
                try {
                    toast.warning(`Please switch to Arbitrum Sepolia`, {
                        description: "Reflex requires this network for parametric settlements.",
                    });
                    if (switchChain) {
                        switchChain({ chainId: arbitrumSepolia.id });
                    }
                } catch (err) {
                    console.error("Auto-switch chain failed:", err);
                }
            }, 500);
            return () => clearTimeout(timer);
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

    if (!mounted) return null;

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                <div className="dexter-btn-container w-32 relative z-30">
                    <button
                        onClick={() => {
                            try {
                                disconnect();
                            } catch (err) {
                                console.error("Disconnect failed:", err);
                                toast.error("Failed to disconnect wallet");
                            }
                        }}
                        className="dexter-btn !min-w-[124px] !min-h-[36px] !px-3 !py-1.5" type="button"
                    >
                        <span className="dexter-btn-drawer dexter-transition-top flex items-center justify-center gap-1.5 !text-[9px] w-full left-0 right-0">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            ARB SEPOLIA
                        </span>
                        <span className="dexter-btn-text flex items-center justify-center gap-1.5 !text-xs w-full"><span className="material-symbols-outlined text-[16px]">account_balance_wallet</span> {address.slice(0, 4)}...{address.slice(-4)}</span>
                        <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100">
                            <path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path>
                        </svg>
                        <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100">
                            <path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path>
                        </svg>
                        <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100">
                            <path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path>
                        </svg>
                        <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100">
                            <path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path>
                        </svg>
                        <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[9px]">disconnect</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="dexter-btn-container w-36 relative z-30">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="dexter-btn !min-w-[136px] !min-h-[36px] !px-3 !py-1.5" type="button"
                >
                    <span className="dexter-btn-drawer dexter-transition-top !text-[9px]">WEB3</span>
                    <span className="dexter-btn-text flex items-center justify-center gap-1.5 !text-xs w-full"><span className="material-symbols-outlined text-[16px]">account_balance_wallet</span> Connect Wallet</span>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[9px]">connect</span>
                </button>
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 mb-4">
                        Select Provider
                    </div>
                    <div className="space-y-2 px-3">
                        {connectors.map((connector) => (
                            <button
                                key={connector.id}
                                onClick={() => {
                                    setIsOpen(false);
                                    try {
                                        connect({ connector }, {
                                            onError: (error) => {
                                                console.error("Connection failed:", error);
                                                // Check for "User rejected the request" or "Connector already connected"
                                                if (error.message.includes("rejected") || error.name === "UserRejectedRequestError") {
                                                    toast.error("Connection rejected by user");
                                                } else {
                                                    toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
                                                }
                                            },
                                            onSuccess: () => {
                                                toast.success(`Connected with ${connector.name}`);
                                            }
                                        });
                                    } catch (err) {
                                        console.error("Connect error wrap:", err);
                                        toast.error("Failed to initiate connection process");
                                    }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                            >
                                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-widest">{connector.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 px-5 py-3 bg-black/20 text-[10px] text-zinc-500 leading-relaxed font-mono">
                        Direct Wagmi connection for high-throughput parametric execution.
                    </div>
                </div>
            )}
        </div>
    );
}