"use client";

import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { avalancheFuji } from "wagmi/chains";
import { toast } from "sonner";
import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/thirdweb";
import { createWallet } from "thirdweb/wallets";

const TARGET_CHAIN_ID = avalancheFuji.id;
const TARGET_CHAIN_NAME = "Avalanche Fuji";

// FIXED: Removed "injected" and added "walletConnect" for universal EVM access
const WALLETS = [
    createWallet("app.core.extension"),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("walletConnect"), 
];

export function WalletConnect() {
    const { address, isConnected, chainId, connector } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prompt user to switch to Fuji testnet if they are connected to another network
    useEffect(() => {
        const performSwitch = async () => {
            if (isConnected && chainId !== TARGET_CHAIN_ID && switchChainAsync && !isSwitching) {
                setIsSwitching(true);
                toast.warning(`Please switch to ${TARGET_CHAIN_NAME}`, {
                    description: "Reflex requires this network for parametric settlements.",
                    duration: 5000,
                });
                try {
                    await switchChainAsync({ chainId: TARGET_CHAIN_ID });
                    toast.success(`Switched to ${TARGET_CHAIN_NAME}`);
                } catch (e: any) {
                    console.error("Switch chain error:", e);
                    toast.error("Network Switch Failed", {
                        description: `Please manually switch your wallet to ${TARGET_CHAIN_NAME}.`,
                    });
                } finally {
                    setIsSwitching(false);
                }
            }
        };
        performSwitch();
    }, [isConnected, chainId, switchChainAsync, isSwitching]);

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
                            if (connector) {
                                disconnect({ connector });
                            } else {
                                disconnect();
                            }
                        }}
                        className="dexter-btn !min-w-[124px] !min-h-[36px] !px-3 !py-1.5" type="button"
                    >
                        <span className="dexter-btn-drawer dexter-transition-top flex items-center justify-center gap-1.5 !text-[9px] w-full left-0 right-0">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            FUJI TESTNET
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
                    <div className="px-5 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 mb-4">
                        Reflex Gateway
                    </div>
                    <div className="px-4">
                        <ConnectButton
                            client={client}
                            theme={"dark"}
                            wallets={WALLETS}
                            appMetadata={{
                                name: "Reflex",
                                url: "https://reflex.finance",
                            }}
                            connectButton={{
                                className: "!w-full !bg-primary !text-white !rounded-lg !py-3 !h-auto !text-xs !font-black !uppercase !tracking-widest hover:!opacity-90 transition-all shadow-[0_4px_20px_rgba(128,0,32,0.3)]",
                                label: "Enter Reflex App"
                            }}
                        />
                    </div>
                    <div className="mt-4 px-5 py-3 bg-black/20 text-[10px] text-zinc-500 leading-relaxed">
                        Connecting via Thirdweb enables <span className="text-emerald-400 font-bold">gasless</span> parametric insurance purchases.
                    </div>
                </div>
            )}
        </div>
    );
}