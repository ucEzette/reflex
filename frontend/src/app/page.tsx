"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { PolicyDashboard } from "@/components/PolicyDashboard";
import { ActivePolicies } from "@/components/ActivePolicies";

/* ═══════════════════════════════════════════
   REFLEX L1 — Scrollytelling Landing Page
   Combines four Stitch screens into one
   unified, interactive experience.
   ═══════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark" />
        <div className="particle w-2 h-2 top-1/4 left-1/4 animate-float" style={{ animationDelay: "0s" }} />
        <div className="particle w-3 h-3 top-3/4 left-1/3 animate-float" style={{ animationDelay: "1s" }} />
        <div className="particle w-1 h-1 top-1/3 right-1/4 animate-float" style={{ animationDelay: "2s" }} />
        <div className="particle w-4 h-4 bottom-1/4 right-1/3 animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-neon-cyan/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* ── Navigation removed (now in layout) ── */}

      {/* ── Main Content ── */}
      <main className="relative z-10 flex flex-col items-center w-full">
        {/* ═══ HERO SECTION ═══ */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative pt-20">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-8 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-white/10 text-xs font-medium text-neon-cyan">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
              </span>
              Live on Avalanche C-Chain
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl">
              Micro-Insurance, <br />
              <span className="text-white relative inline-block">
                Macro Speed.
                <svg className="absolute -bottom-2 w-full h-3 text-primary" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
              Decentralized parametric protection powered by{" "}
              <span className="text-white font-semibold">Avalanche</span> and{" "}
              <span className="text-white font-semibold">zkTLS</span> verification. Instant payouts, zero paperwork.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
              <a
                href="#dashboard"
                className="group relative px-8 py-4 bg-white text-background-dark text-base font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative flex items-center gap-2 justify-center">
                  Launch App
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </a>
              <button className="px-8 py-4 bg-surface-dark/50 border border-white/10 hover:border-white/30 hover:bg-surface-dark text-white text-base font-bold rounded-lg backdrop-blur-sm transition-all hover:-translate-y-1 flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined">description</span>
                Read Whitepaper
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-16 border-t border-white/5 pt-8 w-full max-w-4xl">
              {[
                { value: "$42M+", label: "Total Value Locked" },
                { value: "~2s", label: "Payout Time" },
                { value: "12k+", label: "Active Policies" },
                { value: "0.01%", label: "Fee Structure" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-white font-display">{value}</span>
                  <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Scroll to explore</span>
            <span className="material-symbols-outlined text-slate-400">keyboard_double_arrow_down</span>
          </div>
        </section>

        {/* ═══ ACTIVE MARKETS ═══ */}
        <section id="markets" className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Active Markets</h2>
              <p className="text-slate-400">Select a risk category to insure against.</p>
            </div>
            <a href="#" className="text-primary hover:text-primary/80 font-bold flex items-center gap-1">
              View all markets
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flight Delay */}
            <a href="#dashboard" className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-slate-500">flight_takeoff</span>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined">schedule</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Flight Delay</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold text-primary">$5 USDC</span>
                  <span className="text-sm text-slate-400">/ flight</span>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span>Instant Oracle Payout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span>Global Coverage</span>
                  </div>
                  <div className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded border border-white/10 transition-colors text-center">
                    Insure Now
                  </div>
                </div>
              </div>
            </a>

            {/* Crop Failure */}
            <div className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden opacity-60 cursor-not-allowed">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-slate-500">grass</span>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-500/20 text-green-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined">water_drop</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Crop Failure</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold text-green-500">2.5 AVAX</span>
                  <span className="text-sm text-slate-400">/ acre</span>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                    <span>Weather Data Oracle</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                    <span>Automated Claims</span>
                  </div>
                  <div className="w-full mt-4 bg-white/5 text-slate-500 font-bold py-2 rounded border border-white/10 text-center">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>

            {/* DeFi Hacks */}
            <div className="group relative bg-surface-dark border border-white/5 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden opacity-60 cursor-not-allowed">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-slate-500">security</span>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined">code</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">RISK-L3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">DeFi Hacks</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold text-purple-500">5.0 AVAX</span>
                  <span className="text-sm text-slate-400">/ year</span>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-purple-500 text-base">check_circle</span>
                    <span>Smart Contract Cover</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="material-symbols-outlined text-purple-500 text-base">check_circle</span>
                    <span>Audit Verification</span>
                  </div>
                  <div className="w-full mt-4 bg-white/5 text-slate-500 font-bold py-2 rounded border border-white/10 text-center">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Scrollytelling ═══ */}
        <section id="how-it-works" className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-20 pb-40">
          {/* Section Title */}
          <div className="text-center mb-16 lg:mb-0">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Insurance at the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Speed of Code
              </span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light max-w-2xl mx-auto">
              Reflex L1 leverages Avalanche zkTLS to provide transparent, decentralized parametric micro-insurance. No claims, no paperwork, just code.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mt-12">
            {/* Sticky Left Sidebar */}
            <div className="hidden lg:flex flex-col lg:w-1/3 lg:h-screen lg:sticky lg:top-0 justify-center py-20">
              <div className="flex flex-col gap-16 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/5" />
                {/* Step 1 */}
                <div className="relative flex gap-8 group">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary border-4 border-background-dark shadow-[0_0_15px_rgba(231,64,67,0.6)]">
                    <span className="font-display font-bold text-white">1</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <h3 className="font-display text-2xl font-bold text-white">Lock Premium</h3>
                    <p className="mt-2 text-slate-400 leading-relaxed">Smart contract escrows your $5 USDC instantly in a secure vault.</p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="relative flex gap-8 group">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-dark border-2 border-slate-700 text-slate-500">
                    <span className="font-display font-bold">2</span>
                  </div>
                  <div className="flex flex-col pt-1 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                    <h3 className="font-display text-2xl font-bold text-white">zkTLS Verification</h3>
                    <p className="mt-2 text-slate-400 leading-relaxed">Oracle-free data validation via cryptographic TLS handshakes.</p>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="relative flex gap-8 group">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-dark border-2 border-slate-700 text-slate-500">
                    <span className="font-display font-bold">3</span>
                  </div>
                  <div className="flex flex-col pt-1 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
                    <h3 className="font-display text-2xl font-bold text-white">Instant Payout</h3>
                    <p className="mt-2 text-slate-400 leading-relaxed">Avalanche Teleporter enables cross-subnet settlement in sub-seconds.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Scrolling Cards */}
            <div className="flex flex-col gap-32 w-full lg:w-2/3 py-20">
              {/* CARD 1: Lock Premium */}
              <div>
                <div className="lg:hidden mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold font-display text-sm">1</span>
                    <h3 className="text-2xl font-display font-bold text-white">Lock Premium</h3>
                  </div>
                  <p className="text-slate-400 pl-12">Smart contract escrows funds instantly.</p>
                </div>
                <div className="glass-card rounded-2xl p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-[-50%] left-[-50%] w-[100%] h-[100%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                      <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
                      <div className="absolute inset-4 rounded-full border border-dashed border-primary/30 animate-[spin_15s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gradient-to-br from-[#321a1b] to-[#1a0f0f] p-8 rounded-3xl border border-primary/40 shadow-[0_0_30px_rgba(231,64,67,0.15)] flex flex-col items-center justify-center w-32 h-32">
                          <span className="material-symbols-outlined text-primary text-5xl mb-2">lock</span>
                          <span className="text-white font-display font-bold text-lg">$5.00</span>
                          <span className="text-primary/70 text-xs font-mono">USDC</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center max-w-md">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider mb-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        Escrow Active
                      </div>
                      <h4 className="text-xl font-display font-semibold text-white mb-2">Funds Secured</h4>
                      <p className="text-slate-400 text-sm">Your premium is locked in a non-custodial smart contract until the trigger event resolves.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: zkTLS Verification */}
              <div>
                <div className="lg:hidden mb-4 mt-12">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold font-display text-sm">2</span>
                    <h3 className="text-2xl font-display font-bold text-white">zkTLS Verification</h3>
                  </div>
                  <p className="text-slate-400 pl-12">Oracle-free data validation via TLS.</p>
                </div>
                <div className="glass-card rounded-2xl p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full" />
                      <svg className="drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" fill="none" height="200" viewBox="0 0 180 200" width="180" xmlns="http://www.w3.org/2000/svg">
                        <path d="M90 190C90 190 160 154 160 50V20L90 0L20 20V50C20 154 90 190 90 190Z" fill="rgba(0, 240, 255, 0.05)" stroke="#00F0FF" strokeWidth="2" />
                        <path d="M55 90L80 115L125 70" stroke="#00F0FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                      </svg>
                      <div className="absolute -top-4 -right-8 bg-black/60 backdrop-blur-sm border border-neon-cyan/30 p-2 rounded text-[10px] font-mono text-neon-cyan animate-pulse">
                        TLS_Handshake_OK
                      </div>
                      <div className="absolute bottom-10 -left-10 bg-black/60 backdrop-blur-sm border border-neon-cyan/30 p-2 rounded text-[10px] font-mono text-neon-cyan animate-[pulse_2s_infinite]">
                        zk_Proof_Valid
                      </div>
                    </div>
                    <div className="text-center max-w-md">
                      <h4 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">
                        <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">zkTLS</span> Verified
                      </h4>
                      <p className="text-slate-300 text-sm">
                        Cryptographic proof generated from the web session. The flight delay is verified without a centralized oracle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: Instant Payout */}
              <div>
                <div className="lg:hidden mb-4 mt-12">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary text-primary font-bold font-display text-sm">3</span>
                    <h3 className="text-2xl font-display font-bold text-white">Instant Payout</h3>
                  </div>
                  <p className="text-slate-400 pl-12">Cross-subnet settlement in sub-seconds.</p>
                </div>
                <div className="glass-card rounded-2xl p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
                  <div className="relative z-10 w-full flex flex-col items-center gap-10">
                    <div className="relative w-full max-w-xs h-64 flex flex-col items-center justify-between">
                      {/* Top Node */}
                      <div className="z-10 w-full flex justify-center">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#2a1516] border border-primary/40">
                          <span className="material-symbols-outlined text-primary text-sm">article</span>
                          <span className="text-xs font-mono text-slate-300">Contract</span>
                        </div>
                      </div>
                      {/* Beam */}
                      <div className="absolute top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 overflow-visible">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-primary blur-sm animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-40 bg-primary/20 blur-xl" />
                      </div>
                      {/* Bottom Node */}
                      <div className="z-10 w-full flex justify-center mt-auto">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-white shadow-[0_0_20px_rgba(231,64,67,0.5)]">
                          <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                          <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Payout Received</span>
                            <span className="text-base font-bold font-display">+$50.00 USDC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center max-w-md">
                      <h4 className="text-xl font-display font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        Avalanche Teleporter
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Settlement is instant. The Teleporter protocol moves assets across subnets in sub-seconds, depositing directly into your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ POLICY DASHBOARD / APP SECTION ═══ */}
        <section id="dashboard" className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column — Marketing */}
            <div className="lg:col-span-5 flex flex-col gap-8 pt-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  zkTLS Verified
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-white">
                  Flight Delay <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-400 to-neon-cyan">
                    Insurance Terminal
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Instant, parametric protection powered by zero-knowledge proofs. If your flight is delayed by &gt;2 hours, you get paid automatically.
                </p>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 hover:border-primary/30 transition-colors group">
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Total Value Locked</span>
                  <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">$4.2M</span>
                </div>
                <div className="glass-panel p-5 rounded-xl flex flex-col gap-1 hover:border-neon-cyan/30 transition-colors group">
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Claims Paid (24h)</span>
                  <span className="text-2xl font-bold text-white group-hover:text-neon-cyan transition-colors">$128k</span>
                </div>
              </div>
              {/* Live Feed */}
              <div className="hidden lg:flex flex-col gap-4 mt-8">
                <div className="flex items-center justify-between text-sm text-slate-400 border-b border-white/5 pb-2">
                  <span className="font-mono uppercase tracking-wider">Recent Activity</span>
                  <span className="flex items-center gap-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Live Feed
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">Payout: 50 USDC</span>
                        <span className="text-xs text-slate-500">Flight UA928 • 2m ago</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600">0x8a...29c</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined text-[16px]">security</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">Policy Created</span>
                        <span className="text-xs text-slate-500">Flight BA145 • 5m ago</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600">0x3f...e11</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Interactive Dashboard */}
            <div className="lg:col-span-7 w-full">
              <PolicyDashboard />
            </div>
          </div>
        </section>

        {/* ═══ ACTIVE POLICIES TABLE ═══ */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-24 relative z-10">
          <ActivePolicies />
        </section>

        {/* ═══ TECH / zkTLS SECTION ═══ */}
        <section className="w-full bg-surface-dark/30 border-y border-white/5 py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Powered by <span className="text-neon-cyan">zkTLS</span> Verification
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Reflex L1 leverages Zero-Knowledge Proofs to verify real-world events without compromising data privacy. Our oracle network validates flight statuses, weather conditions, and blockchain states instantly.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background-dark/50 border border-white/5">
                  <div className="bg-primary/20 p-2 rounded text-primary">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Private Data Handling</h4>
                    <p className="text-sm text-slate-400">Your personal data never leaves the secure enclave.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background-dark/50 border border-white/5">
                  <div className="bg-neon-cyan/20 p-2 rounded text-neon-cyan">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Avalanche Subnets</h4>
                    <p className="text-sm text-slate-400">Dedicated high-throughput infrastructure for insurance events.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Animated visualization */}
            <div className="flex-1 w-full flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-background-dark to-surface-dark rounded-2xl border border-white/10 shadow-2xl p-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl border border-white/5" />
                <div className="absolute inset-4 rounded-xl border border-dashed border-white/10 animate-[spin_20s_linear_infinite]" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center cyan-glow">
                    <span className="material-symbols-outlined text-5xl text-primary">verified_user</span>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-mono text-sm mb-1">Status: VERIFIED</div>
                    <div className="text-neon-cyan font-mono text-xs">Block #23948102</div>
                  </div>
                </div>
                <div className="absolute top-10 left-10 p-2 bg-background-dark rounded border border-white/10 shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                  <span className="material-symbols-outlined text-slate-400">flight</span>
                </div>
                <div className="absolute bottom-10 right-10 p-2 bg-background-dark rounded border border-white/10 shadow-lg animate-float" style={{ animationDelay: "1.5s" }}>
                  <span className="material-symbols-outlined text-slate-400">cloud</span>
                </div>
                <div className="absolute top-1/2 right-4 p-2 bg-background-dark rounded border border-white/10 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                  <span className="material-symbols-outlined text-slate-400">code</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA SECTION ═══ */}
        <section className="py-20 bg-background-dark relative z-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Ready to secure your future?</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">
              Connect your wallet and explore available micro-insurance pools powered by Reflex L1.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#dashboard"
                className="px-8 py-4 rounded-lg bg-primary hover:bg-primary-dark transition-all text-white font-bold font-display shadow-[0_0_20px_rgba(231,64,67,0.3)] hover:shadow-[0_0_30px_rgba(231,64,67,0.5)]"
              >
                Launch App
              </a>
              <button className="px-8 py-4 rounded-lg border border-slate-700 hover:border-white text-white font-medium transition-colors">
                Read Documentation
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-background-dark border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2 items-center md:items-start">
              <div className="flex items-center gap-2 text-white font-bold text-xl">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Reflex L1
              </div>
              <p className="text-slate-500 text-sm">© 2024 Reflex L1. Built on Avalanche.</p>
            </div>
            <div className="flex gap-8">
              <a className="text-slate-400 hover:text-white transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="text-slate-400 hover:text-white transition-colors" href="#">Docs</a>
            </div>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all" href="#">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all" href="#">
                <span className="material-symbols-outlined text-lg">hub</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all" href="#">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
