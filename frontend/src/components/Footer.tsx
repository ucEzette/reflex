"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <img src="/logoW.png" alt="Reflex Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              Institutional-grade parametric protection, built on-chain for transparent and instant settlements.
            </p>
          </div>

          {/* Product */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-6 block">
              Product
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/market" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/invest" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Staking
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-6 block">
              Resources
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/whitepaper" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="https://sepolia.arbiscan.io" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Security Audit
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-6 block">
              Community
            </span>
            <ul className="space-y-3">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Twitter (X)
                </a>
              </li>
              <li>
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#FF6B00] transition-colors">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-white/30">
              © 2024 Reflex Protocol. Built on Arbitrum.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[11px] font-medium text-white/40">Network Operational</span>
            </div>
            <a href="#" className="text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
