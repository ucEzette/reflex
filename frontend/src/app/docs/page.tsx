"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CONTRACTS } from "@/lib/contracts";

const SIDEBAR_SECTIONS = [
  {
    title: "Fundamentals",
    items: [
      { id: "overview", label: "Protocol Overview" },
      { id: "policyholders", label: "For Policyholders" },
      { id: "investors", label: "For Investors" },
      { id: "integrations", label: "Protocol Integrations" },
      { id: "dynamic-risk", label: "Dynamic Risk Engine" },
      { id: "enterprise-sdk", label: "Enterprise SDK" },
    ],
  },
  {
    title: "Markets",
    items: [
      { id: "agriculture", label: "Agriculture (Linear)" },
      { id: "energy", label: "Energy (Tick)" },
      { id: "catastrophe", label: "Catastrophe (Tiered)" },
      { id: "binary", label: "Maritime & Travel" },
    ],
  },
  {
    title: "Technical",
    items: [
      { id: "premium-pricing", label: "Premium Pricing" },
      { id: "lp-tokenomics", label: "LP Tokenomics" },
      { id: "oracle-flow", label: "Oracle Data Flow" },
      { id: "policy-states", label: "Policy States" },
      { id: "fees", label: "Fee Structure" },
      { id: "contracts", label: "Contracts" },
      { id: "security", label: "Security" },
      { id: "glossary", label: "Glossary" },
      { id: "faq", label: "FAQ" },
    ],
  },
];

const CONTRACT_LIST = [
  { name: "ReflexParametricEscrow (Proxy)", addr: CONTRACTS.ESCROW, desc: "Primary micro-insurance engine. Manages policy issuance, parametric triggers via Chainlink Functions, and cross-chain settlements." },
  { name: "ProductFactory", addr: CONTRACTS.VAULT_FACTORY, desc: "Central administrative registry for all protocol products. Handles authorization of new risk products and access control." },
  { name: "USDT (Testnet Mock)", addr: CONTRACTS.USDT, desc: "Primary settlement currency. Used for policy purchases, liquidity provision, and claim payouts." },
];

const POOL_LIST = [
  { name: "Travel Liquidity Pool", addr: CONTRACTS.LP_TRAVEL, desc: "Capital backing the Travel risk sector." },
  { name: "Agriculture Liquidity Pool", addr: CONTRACTS.LP_AGRI, desc: "Capital reserve for agricultural productivity hazards." },
  { name: "Energy Liquidity Pool", addr: CONTRACTS.LP_ENERGY, desc: "Dedicated liquidity for energy supply risk." },
  { name: "Catastrophe Liquidity Pool", addr: CONTRACTS.LP_CAT, desc: "High-intensity capital for natural disaster protection." },
  { name: "Maritime Liquidity Pool", addr: CONTRACTS.LP_MARITIME, desc: "Global trade liquidity backing ocean logistics." },
];

const PRODUCT_LIST = [
  { name: "TravelSolutions", addr: CONTRACTS.TRAVEL, desc: "Flight delay protection using aviation oracles." },
  { name: "AgricultureIndex", addr: CONTRACTS.AGRI, desc: "Drought and extreme weather protection via climate indices." },
  { name: "EnergySolutions", addr: CONTRACTS.ENERGY, desc: "Hedging for energy shortfalls and renewable volatility." },
  { name: "CatastropheProximity", addr: CONTRACTS.CATASTROPHE, desc: "Location-based protection against natural disasters." },
  { name: "MaritimeSolutions", addr: CONTRACTS.MARITIME, desc: "Shipping risk covering logistics delays." },
];

const GLOSSARY = [
  { term: "Strike", def: "The threshold value at which a policy begins to pay out." },
  { term: "Exit", def: "The catastrophic threshold triggering maximum payout." },
  { term: "Tick Value", def: "USD value per unit of deviation in tick-based models." },
  { term: "DON", def: "Decentralized Oracle Network — Chainlink's multi-node data verification system." },
  { term: "Haversine", def: "Formula for calculating great-circle distance between two GPS coordinates." },
  { term: "HDD / CDD", def: "Heating / Cooling Degree Days — measures of temperature deviation from 18.3°C base." },
  { term: "BPS", def: "Basis Points — 1 BPS = 0.01%. Used for fee and margin calculations." },
  { term: "EIP-712", def: "Ethereum typed structured data signing standard used for quote verification." },
  { term: "aUSDT", def: "Aave v3 interest-bearing USDT token received when USDT is supplied to Aave." },
  { term: "Keepers", def: "Chainlink Automation nodes that trigger policy expiration when timestamps pass." },
  { term: "totalMaxPayouts", def: "Sum of all maximum possible payouts across active policies." },
  { term: "Solvency Invariant", def: "totalAssets() ≥ totalMaxPayouts must hold at all times." },
];

const FAQS = [
  { q: "What happens if the oracle goes down?", a: "Policies remain in Active (status=0) until the oracle recovers. No payouts or expirations can occur without verified data. The protocol never guesses." },
  { q: "What if pool utilization reaches 100%?", a: "The routePremiumAndReserve() function reverts with 'InsufficientCapitalCap'. New policy sales are effectively halted until existing policies expire or more liquidity is deposited." },
  { q: "Can a policy be claimed after it expires?", a: "No. Once status transitions to 2 (Expired), the executeClaim() function reverts with 'Not active'. This is enforced by the status check and verified in 640k+ fuzz sequences." },
  { q: "What happens during chain congestion?", a: "Chainlink Keepers will retry expiration calls. Claim settlements may be delayed by block inclusion time, but the payout amount is deterministic and cannot change." },
  { q: "Can LPs withdraw during active policies?", a: "Yes, but only up to the point where the solvency invariant holds. If withdrawal would cause totalAssets < totalMaxPayouts, the available withdrawal amount is reduced proportionally." },
  { q: "How are gas costs handled?", a: "Policyholders pay gas for purchasePolicy(). Claim execution and policy expiration gas is covered by the Relayer/Keeper infrastructure." },
];

function ContractCard({ name, addr, desc, color = "violet" }: { name: string; addr: string; desc: string; color?: string }) {
  return (
    <div className="flex flex-col p-5 rounded-xl bg-surface-container-lowest specular-border hover:bg-surface-container-low transition-all group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold">{name}</span>
        <a href={`https://sepolia.arbiscan.io/address/${addr}`} target="_blank" rel="noopener noreferrer" className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-${color}-400 flex items-center gap-1`}>
          Arbiscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{desc}</p>
      <code className="text-[9px] text-zinc-500 mono-data bg-surface-container-highest px-2 py-1 rounded select-all truncate">{addr}</code>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sectionClass = "animate-fade-in";
  const h1Class = "text-4xl md:text-5xl font-bold tracking-tight mb-8 flex items-center gap-4";
  const panelClass = "bg-surface-container-lowest p-8 rounded-2xl specular-border space-y-6";
  const codeBlockClass = "p-4 bg-surface-container-highest rounded-xl mono-data text-[11px] border border-white/5 overflow-x-auto";

  return (
    <div className="pt-24 pb-24 max-w-[1600px] mx-auto flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-white/5 pr-6 pl-8 pt-12 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
        <Link href="/" className="text-xl font-bold text-on-surface tracking-tighter mb-10 block">
          Reflex Docs
        </Link>
        <div className="flex items-center gap-2 mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">v2.1 — MAR 2026</span>
        </div>
        <nav className="flex flex-col gap-8">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title}>
              <span className="text-institutional block mb-3">{section.title}</span>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button onClick={() => { setActiveSection(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full text-left px-3 py-2 rounded text-sm transition-colors border-l-2 ${activeSection === item.id ? "bg-primary-container/20 text-primary font-medium border-primary" : "text-zinc-400 hover:text-on-surface hover:bg-surface-container-high border-transparent"}`}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 lg:px-16 pt-12 max-w-4xl">

        {/* ─── OVERVIEW ─── */}
        {activeSection === "overview" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-primary">travel_explore</span> Protection Market Mission</h1>
            <div className={panelClass}>
              <p className="text-zinc-300 leading-relaxed text-lg font-light">Reflex is a decentralized <strong>Protection Market</strong> for Parametric Micro-Insurance. By utilizing immutable smart contracts and high-fidelity oracle data, Reflex eliminates the friction, costs, and subjectivity of traditional insurance claims processing.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-primary font-bold text-sm mb-2">The Problem</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed italic">Traditional insurance ignores small daily losses under $50 because their administrative overhead costs more than the payout itself—leaving consumers unprotected against high-frequency, low-severity risks.</p>
                </div>
                <div className="p-5 bg-primary/10 rounded-xl border border-primary/20">
                  <h4 className="text-primary font-bold text-sm mb-2">The Reflex Solution</h4>
                  <p className="text-[11px] text-zinc-200 leading-relaxed">We replace human adjusters with <strong>Chainlink Oracle Networks</strong>. If the data says a flight is delayed 120 minutes, the contract pays out instantly. No claims forms, no waiting, no arguments.</p>
                </div>
              </div>
              <blockquote className="border-l-2 border-primary/30 pl-6 py-2 italic text-zinc-400 font-light text-sm">&quot;In a Protection Market, the code is the contract, and the data is the adjuster.&quot;</blockquote>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "layers", title: "Layer 2 Settlement", desc: "Arbitrum Sepolia for low-cost, fast finality transactions.", color: "text-primary" },
                { icon: "hub", title: "Oracle Network", desc: "Chainlink DON for tamper-proof event verification.", color: "text-tertiary" },
                { icon: "account_balance", title: "Isolated Vaults", desc: "Hub-and-spoke model with sector-isolated liquidity.", color: "text-secondary" },
              ].map(c => (
                <div key={c.title} className="bg-surface-container-lowest p-6 rounded-xl specular-border text-center">
                  <span className={`material-symbols-outlined text-4xl ${c.color} mb-3`}>{c.icon}</span>
                  <h3 className="font-bold mb-2">{c.title}</h3>
                  <p className="text-zinc-500 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── POLICYHOLDERS ─── */}
        {activeSection === "policyholders" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-secondary">verified_user</span> The Policyholder Lifecycle</h1>
            <p className="text-zinc-400 font-light leading-relaxed mb-10">Reflex provides a transparent way to hedge against specific, quantifiable risks without deductible negotiations or manual claim filings.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { step: "1", title: "Precision Purchase", icon: "shopping_cart_checkout", color: "text-secondary", desc: "Select a target (Flight BA205, Port of Rotterdam) and define risk parameters. Premiums are calculated from historical volatility and pool utilization." },
                { step: "2", title: "Secure Escrow", icon: "security", color: "text-purple-400", desc: "Premium commits to the ReflexLiquidityPool. Full Max Payout is locked from the shared treasury for the entire index period." },
                { step: "3", title: "Oracle Monitoring", icon: "satellite_alt", color: "text-primary", desc: "Relayer + Chainlink DONs monitor active targets. If an event breaches the strike threshold, a consensus verification payload is pushed on-chain." },
                { step: "4", title: "Atomic Settlement", icon: "payments", color: "text-emerald-400", desc: "No manual claim button. The contract triggers USDT release to the policyholder's wallet the moment consensus is confirmed." },
              ].map(s => (
                <div key={s.step} className="bg-surface-container-lowest p-6 rounded-xl specular-border space-y-3 hover:bg-surface-container-low transition-all">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${s.color}`}>
                    <span className="material-symbols-outlined text-xl">{s.icon}</span>
                  </div>
                  <h4 className="font-bold text-sm">{s.step}. {s.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── INVESTORS ─── */}
        {activeSection === "investors" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-emerald-400">trending_up</span> The Investor Yield Engine</h1>
            <div className={panelClass}>
              <p className="text-zinc-300 font-light leading-relaxed">Liquidity Providers (LPs) act as the protocol&apos;s underwriters. By depositing USDT, they provide collateral to back Max Payouts and earn multifaceted yield.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
                <div className="space-y-5">
                  <h4 className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400">account_balance_wallet</span> Yield Waterfall</h4>
                  {[
                    { n: "01", title: "Premium Underwriting", desc: "97% of premiums (after 3% origination fee) flow to the LP pool as profit upon policy expiration." },
                    { n: "02", title: "Aave v3 Yield", desc: "Idle USDT is routed to Aave for base lending interest, compounded block-by-block." },
                    { n: "03", title: "Protocol Incentives", desc: "Future native token emissions for long-term LPs to bootstrap deep liquidity." },
                  ].map(y => (
                    <div key={y.n} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center shrink-0"><span className="text-[10px] text-emerald-400 font-bold">{y.n}</span></div>
                      <div><p className="text-xs font-bold">{y.title}</p><p className="text-[10px] text-zinc-500 leading-tight">{y.desc}</p></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 p-5 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <h4 className="text-red-400 font-bold flex items-center gap-2 text-sm"><span className="material-symbols-outlined">warning</span> Risk Profile</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-light">LPs shoulder the risk of payouts. If an insured event fires, the payout is deducted from the shared pool. Mitigations:</p>
                  <ul className="text-[10px] text-zinc-500 space-y-1.5 font-light">
                    <li>• <strong>$10M Hard Cap</strong> — Max exposure per single policy.</li>
                    <li>• <strong>Non-Correlation</strong> — Risk spread across independent indices.</li>
                    <li>• <strong>Utilization Guard</strong> — Sales halt if coverage exceeds 90% of assets.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── INTEGRATIONS ─── */}
        {activeSection === "integrations" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-primary">integration_instructions</span> Protocol Integrations</h1>
            <div className={panelClass}>
              {[
                { icon: "layers", color: "primary", title: "Arbitrum Ecosystem", desc: "Reflex is natively built for the Arbitrum Network. We utilize Arbitrum Sepolia for our primary deployment, leveraging the network's fast finality for rapid parametric settlement." },
                { icon: "hub", color: "blue-400", title: "Chainlink DON & Functions", desc: "The protocol utilizes Chainlink Functions and Decentralized Oracle Networks (DONs) to source high-fidelity off-chain data. The PolicyVerifier logic performs cryptographic verification of external events before authorizing payouts." },
                { icon: "account_balance", color: "indigo-400", title: "Aave V3 Yield Optimization", desc: "Reflex Liquidity Pools are integrated with Aave V3. Idle USDT is automatically routed to Aave's lending markets, ensuring LPs earn base yield in addition to parametric insurance premiums." },
              ].map((int, i) => (
                <div key={int.title} className={`space-y-4 ${i > 0 ? "pt-10 border-t border-white/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${int.color}/10 rounded-lg border border-${int.color}/20`}><span className={`material-symbols-outlined text-${int.color} text-xl`}>{int.icon}</span></div>
                    <h3 className="text-xl font-bold">{int.title}</h3>
                  </div>
                  <p className="text-zinc-400 font-light leading-relaxed text-sm">{int.desc}</p>
                </div>
              ))}
              <div className="space-y-4 pt-10 border-t border-white/5">
                <h3 className="text-xl font-bold">Chainlink Functions Code</h3>
                <div className={codeBlockClass}>
                  <pre className="text-primary">{`// cre/PolicyVerifier.ts execution
async run(input: VerificationInput) {
  const isValid = await verifyParametricTrigger(input.data);
  if (!isValid) throw new Error("Trigger conditions not met");
  return { authorized: true, payout: input.requestedPayout };
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── DYNAMIC RISK ─── */}
        {activeSection === "dynamic-risk" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-red-500">dynamic_form</span> Dynamic Risk Engine</h1>
            <div className={panelClass}>
              <p className="text-zinc-300 leading-relaxed font-light text-lg">The Dynamic Risk Engine (DRE) is a high-frequency actuarial layer that prevents protocol insolvency during extreme volatility. Premiums adjust based on live environmental and market telemetry.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Surge Triggers</h4>
                  <ul className="text-[11px] text-zinc-400 space-y-2">
                    <li>• <strong>Aviation</strong>: Wind Speeds &gt; 25 knots / Hail probability &gt; 40%.</li>
                    <li>• <strong>Stablecoins</strong>: Oracle price deviation &gt; 1.5% from peg.</li>
                    <li>• <strong>Agriculture</strong>: Rain probability &lt; 10% during peak season.</li>
                  </ul>
                </div>
                <div className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest">Pricing Formula</h4>
                  <div className={codeBlockClass}><pre className="text-primary">{`Premium = BaseP × riskMultiplier(DON_DATA)
// riskMultiplier ranges from 1.0x to 5.0x`}</pre></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ENTERPRISE SDK ─── */}
        {activeSection === "enterprise-sdk" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-primary">sdk</span> Enterprise SDK</h1>
            <div className={panelClass}>
              <p className="text-zinc-400 font-light leading-relaxed">The Reflex Enterprise SDK is a modular micro-frontend designed for seamless checkout integration. It abstracts all blockchain complexity while providing high-fidelity branding controls.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-primary font-bold text-sm mb-2">useReflexWidget Hook</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Headless business logic for premium estimation, risk polling, and purchase state management.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-primary font-bold text-sm mb-2">Themeable UI</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Pre-built Light, Dark, and Glassmorphism themes. Customizable accent colors and iconography.</p>
                </div>
              </div>
              <div className={codeBlockClass}><pre className="text-primary">{`// Partner Integration Example
import { ReflexWidget } from "@reflex/widget-sdk";

<ReflexWidget 
  market="TRAVEL" 
  theme="glass" 
  brandName="FlyGlobal"
  accentColor="#6366f1"
/>`}</pre></div>
              <div className="flex justify-center pt-4">
                <Link href="/widget-demo" className="px-8 py-3 bg-primary-container text-on-primary-fixed rounded-xl text-institutional hover:brightness-110 transition-all">View Widget Demo →</Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── AGRICULTURE ─── */}
        {activeSection === "agriculture" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-green-500">grass</span> Agriculture Index</h1>
            <span className="px-3 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-8 inline-block">Post-Season</span>
            <p className="text-xs text-zinc-500 italic mb-6">Dual-Threshold Linear Interpolation (DTLI)</p>
            <div className={panelClass}>
              <p className="text-sm font-light leading-relaxed">Hedge against cumulative rainfall variance. Payout scales linearly as precipitation drops from Strike to Exit threshold.</p>
              <div className={codeBlockClass}><pre className="text-green-400">{`// Fractional loss between Strike and Exit
Ratio = Clamp((Strike - Actual) / (Strike - Exit), 0, 1);
Payout = maxPayout × Ratio;`}</pre></div>
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Risk Factors</h5>
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Strike</strong> — mm level where partial payout begins (e.g. 80% of historical mean)</p>
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Exit</strong> — Catastrophic level triggering 100% payout</p>
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Oracle</strong> — NOAA / GHCND cumulative rainfall</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── ENERGY ─── */}
        {activeSection === "energy" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-amber-500">bolt</span> Energy Hedge</h1>
            <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-8 inline-block">Daily Settlement</span>
            <p className="text-xs text-zinc-500 italic mb-6">Incremental Degree Day Accumulator (IDDA)</p>
            <div className={panelClass}>
              <p className="text-sm font-light leading-relaxed">Protects against utility price spikes from extreme climate. Tracks HDD/CDD against 18.3°C base.</p>
              <div className={codeBlockClass}><pre className="text-amber-400">{`HDD = Max(0, 18.3 - MeanTemp);
Payout = Min(MaxPayout, HDD × TickValue);`}</pre></div>
              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Tick Value</strong> — USD per Degree Day unit</p>
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Resolution</strong> — 24h oracle cycle</p>
                <p className="text-[10px] text-zinc-500">• <strong className="text-on-surface">Oracle</strong> — OpenWeatherMap</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── CATASTROPHE ─── */}
        {activeSection === "catastrophe" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-red-500">earthquake</span> Catastrophe Proximity</h1>
            <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-8 inline-block">Incident Trigger</span>
            <p className="text-xs text-zinc-500 italic mb-6">Haversine Magnitude-Weighted Tiers</p>
            <div className={panelClass}>
              <p className="text-sm font-light leading-relaxed">Payout determined by Haversine distance from user coordinates to USGS-verified epicenter (&gt;5.0 Mw).</p>
              <div className={codeBlockClass}><pre className="text-red-400">{`Dist = Haversine(User, Epicenter);
If (Dist < 25km) → 100% Payout;
If (Dist < 50km) → 30% Payout;
Else → 0;`}</pre></div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <h6 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stabilization</h6>
                <p className="text-[10px] text-zinc-500 leading-relaxed">60-minute lag allows USGS to refine epicenter coordinates and magnitude data before triggering on-chain payout.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── BINARY (Maritime & Travel) ─── */}
        {activeSection === "binary" && (
          <div className={sectionClass}>
            <h1 className={h1Class}>Maritime &amp; Travel (Binary)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-2xl specular-border border-t-4 border-indigo-500 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-indigo-400">sailing</span> Maritime Wind</h3>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">Binary 100% payout if sustained wind ≥ 35 knots at target IMO location. Oracle: OpenWeatherMap.</p>
                <div className="p-2.5 bg-surface-container-highest rounded text-[10px] mono-data text-indigo-300 uppercase">Strike: WIND_GUST ≥ 35 KNT</div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl specular-border border-t-4 border-blue-500 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-400">flight_takeoff</span> Travel Solutions</h3>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">Binary payout if verified arrival lag ≥ 120 minutes. Oracle: FlightAware AeroAPI.</p>
                <div className="p-2.5 bg-surface-container-highest rounded text-[10px] mono-data text-blue-300 uppercase">Strike: ARR_LAG ≥ 120 MIN</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PREMIUM PRICING ─── */}
        {activeSection === "premium-pricing" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-amber-400">receipt_long</span> Premium Pricing</h1>
            <div className={panelClass}>
              <p className="text-zinc-300 font-light leading-relaxed">Premiums are priced using an <strong>Expected Loss + Margin</strong> model. The base expected loss is derived from historical data, then a protocol margin is applied.</p>
              <div className={codeBlockClass}><pre className="text-amber-400">{`// TravelSolutions.quotePremium()
BaseExpectedLoss = (RequestedPayout × nDelayed) / nTotal;
Premium = BaseExpectedLoss × (10000 + 500) / 10000;
// PROTOCOL_MARGIN = 500 BPS (5% markup on expected loss)`}</pre></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center"><p className="text-lg font-black">nDelayed / nTotal</p><p className="text-[10px] text-zinc-500">Historical frequency ratio</p></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center"><p className="text-lg font-black">5%</p><p className="text-[10px] text-zinc-500">Protocol Margin (500 BPS)</p></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center"><p className="text-lg font-black">EIP-712</p><p className="text-[10px] text-zinc-500">Signed quote verification</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ─── LP TOKENOMICS ─── */}
        {activeSection === "lp-tokenomics" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-purple-400">token</span> LP Share Tokenomics</h1>
            <div className={panelClass}>
              <p className="text-zinc-300 font-light leading-relaxed">LP shares follow an <strong>ERC-4626-style vault model</strong>. Shares represent a proportional claim on the pool&apos;s total assets (local USDT + Aave aUSDT balance).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-surface-container-highest rounded-xl border border-purple-500/20 space-y-2">
                  <h4 className="text-purple-400 font-bold text-sm">Deposit (Mint Shares)</h4>
                  <pre className="mono-data text-[11px] text-purple-300">{`// First depositor: 1:1 ratio
If (totalShares == 0)
  shares = amount;
Else
  shares = (amount × totalShares) / totalAssets;`}</pre>
                </div>
                <div className="p-5 bg-surface-container-highest rounded-xl border border-purple-500/20 space-y-2">
                  <h4 className="text-purple-400 font-bold text-sm">Withdraw (Burn Shares)</h4>
                  <pre className="mono-data text-[11px] text-purple-300">{`withdraw = (shares × totalAssets) / totalShares;
// Proportional claim on USDT + aUSDT
// No withdrawal cooldown currently`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ORACLE FLOW ─── */}
        {activeSection === "oracle-flow" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-cyan-400">device_hub</span> Oracle Data Flow</h1>
            <div className={panelClass}>
              <h3 className="text-xl font-bold">Tech Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2"><h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Frontend</h4><p className="text-[10px] text-zinc-500 leading-relaxed"><strong>Next.js 14</strong> + <strong>Tailwind CSS</strong>. Reactive HUD for risk management.</p></div>
                <div className="space-y-2"><h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest">On-Chain</h4><p className="text-[10px] text-zinc-500 leading-relaxed"><strong>Solidity 0.8.24</strong> via <strong>Foundry</strong>. <strong>OpenZeppelin UUPS</strong> for upgradability.</p></div>
                <div className="space-y-2"><h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest">Relayer</h4><p className="text-[10px] text-zinc-500 leading-relaxed"><strong>Node.js</strong> service for EIP-712 quote signing and API proxying.</p></div>
              </div>
              <h3 className="text-xl font-bold italic pt-10 border-t border-white/5">Settlement Pipeline</h3>
              <div className="flex flex-col gap-3">
                {[
                  { n: "1", c: "blue", title: "External Data Capture", desc: "Relayer polls FlightAware (AeroAPI), NOAA GHCND, and OpenWeatherMap." },
                  { n: "2", c: "purple", title: "Risk Simulation", desc: "Relayer performs off-chain risk calculations for instant, EIP-712 signed premium quotes." },
                  { n: "3", c: "amber", title: "Chainlink DON Consensus", desc: "Multiple DON nodes verify external data payload using oracle proofs." },
                  { n: "4", c: "red", title: "On-Chain Validation", desc: "Parametric Product contract verifies the oracle signature and data integrity." },
                  { n: "5", c: "emerald", title: "Atomic Disbursement", desc: "LP Pool releases the reserved Max Payout directly to the policyholder." },
                ].map(s => (
                  <div key={s.n} className={`flex items-center gap-4 p-4 bg-${s.c}-500/5 rounded-xl border border-${s.c}-500/10`}>
                    <div className={`w-8 h-8 rounded-full bg-${s.c}-500/20 flex items-center justify-center text-${s.c}-400 font-black text-xs shrink-0`}>{s.n}</div>
                    <div><p className="text-xs font-bold">{s.title}</p><p className="text-[10px] text-zinc-500">{s.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── POLICY STATES ─── */}
        {activeSection === "policy-states" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-sky-400">swap_horiz</span> Policy Lifecycle States</h1>
            <div className={panelClass}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { n: "0", label: "Active", color: "blue", desc: "Policy is live, oracle is monitoring. Max payout is locked in the LP pool." },
                  { n: "1", label: "Claimed", color: "emerald", desc: "Event breached threshold. USDT payout was released to the policyholder." },
                  { n: "2", label: "Expired", color: "zinc", desc: "Policy expired without a trigger. Max payout reservation released to LP pool." },
                ].map(s => (
                  <div key={s.n} className={`p-5 bg-${s.color}-500/5 border border-${s.color}-500/10 rounded-xl text-center space-y-2`}>
                    <div className={`text-3xl font-black text-${s.color}-400`}>{s.n}</div>
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] text-zinc-500">{s.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 italic">Transitions: Active → Claimed (via executeClaim with positive trigger) or Active → Expired (via expirePolicy / Chainlink Keepers after expiresAt timestamp).</p>
            </div>
          </div>
        )}

        {/* ─── FEES ─── */}
        {activeSection === "fees" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-orange-400">price_change</span> Fee Structure</h1>
            <div className={panelClass}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-white/10"><th className="py-3 text-institutional">Fee</th><th className="py-3 text-institutional">Rate</th><th className="py-3 text-institutional">Paid By</th><th className="py-3 text-institutional">Destination</th></tr></thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-white/5"><td className="py-3 font-bold">Origination Fee</td><td>3% (300 BPS)</td><td>Policyholder</td><td>Protocol Treasury</td></tr>
                    <tr className="border-b border-white/5"><td className="py-3 font-bold">Protocol Margin</td><td>5% (500 BPS)</td><td>Policyholder</td><td>Baked into premium pricing</td></tr>
                    <tr className="border-b border-white/5"><td className="py-3 font-bold">Performance Fee</td><td>10% (1000 BPS)</td><td>LP Yield</td><td>Protocol Treasury</td></tr>
                    <tr><td className="py-3 font-bold">Withdrawal Fee</td><td>0%</td><td>LP</td><td>N/A — no withdrawal fee</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── CONTRACTS ─── */}
        {activeSection === "contracts" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-violet-400">code</span> Contract Addresses</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-8">Arbitrum Sepolia Testnet (Chain ID: 421614)</p>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-amber-400">account_balance</span> Core Architecture</h3>
            <div className="grid grid-cols-1 gap-4 mb-12">{CONTRACT_LIST.map(c => <ContractCard key={c.name} {...c} />)}</div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-emerald-400">payments</span> Sector Liquidity Pools</h3>
            <p className="text-xs text-zinc-500 italic mb-4">All pools utilize the ReflexLiquidityPool engine.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">{POOL_LIST.map(c => <ContractCard key={c.name} {...c} color="emerald" />)}</div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-blue-400">developer_board</span> Parametric Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{PRODUCT_LIST.map(c => <ContractCard key={c.name} {...c} color="blue" />)}</div>
          </div>
        )}

        {/* ─── SECURITY ─── */}
        {activeSection === "security" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-emerald-400">verified</span> Protocol Guardrails</h1>
            <div className={panelClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm border-b border-white/5 pb-2">Solvency Invariant</h4>
                  <div className={codeBlockClass}><pre className="text-emerald-400">{`totalAssets() >= totalMaxPayouts
// Checked in routePremiumAndReserve()
// Enforced: new policies revert if violated`}</pre></div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-sm border-b border-white/5 pb-2">Oracle Trust</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Multi-node Chainlink DON consensus. EIP-712 signed quotes prevent unauthorized premium manipulation. Only the authorizedQuoter can sign valid quotes.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                {[
                  { val: "640k+", label: "Fuzz Sequences" },
                  { val: "100%", label: "Escrow Backed" },
                  { val: "$10M", label: "Tx Cap" },
                  { val: "0s", label: "Claim Delay" },
                ].map(s => (
                  <div key={s.label} className="text-center"><p className="text-2xl font-black">{s.val}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{s.label}</p></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── GLOSSARY ─── */}
        {activeSection === "glossary" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-pink-400">menu_book</span> Glossary</h1>
            <div className={panelClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {GLOSSARY.map(g => (
                  <div key={g.term} className="py-2 border-b border-white/5">
                    <span className="text-xs font-bold">{g.term}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">— {g.def}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── FAQ ─── */}
        {activeSection === "faq" && (
          <div className={sectionClass}>
            <h1 className={h1Class}><span className="material-symbols-outlined text-4xl text-teal-400">help_center</span> FAQ &amp; Edge Cases</h1>
            <div className="space-y-4">
              {FAQS.map(f => (
                <div key={f.q} className="bg-surface-container-lowest p-6 rounded-xl specular-border">
                  <h4 className="text-sm font-bold mb-2">{f.q}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Right TOC */}
      <aside className="hidden xl:block w-56 flex-shrink-0 border-l border-white/5 pl-8 pt-12 sticky top-24 h-[calc(100vh-6rem)]">
        <span className="text-institutional block mb-6">Quick Navigation</span>
        <ul className="flex flex-col gap-2">
          {SIDEBAR_SECTIONS.flatMap(s => s.items).slice(0, 8).map(item => (
            <li key={item.id}><button onClick={() => setActiveSection(item.id)} className={`text-sm transition-colors ${activeSection === item.id ? "text-primary" : "text-zinc-500 hover:text-on-surface"}`}>{item.label}</button></li>
          ))}
        </ul>
        <div className="mt-12 bg-surface-container-low p-4 rounded-lg specular-border">
          <p className="text-zinc-500 text-xs mb-3">Read Whitepaper</p>
          <Link href="/whitepaper" className="text-sm text-secondary hover:underline flex items-center gap-1">Full Whitepaper →</Link>
        </div>
      </aside>
    </div>
  );
}
