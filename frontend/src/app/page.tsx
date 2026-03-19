"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { PayoutSimulator } from "@/components/PayoutSimulator";
import { SolvencyDashboard } from "@/components/SolvencyDashboard";
import { ALL_MARKETS } from "@/lib/market-data";
import { GlobalStats } from "@/components/GlobalStats";

/* ═══════════════════════════════════════════
   REFLEX L1 — Scrollytelling Landing Page
   ═══════════════════════════════════════════ */

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-[-5%] bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: "url('/agriculture.jpg')",
            x: useSpring(mousePos.x * -20, { stiffness: 100, damping: 30 }),
            y: useSpring(mousePos.y * -20, { stiffness: 100, damping: 30 }),
            scale: 1.05
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/10 via-background-dark/40 to-background-dark/80" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Navigation removed (now in layout) ── */}

      {/* ── Main Content ── */}
      <main className="relative z-10 flex flex-col items-center w-full">
        {/* ═══ HERO SECTION ═══ */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative pt-20">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-8 relative z-10">
            {/* Badge Removed per request */}

            {/* Headline */}
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
              Micro-Insurance, <br />
              <span className="text-primary relative inline-block">
                Macro Speed.
                <svg className="absolute -bottom-2 w-full h-3 text-primary" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
              Reflex is a <strong className="text-primary">Protection Market</strong>. Instead of speculating on outcomes, Reflex is a micro-insurance platform where crypto natives and traditional users can browse a marketplace of real-world risks, find a policy that matches their daily needs, and buy it to instantly insure themselves against negative events.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
              <a href="/market" className="dexter-btn-container w-full max-w-[220px] sm:w-52 relative z-30">
                <button className="dexter-btn w-full !min-h-[50px] !px-6 !py-3 !rounded-xl" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top !text-[11px]">DAPP</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-lg">Launch App <span className="material-symbols-outlined text-[20px]">arrow_forward</span></span>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[11px]">mainnet active</span>
                </button>
              </a>
              <a href="https://docs.google.com/presentation/d/1RAQHRFVr9NHClst8C7FdOXr4fHUsxcsug20wHwEC8Ak/present" target="_blank" rel="noopener noreferrer" className="dexter-btn-container w-full max-w-[220px] sm:w-52 relative z-30" style={{ '--btn-color': '#475569' } as React.CSSProperties}>
                <button className="dexter-btn w-full !min-h-[50px] !px-6 !py-3 !rounded-xl opacity-90 hover:opacity-100" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top !text-[11px]">DOCS</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-lg !text-foreground/90"><span className="material-symbols-outlined text-[20px]">description</span> Our Intro Deck</span>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[11px] !text-foreground/80">learn more</span>
                </button>
              </a>
            </div>

            {/* Global Stats Row */}
            <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <GlobalStats />
            </div>
          </div>


        </section>

        {/* ═══ ACTIVE MARKETS ═══ */}
        <section id="markets" className="w-full max-w-7xl mx-auto px-6 py-12 xl:py-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase italic tracking-tighter">Active Markets</h2>
              <p className="text-primary font-bold uppercase tracking-widest text-xs">Select a risk category to insure against.</p>
            </div>
            <a href="/market" className="text-primary hover:text-primary/80 font-bold flex items-center gap-1">
              View all markets
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
          </div>
          <div className="flex justify-center items-center w-full min-h-[300px] xl:min-h-[350px]">
            <div className="homepage-card-3d">
              {ALL_MARKETS.map((market) => (
                <div key={market.id} className="card-item group">
                  <a href={`/market/${market.id}`} className="absolute inset-0 z-20"><span className="sr-only">View {market.title}</span></a>
                  <span className={`material-symbols-outlined text-4xl group-hover:scale-125 transition-transform drop-shadow-lg ${market.iconColor}`}>{market.icon}</span>
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-widest mt-2 text-center px-1 drop-shadow-md group-hover:text-foreground transition-colors">{market.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Scrollytelling ═══ */}
        <section id="how-it-works" className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-20 pb-16">
          {/* Section Title */}
          <div className="text-center mb-16 lg:mb-0">
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Insurance at the <br />
              <span className="text-primary">
                Speed of Code
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/70 font-light max-w-2xl mx-auto">
              Reflex is the first decentralized <strong className="text-primary">Protection Market</strong>, leveraging Chainlink Decentralized Oracle Networks (DONs) to provide transparent, parametric micro-insurance. No centralized claims adjusters, just code.
            </p>
          </div>

          <div className="flex justify-center items-center mt-16 mb-8 w-full min-h-[350px]">
            <div className="glass-group">
              <div className="glass-panel" data-text="1. Lock Premium" style={{ '--r': '-15' } as React.CSSProperties}>
                <span className="material-symbols-outlined">lock</span>
                <p className="text-foreground text-sm px-6 text-center leading-relaxed font-light mt-4 mb-6">Smart contract escrows your $5 USDT instantly in a secure vault.</p>
              </div>
              <div className="glass-panel" data-text="2. Verification" style={{ '--r': '5' } as React.CSSProperties}>
                <span className="material-symbols-outlined text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">link</span>
                <p className="text-foreground text-sm px-4 text-center leading-relaxed font-light mt-4 mb-6">A Decentralized Oracle Network queries aviation data and achieves consensus on the delay.</p>
              </div>
              <div className="glass-panel" data-text="3. Instant Payout" style={{ '--r': '25' } as React.CSSProperties}>
                <span className="material-symbols-outlined text-primary drop-shadow-[0_0_8px_var(--primary)]">bolt</span>
                <p className="text-foreground text-sm px-6 text-center leading-relaxed font-light mt-4 mb-6">Avalanche Teleporter enables instant settlement in sub-seconds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PAYOUT SIMULATOR SECTION ═══ */}
        <section id="simulator" className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="flex flex-col gap-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold tracking-wider uppercase mb-6">
                <span className="material-symbols-outlined text-[14px]">analytics</span>
                What-If Simulator
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter text-white mb-6 uppercase italic">
                Visualize Your <br />
                <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">Protection Scaling</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed font-light">
                Drag the slider below to simulate real-world events. See exactly how the <span className="text-primary font-bold italic tracking-tighter underline underline-offset-4 decoration-primary/30">Reflex Parametric Engine</span> calculates and authorizes instant payouts based on verifiable data thresholds.
              </p>
            </div>

            <PayoutSimulator />
          </div>
        </section>

        {/* ═══ PROOF OF SOLVENCY SECTION ═══ */}
        <section id="solvency" className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10">
          <SolvencyDashboard />
        </section>

        {/* ═══ CTA SECTION ═══ */}
        <section className="py-20 bg-background-dark relative z-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">Ready to secure your future?</h2>
            <p className="text-white/80 mb-10 max-w-xl mx-auto font-light leading-relaxed">
              Connect your wallet and explore available micro-insurance pools powered by <span className="text-primary font-bold">Reflex</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <a href="/market" className="dexter-btn-container w-full max-w-[200px] sm:w-48 relative z-30">
                <button className="dexter-btn w-full !min-h-[44px] !px-4 !py-2" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top">DAPP</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-base">Launch App <span className="material-symbols-outlined text-[18px]">arrow_forward</span></span>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px]">mainnet</span>
                </button>
              </a>
              <a href="https://docs.google.com/presentation/d/1RAQHRFVr9NHClst8C7FdOXr4fHUsxcsug20wHwEC8Ak/present" target="_blank" rel="noopener noreferrer" className="dexter-btn-container w-full max-w-[200px] sm:w-48 relative z-30" style={{ '--btn-color': '#475569' } as React.CSSProperties}>
                <button className="dexter-btn w-full !min-h-[44px] !px-4 !py-2 opacity-90 hover:opacity-100" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top">DOCS</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-base !text-foreground/90">Our Intro Deck</span>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px] !text-foreground/80">learn more</span>
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
