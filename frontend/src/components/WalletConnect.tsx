"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { avalancheFuji } from "wagmi/chains";
import { toast } from "sonner";

export function WalletConnect() {
    const { address, isConnected, chainId } = useAccount();
    const { connectors, connect, connectAsync, error: connectError } = useConnect();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                        onClick={() => disconnect()}
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
                    onClick={async () => {
                        if (connectors.length > 0) {
                            toast.info(`Attempting to mount Core Wallet...`);
                            try {
                                await connectAsync({ connector: connectors[0], chainId: avalancheFuji.id });
                                toast.success(`Successfully connected!`);
                            } catch (error: any) {
                                console.error("Connection error:", error);
                                toast.error(String(error?.message || error) || "Wallet connection failed");
                            }
                        } else {
                            toast.error("Core Wallet extension not found. Please install it.");
                        }
                    }}
                    className="dexter-btn !min-w-[136px] !min-h-[36px] !px-3 !py-1.5" type="button"
                >
                    <span className="dexter-btn-drawer dexter-transition-top !text-[9px]">AVALANCHE</span>
                    <span className="dexter-btn-text flex items-center justify-center gap-1.5 !text-xs w-full"><span className="material-symbols-outlined text-[16px]">token</span> Connect Core</span>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <svg className="dexter-btn-corner !w-[24px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                    <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[9px]">secure</span>
                </button>
            </div>
        </div>
    );
}
