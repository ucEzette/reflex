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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/market") return pathname?.startsWith("/market");
    if (href === "/dashboard") return pathname?.startsWith("/dashboard") || pathname?.startsWith("/claims");
    return pathname?.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <nav className={`fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-10 h-[72px] z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]" 
        : "bg-transparent"
    }`}>
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logoD.png" alt="Reflex" className="h-10 w-auto object-contain" />
        </Link>
        <div className="hidden lg:flex gap-8 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] font-medium transition-all duration-300 relative py-2 ${
                isActive(link.href)
                  ? "text-[#FF6B00]"
                  : "text-[#71717A] hover:text-[#1A1A1A]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <div className="absolute -bottom-0 left-0 w-full h-[2px] bg-[#FF6B00] rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: CTA + Auth */}
      <div className="flex items-center gap-3">
        <Link
          href="/market"
          className="hidden sm:flex items-center gap-2 bg-[#FF6B00] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-[#E55E00] transition-all shadow-orange-sm hover:shadow-orange-md"
        >
          Launch App
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-45">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <PrivyAuth />

        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-xl transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5 text-[#1A1A1A]" /> : <Menu className="w-5 h-5 text-[#1A1A1A]" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white/95 backdrop-blur-xl border-b border-black/5 py-6 px-6 lg:hidden z-50 animate-slide-up">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-[14px] font-medium py-2 px-3 rounded-xl transition-all ${
                  isActive(link.href) ? "text-[#FF6B00] bg-orange-50" : "text-[#71717A] hover:text-[#1A1A1A] hover:bg-cream-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/market"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-5 py-3 rounded-xl text-[14px] font-semibold mt-2"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
