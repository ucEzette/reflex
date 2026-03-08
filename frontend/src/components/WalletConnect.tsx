"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { avalancheFuji } from "wagmi/chains";
import { toast } from "sonner";
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

const TARGET_CHAIN_ID = avalancheFuji.id;
const TARGET_CHAIN_NAME = "Avalanche Fuji";

export function WalletConnect() {
    const { address, isConnected, chainId, connector } = useAccount();
    const { connectors, connect, connectAsync, error: connectError } = useConnect();
    const { switchChain, switchChainAsync } = useSwitchChain();
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

    useEffect(() => {
        if (connectError) {
            toast.error(connectError.message || "Failed to connect wallet.");
        }
    }, [connectError]);

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
                <div className="absolute right-0 mt-2 w-56 bg-surface-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 z-50">
                    <div className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">
                        Smart Login (Gasless)
                    </div>
                    <div className="px-2 pb-2 border-b border-white/5 mb-2">
                        <ConnectButton
                            client={client}
                            theme={"dark"}
                            connectButton={{
                                className: "!w-full !bg-primary !text-white !rounded-lg !py-2 !h-auto !text-xs !font-bold hover:!opacity-90 transition-all",
                                label: "Email / Social / Gasless"
                            }}
                        />
                    </div>
                    <div className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">
                        External Wallets
                    </div>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            onClick={async () => {
                                toast.info(`Attempting to mount ${connector.name}...`);
                                try {
                                    await connectAsync({ connector, chainId: avalancheFuji.id });
                                    toast.success(`Successfully connected to ${connector.name}!`);
                                } catch (error: any) {
                                    console.error("Connection error:", error);
                                    toast.error(String(error?.message || error) || "Wallet connection failed");
                                }
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 text-foreground hover:text-foreground transition-colors flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary/70">
                                {connector.name.toLowerCase().includes('walletconnect') ? 'qr_code' :
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
