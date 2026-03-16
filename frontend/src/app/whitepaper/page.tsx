"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft, Download, Printer } from "lucide-react";

export default function WhitepaperPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0E14] py-12 px-4 sm:px-6 lg:px-8 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 overflow-y-auto pt-24 pb-24 transition-colors duration-700">
      {/* Navigation and Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-10 flex items-center justify-between print:hidden animate-fade-in-up">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <div className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors">
            <MoveLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight uppercase">Return to Site</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 border-2 border-slate-900 dark:border-white shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <Printer className="w-4 h-4" />
            <span className="uppercase tracking-tighter">Download as PDF</span>
          </button>
        </div>
      </div>

      {/* The Whitepaper Document */}
      <article className="max-w-[850px] mx-auto bg-white shadow-[0_25px_80px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden print:shadow-none print:rounded-none relative z-10 transition-shadow duration-500 hover:shadow-[0_35px_100px_rgba(0,0,0,0.2)]">
        
        {/* Document Header */}
        <div className="border-b-[4px] border-slate-900 px-16 pt-24 pb-16 flex flex-col items-center text-center">
          <div className="mb-10 text-slate-900">
             <Image 
                src="/logoD.png" 
                alt="Reflex Logo" 
                width={160} 
                height={50} 
                className="opacity-100 grayscale brightness-0 select-none pointer-events-none"
                priority
             />
          </div>
          <h1 className="text-[3.25rem] leading-[1.05] font-black text-slate-900 mb-6 tracking-tighter font-sans uppercase">
            Reflex Protocol: <br/>
            <span className="text-slate-600">Decentralized Parametric Market</span>
          </h1>
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-[0.25em] text-[0.65rem]">
             <span className="bg-slate-100 py-1 px-4 rounded-full text-slate-500">Official Whitepaper</span>
             <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
             <span>v2.1 — March 2026</span>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-16 py-20 text-slate-800 font-serif leading-[1.8] text-base space-y-16 antialiased">
            
            {/* Section 1 */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">1. Executive Summary</h2>
                <div className="space-y-6">
                    <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-slate-900">
                        Legacy insurance systems are fundamentally limited by subjective claims assessments, delayed payout cycles, and massive amounts of idle capital. <strong className="font-bold text-slate-900">Reflex</strong> is an institutional-grade, decentralized parametric risk marketplace engineered on the Avalanche network.
                    </p>
                    <p>
                        By integrating Chainlink Data Feeds with Chainlink Automation, Reflex operates a zero-touch execution engine that instantly settles stablecoin (USDC) payouts when specific real-world conditions are met. Eliminating the need for a volatile native protocol token, Reflex utilizes a proprietary "Dual-Yield" architecture. This model routes un-deployed liquidity into blue-chip DeFi protocols (starting with Aave v3) to maximize returns for risk underwriters while providing mathematically guaranteed solvency for policyholders.
                    </p>
                </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">2. Introduction</h2>
                <p>
                    Traditional insurance relies on a centralized trust model that introduces friction and misalignment at every stage of the lifecycle. When policyholders need assistance the most, they are forced to navigate opaque claims adjusters, survive weeks of administrative delay, and bear the systemic risk of underwriter insolvency. 
                </p>
                <p>
                    Decentralized infrastructure offers a superior paradigm: <strong className="font-bold italic text-slate-900">deterministic execution</strong>. By migrating risk agreements to immutable smart contracts, Reflex replaces corporate promises with rigorous mathematics, ensuring that if a risk event occurs, the payout is an algorithmic certainty.
                </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">3. Problem Statement</h2>
                <p>The current insurance landscape is plagued by four primary structural failures:</p>
                <ul className="space-y-6 list-none pl-4 border-l-2 border-slate-100">
                    <li className="relative pl-6">
                      <span className="absolute left-0 top-2 w-2 h-2 bg-slate-900 rounded-full" />
                      <strong className="font-sans font-bold text-slate-900 block uppercase tracking-tight text-sm mb-1">Idle Capital Stagnation</strong>
                      Traditional premiums are held in low-yield treasuries, creating massive capital inefficiency for underwriters and higher costs for users.
                    </li>
                    <li className="relative pl-6">
                      <span className="absolute left-0 top-2 w-2 h-2 bg-slate-900 rounded-full" />
                      <strong className="font-sans font-bold text-slate-900 block uppercase tracking-tight text-sm mb-1">Subjective Settlement Friction</strong>
                      Human intervention in claims assessment introduces bias, administrative bloat, and the risk of systemic payout denial.
                    </li>
                    <li className="relative pl-6">
                      <span className="absolute left-0 top-2 w-2 h-2 bg-slate-900 rounded-full" />
                      <strong className="font-sans font-bold text-slate-900 block uppercase tracking-tight text-sm mb-1">Information Asymmetry</strong>
                      Policyholders have zero visibility into the underwriter's actual liquidity, float, or real-time solvency ratio.
                    </li>
                    <li className="relative pl-6">
                      <span className="absolute left-0 top-2 w-2 h-2 bg-slate-900 rounded-full" />
                      <strong className="font-sans font-bold text-slate-900 block uppercase tracking-tight text-sm mb-1">Distribution Walled Gardens</strong>
                      Traditional insurance products are siloed and cannot be easily integrated into digital checkout flows without manual B2B friction.
                    </li>
                </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">4. Proposed Solution</h2>
                <p>Reflex replaces the traditional insurance carrier with a decentralized matching and execution engine.</p>
                <div className="grid grid-cols-1 gap-8 mt-6 font-sans">
                  <div className="p-8 bg-slate-50 rounded-sm border-l-4 border-slate-900">
                    <h3 className="font-black text-slate-900 mb-3 uppercase tracking-tighter">Zero-Touch Parametric Payouts</h3>
                    <p className="text-sm leading-relaxed text-slate-600">Policies are defined by code, not paper. Payouts are triggered instantly by verifiable off-chain data (e.g., flight status, weather metrics) via decentralized oracles.</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-sm border-l-4 border-slate-900">
                    <h3 className="font-black text-slate-900 mb-3 uppercase tracking-tighter">Dual-Yield Architecture</h3>
                    <p className="text-sm leading-relaxed text-slate-600">Reflex solves the "dead capital" problem by routing unutilized USDC from risk pools directly into Aave v3, allowing capital to earn passive yield before and during its time as a risk reserve.</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-sm border-l-4 border-slate-900">
                    <h3 className="font-black text-slate-900 mb-3 uppercase tracking-tighter">API-First "Invisible" Distribution</h3>
                    <p className="text-sm leading-relaxed text-slate-600">Designed as a B2B "Trojan Horse," Reflex allows Web2 platforms to integrate comprehensive protection directly via a simple SDK, abstracting away the blockchain complexity.</p>
                  </div>
                </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-8">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">5. Technical Architecture</h2>
                <div className="space-y-10">
                  <div className="group">
                    <h4 className="font-black font-sans text-slate-900 mb-2 uppercase tracking-tight text-lg">5.1 Execution Layer: Avalanche</h4>
                    <p className="text-slate-700">Built on the Avalanche C-Chain for high-throughput, low-fee EVM finality. This ensures that the protocol can handle thousands of micro-policies and instant payouts without gas bottlenecks.</p>
                  </div>
                  <div className="group">
                    <h4 className="font-black font-sans text-slate-900 mb-2 uppercase tracking-tight text-lg">5.2 Segmented Risk Vaults</h4>
                    <p className="text-slate-700">Liquidity is compartmentalized in sector-specific USDC vaults (Travel, Agriculture, Energy). This "Isolation Engine" ensures that catastrophic events in one sector do not impact the solvency of others, providing superior risk management for institutional underwriters.</p>
                  </div>
                  <div className="group">
                    <h4 className="font-black font-sans text-slate-900 mb-2 uppercase tracking-tight text-lg">5.3 Oracle Layer: Chainlink Triple-Threat</h4>
                    <p className="text-slate-700">Utilizing Chainlink Functions for reliable data ingestion and Chainlink Automation for decentralized "cron jobs" to trigger payouts the exact second a threshold is crossed.</p>
                  </div>
                </div>
            </section>

            {/* Section 7 - Roadmap */}
            <section className="space-y-8">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">7. Enterprise Roadmap (Phase 2-4)</h2>
                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 border border-slate-200">
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3">Modular SDK Architecture</h4>
                        <p className="text-sm text-slate-600">The Reflex Enterprise SDK allows partners to embed parametric protection toggles with full theme customization, supporting Light, Dark, and Glassmorphism aesthetics to match any existing checkout flow.</p>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-200">
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-3">Real-Time Risk Simulation</h4>
                        <p className="text-sm text-slate-600">Reflex integrates a proprietary "Solvency Stress Test" engine, allowing LPs to simulate catastrophic tail-risks (e.g. Category 5 Hurricanes) and witness real-time liability adjustments on-chain.</p>
                    </div>
                </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-8">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">6. Protocol Economics</h2>
                <p>Reflex operates entirely on USDC, intentionally avoiding the volatility risk associated with native protocol tokens.</p>
                <div className="bg-slate-950 text-white p-12 rounded-sm font-sans relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 relative z-10">
                      <div>
                        <span className="text-[0.65rem] text-slate-500 uppercase font-black tracking-[0.3em] block mb-2">Origination Fee</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black tracking-tighter">2.5 — 5.0</span>
                          <span className="text-xl font-bold text-slate-400">%</span>
                        </div>
                        <p className="text-[0.7rem] mt-3 text-slate-500 font-bold uppercase tracking-tight">Per Policy Premium</p>
                      </div>
                      <div>
                        <span className="text-[0.65rem] text-slate-500 uppercase font-black tracking-[0.3em] block mb-2">Performance Fee</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black tracking-tighter">10</span>
                          <span className="text-xl font-bold text-slate-400">%</span>
                        </div>
                        <p className="text-[0.7rem] mt-3 text-slate-500 font-bold uppercase tracking-tight">On Earned DeFi Interest</p>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[0.8rem] italic text-slate-500 font-sans tracking-tight">
                  <div className="p-4 border border-slate-100 rounded-sm">
                    LPs retain 90% of the interest generated by routing idle pool capital to Aave.
                  </div>
                  <div className="p-4 border border-slate-100 rounded-sm">
                    LPs retain 100% of premium spreads while bearing strictly defined financial risk.
                  </div>
                </div>
            </section>

             {/* Use Cases */}
             <section className="space-y-8">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">8. High-Impact Use Cases</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
                  <div className="flex flex-col gap-4">
                    <span className="text-slate-300 font-black text-4xl">01</span>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Aviation Delay</h4>
                    <p className="text-[0.8rem] leading-relaxed text-slate-500">Instant USDC payouts for delays exceeding 2 hours, triggered by global tracking APIs.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-slate-300 font-black text-4xl">02</span>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Para-Agriculture</h4>
                    <p className="text-[0.8rem] leading-relaxed text-slate-500">Drought protection for smallholder farmers, triggered by satellite soil and rainfall data.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-slate-300 font-black text-4xl">03</span>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Energy Stability</h4>
                    <p className="text-[0.8rem] leading-relaxed text-slate-500">Industrial payouts for grid failures or temperature spikes affecting production.</p>
                  </div>
                </div>
            </section>

            {/* Security */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">10. Security & Capital Safety</h2>
                <p>Protocol integrity is enforced through three core cryptographic layers:</p>
                <div className="space-y-6 font-sans">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-black italic">!</div>
                    <div>
                      <h5 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Enforced Solvency</h5>
                      <p className="text-xs text-slate-500 mt-1">Dynamic capital caps prevent underwriting that exceeds 100% of locked liquidity reserves.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-black italic">S</div>
                    <div>
                      <h5 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Stateful Hardening</h5>
                      <p className="text-xs text-slate-500 mt-1">Core logic verified via 640,000+ stateful invariant tests to mitigate catastrophic tail risks.</p>
                    </div>
                  </div>
                </div>
            </section>

            {/* Team */}
            <section className="space-y-6">
                <h2 className="text-2xl font-black font-sans text-slate-900 uppercase tracking-tighter border-b-2 border-slate-100 pb-2">11. Management & Systems</h2>
                <div className="p-8 border-2 border-slate-900 font-sans relative group">
                  <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 text-[0.6rem] font-black uppercase tracking-[0.2em] -translate-y-full">Core Architect</div>
                  <h4 className="font-black text-2xl text-slate-900 uppercase tracking-tighter mb-2 underline decoration-4 decoration-slate-200 underline-offset-8">Uche Ezette</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    DeFi Engineer and Systems Builder with an extensive background in high-frequency Web3 protocols. Uche specializes in constructing hardened decentralised infrastructure for trustless financial markets.
                  </p>
                </div>
            </section>

            {/* Footer */}
            <div className="pt-16 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-[0.65rem] text-slate-400 font-sans font-bold uppercase tracking-[0.2em]">
               <div>© 2026 Reflex Protocol</div>
               <div className="text-slate-300">Scaling the Trustless Safety Net</div>
            </div>
        </div>

        {/* Dynamic Watermark Header */}
        <div className="absolute top-0 right-0 opacity-[0.03] select-none pointer-events-none transform -translate-y-1/4 translate-x-1/4">
          <Image src="/logoD.png" alt="" width={800} height={200} />
        </div>
      </article>

      {/* Footer Branding - Hidden on Print */}
      <div className="mt-20 text-center print:hidden border-t border-slate-200 dark:border-slate-800 pt-16 animate-fade-in pb-12">
          <div className="inline-flex items-center gap-2 mb-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-help">
             <Image src="/logoW.png" alt="Reflex Logo" width={100} height={32} className="dark:opacity-100 opacity-0" />
             <Image src="/logoD.png" alt="Reflex Logo" width={100} height={32} className="dark:opacity-0 opacity-100 dark:hidden" />
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-[0.6rem] tracking-[0.4em] uppercase font-black">Powered by Avalanche & Chainlink</p>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          article {
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
           /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none;
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        /* Serif font for body text to give it that academic whitepaper feel */
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-serif {
          font-family: 'Crimson Pro', serif;
        }
      `}</style>
    </div>
  );
}
