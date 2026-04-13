"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#131318] border-t border-outline-variant/10">
      <div className="w-full max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <img src="/logoW.png" alt="Reflex Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Redefining institutional risk management through parametric on-chain execution.
            </p>
          </div>

          {/* Product */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 block">
              Product
            </span>
            <ul className="space-y-4">
              <li>
                <Link href="/market" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/invest" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Staking
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 block">
              Resources
            </span>
            <ul className="space-y-4">
              <li>
                <Link href="/whitepaper" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="https://sepolia.arbiscan.io" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Security Audit
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 block">
              Social
            </span>
            <ul className="space-y-4">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Twitter (X)
                </a>
              </li>
              <li>
                <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-[#FFB3B5] transition-colors">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-600">
              © 2024 Reflex Protocol. Built on Arbitrum.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Operational</span>
            </div>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-600 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-600 hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
