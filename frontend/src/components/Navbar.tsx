"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useChainId } from "wagmi";
import { arbitrumSepolia } from "viem/chains";
import { CONTRACTS } from "@/lib/contracts";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/market", label: "Markets" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/invest", label: "Invest" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const { data: usdtBalance } = useBalance({
    address: address,
    token: CONTRACTS.USDT,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-switch to Arbitrum Sepolia
  useEffect(() => {
    if (isConnected && chainId && chainId !== arbitrumSepolia.id) {
      const timer = setTimeout(() => {
        try {
          toast.warning("Please switch to Arbitrum Sepolia", {
            description: "Reflex requires this network for parametric settlements.",
          });
          if (switchChain) switchChain({ chainId: arbitrumSepolia.id });
        } catch (err) {
          console.error("Auto-switch chain failed:", err);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, chainId, switchChain]);

  // Click outside handlers
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setIsWalletOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => {
    if (href === "/market") return pathname?.startsWith("/market");
    if (href === "/dashboard") return pathname?.startsWith("/dashboard") || pathname?.startsWith("/claims");
    return pathname?.startsWith(href);
  };

  const formattedBalance = usdtBalance
    ? (Number(usdtBalance.value) / 1e6).toFixed(2)
    : "0.00";

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-8 h-16 bg-[#131318]/70 backdrop-blur-xl z-50">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logoW.png" alt="Reflex Logo" className="h-8 w-auto object-contain" />
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-tight transition-colors ${
                isActive(link.href)
                  ? "text-[#FFB3B5] border-b-2 border-[#800020] pb-1"
                  : "text-[#E4E1E9] hover:text-[#FFB3B5]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Theme + Balance + Wallet */}
      <div className="flex items-center gap-4">
        {/* USDT Balance Pill */}
        {isConnected && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Wallet</span>
            <span className="text-sm font-mono text-[#E4E1E9]">{formattedBalance} USDT</span>
          </div>
        )}

        {/* Connect / Profile Button */}
        {isConnected && address ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full ghost-border hover:bg-surface-bright transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-mono text-[#E4E1E9]">
                {address.slice(0, 4)}...{address.slice(-4)}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-high rounded-xl ghost-border shadow-2xl overflow-hidden py-2 z-50 animate-slide-up">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-bright transition-colors text-sm" onClick={() => setIsProfileOpen(false)}>
                  <span className="material-symbols-outlined text-sm text-zinc-400">person</span>
                  My Profile
                </Link>
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-bright transition-colors text-sm" onClick={() => setIsProfileOpen(false)}>
                  <span className="material-symbols-outlined text-sm text-zinc-400">admin_panel_settings</span>
                  Admin Panel
                </Link>
                <Link href="/docs" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-bright transition-colors text-sm" onClick={() => setIsProfileOpen(false)}>
                  <span className="material-symbols-outlined text-sm text-zinc-400">description</span>
                  Documentation
                </Link>
                <div className="border-t border-white/5 mt-2 pt-2">
                  <button
                    onClick={() => { disconnect(); setIsProfileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-bright transition-colors text-sm text-red-400 w-full text-left"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" ref={walletRef}>
            <button
              onClick={() => setIsWalletOpen(!isWalletOpen)}
              className="bg-[#800020] text-[#E4E1E9] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#800020]/80 transition-all active:scale-95"
            >
              Connect Wallet
            </button>

            {isWalletOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-high rounded-xl ghost-border shadow-2xl overflow-hidden py-4 z-50 animate-slide-up">
                <div className="px-5 py-2 institutional-label border-b border-white/5 mb-2">
                  Select Provider
                </div>
                <div className="space-y-1 px-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        setIsWalletOpen(false);
                        try {
                          connect({ connector }, {
                            onError: (error) => {
                              if (error.message.includes("rejected")) {
                                toast.error("Connection rejected by user");
                              } else {
                                toast.error(`Connection failed: ${error.message}`);
                              }
                            },
                            onSuccess: () => toast.success(`Connected with ${connector.name}`),
                          });
                        } catch (err) {
                          toast.error("Failed to initiate connection");
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-bright transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{connector.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 px-5 py-3 bg-surface-container-lowest text-[10px] text-zinc-500 font-mono">
                  Wagmi connection for parametric execution.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 hover:bg-surface-container-high rounded-full transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-[#E4E1E9]">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#131318]/95 backdrop-blur-xl border-t border-white/5 py-6 px-8 md:hidden z-50 animate-slide-up">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium py-2 transition-colors ${
                  isActive(link.href) ? "text-[#FFB3B5]" : "text-[#E4E1E9] hover:text-[#FFB3B5]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {!isConnected && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Balance</p>
              <p className="font-mono text-sm text-zinc-400">{formattedBalance} USDT</p>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
