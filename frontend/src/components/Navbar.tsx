"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PrivyAuth } from "./auth/PrivyAuth";

const NAV_LINKS = [
  { href: "/market", label: "Markets" },
  { href: "/dashboard", label: "Portfolio" },
  { href: "/invest", label: "Invest" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/market") return pathname?.startsWith("/market");
    if (href === "/dashboard") return pathname?.startsWith("/dashboard") || pathname?.startsWith("/claims");
    return pathname?.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-10 h-20 bg-[#0A0A0A]/80 backdrop-blur-2xl z-50 border-b border-white/5">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-16">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logoD.png" alt="Reflex Logo" className="h-16 w-auto object-contain" />
        </Link>
        <div className="hidden lg:flex gap-10 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative group py-2 ${
                isActive(link.href)
                  ? "text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D31027] shadow-[0_0_10px_#D31027]" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Privy Authentication HUD */}
      <div className="flex items-center gap-4">
        <PrivyAuth />

        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 py-8 px-10 lg:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] py-2 transition-all ${
                  isActive(link.href) ? "text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
