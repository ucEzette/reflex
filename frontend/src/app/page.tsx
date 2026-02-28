import { PolicyDashboard } from "@/components/PolicyDashboard";
import { ActivePolicies } from "@/components/ActivePolicies";
import { ALL_MARKETS } from "@/lib/market-data";

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
            {/* Badge Removed per request */}

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
              Reflex L1 shares the same event-driven strategy as prediction markets, but instead of being a prediction site for speculators, Reflex is a micro-insurance platform. Both crypto natives and traditional users can browse a marketplace of real-world risks, find a policy that matches their daily needs, and buy it to instantly insure themselves against negative events.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
              <a href="#dashboard" className="dexter-btn-container w-52 relative z-30">
                <button className="dexter-btn !min-w-[200px] !min-h-[50px] !px-6 !py-3 !rounded-xl" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top !text-[11px]">DAPP</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-lg">Launch App <span className="material-symbols-outlined text-[20px]">arrow_forward</span></span>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[11px]">mainnet active</span>
                </button>
              </a>
              <a href="/docs" className="dexter-btn-container w-52 relative z-30" style={{ '--btn-color': '#475569' } as React.CSSProperties}>
                <button className="dexter-btn !min-w-[200px] !min-h-[50px] !px-6 !py-3 !rounded-xl opacity-90 hover:opacity-100" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top !text-[11px]">DOCS</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-lg !text-white/90"><span className="material-symbols-outlined text-[20px]">description</span> Whitepaper</span>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner !w-[40px]" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[11px] !text-white/80">learn more</span>
                </button>
              </a>
            </div>

            {/* Stats Row Removed per request */}
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
          <div className="flex justify-center items-center w-full min-h-[500px]">
            <div className="homepage-card-3d">
              {ALL_MARKETS.map((market) => (
                <div key={market.id} className="card-item group">
                  <a href={market.id === 'flight' ? `/markets/flight` : '#dashboard'} className="absolute inset-0 z-20"><span className="sr-only">View {market.title}</span></a>
                  <span className={`material-symbols-outlined text-4xl group-hover:scale-125 transition-transform drop-shadow-lg ${market.iconColor}`}>{market.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Scrollytelling ═══ */}
        <section id="how-it-works" className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-20 pb-16">
          {/* Section Title */}
          <div className="text-center mb-16 lg:mb-0">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Insurance at the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Speed of Code
              </span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 font-light max-w-2xl mx-auto">
              Reflex L1 leverages Chainlink Decentralized Oracle Networks (DONs) to provide transparent, parametric micro-insurance. No centralized claims adjusters, just code.
            </p>
          </div>

          <div className="flex justify-center items-center mt-16 mb-8 w-full min-h-[350px]">
            <div className="glass-group">
              <div className="glass-panel" data-text="1. Lock Premium" style={{ '--r': '-15' } as React.CSSProperties}>
                <span className="material-symbols-outlined">lock</span>
                <p className="text-slate-300 text-sm px-6 text-center leading-relaxed font-light mt-4 mb-6">Smart contract escrows your $5 USDC instantly in a secure vault.</p>
              </div>
              <div className="glass-panel" data-text="2. Verification" style={{ '--r': '5' } as React.CSSProperties}>
                <span className="material-symbols-outlined text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">link</span>
                <p className="text-slate-300 text-sm px-4 text-center leading-relaxed font-light mt-4 mb-6">A Decentralized Oracle Network queries aviation data and achieves consensus on the delay.</p>
              </div>
              <div className="glass-panel" data-text="3. Instant Payout" style={{ '--r': '25' } as React.CSSProperties}>
                <span className="material-symbols-outlined text-primary drop-shadow-[0_0_8px_rgba(231,64,67,0.8)]">bolt</span>
                <p className="text-slate-300 text-sm px-6 text-center leading-relaxed font-light mt-4 mb-6">Avalanche Teleporter enables cross-subnet settlement in sub-seconds.</p>
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
                  Chainlink Verified
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-white">
                  Flight Delay <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-400 to-neon-cyan">
                    Insurance Terminal
                  </span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Instant, parametric protection powered by Chainlink Oracles. If your flight is delayed by &gt;2 hours, you get paid automatically.
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

        {/* ═══ TECH / CHAINLINK SECTION ═══ */}
        <section className="w-full bg-surface-dark/30 border-y border-white/5 py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Powered by <span className="text-neon-cyan">Chainlink</span> DONs
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Reflex L1 leverages Chainlink Functions to verify real-world events in a decentralized, trust-minimized way. Our oracle network validates flight statuses and pushes the consensus to the blockchain instantly.
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
              <a href="#dashboard" className="dexter-btn-container w-48 relative z-30">
                <button className="dexter-btn !min-w-[180px] !min-h-[44px] !px-4 !py-2" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top">DAPP</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-base">Launch App <span className="material-symbols-outlined text-[18px]">arrow_forward</span></span>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px]">mainnet</span>
                </button>
              </a>
              <a href="/docs" className="dexter-btn-container w-48 relative z-30" style={{ '--btn-color': '#475569' } as React.CSSProperties}>
                <button className="dexter-btn !min-w-[180px] !min-h-[44px] !px-4 !py-2 opacity-90 hover:opacity-100" type="button">
                  <span className="dexter-btn-drawer dexter-transition-top">DOCS</span>
                  <span className="dexter-btn-text flex items-center gap-2 !text-base !text-white/90">Documentation</span>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <svg className="dexter-btn-corner" viewBox="0 0 100 100"><path d="M 0 0 L 100 0 L 100 100 L 98 100 L 98 2 L 0 2 Z"></path></svg>
                  <span className="dexter-btn-drawer dexter-transition-bottom whitespace-nowrap !text-[10px] !text-white/80">learn more</span>
                </button>
              </a>
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
