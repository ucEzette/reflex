export default function DocsPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center overflow-x-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-5xl w-full relative z-10 flex flex-col gap-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl text-center md:text-left">
                        Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Manual</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-light max-w-3xl leading-relaxed mx-auto md:mx-0 text-center md:text-left">
                        An industry-standard guide to the Reflex Parametric Architecture, Liquidity Dynamics, and the Event-Driven Settlement Engine.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* ── Sidebar Nav ── */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-32 h-fit">
                        <nav className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Fundamentals</h3>
                            <ul className="space-y-1">
                                <li><a href="#overview" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary">Protocol Overview</a></li>
                                <li><a href="#policyholders" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary">For Policyholders</a></li>
                                <li><a href="#investors" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary">For Investors</a></li>
                            </ul>
                        </nav>
                        <nav className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Markets</h3>
                            <ul className="space-y-1">
                                <li><a href="#agriculture" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Agriculture (Linear)</a></li>
                                <li><a href="#energy" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Energy (Tick)</a></li>
                                <li><a href="#catastrophe" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Catastrophe (Tiered)</a></li>
                                <li><a href="#binary" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Maritime & Travel</a></li>
                            </ul>
                        </nav>
                        <nav className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Technical</h3>
                            <ul className="space-y-1">
                                <li><a href="#premium-pricing" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Premium Pricing</a></li>
                                <li><a href="#lp-tokenomics" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">LP Tokenomics</a></li>
                                <li><a href="#oracle-flow" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Oracle Data Flow</a></li>
                                <li><a href="#policy-states" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Policy States</a></li>
                                <li><a href="#fees" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Fee Structure</a></li>
                                <li><a href="#contracts" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Contracts</a></li>
                                <li><a href="#security" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Security</a></li>
                                <li><a href="#glossary" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Glossary</a></li>
                                <li><a href="#faq" className="block px-4 py-1.5 text-sm text-slate-300 hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">FAQ</a></li>
                            </ul>
                        </nav>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="lg:col-span-9 space-y-28 pb-20">

                        {/* ═══════════ PROTOCOL OVERVIEW ═══════════ */}
                        <section id="overview" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
                                Protocol Mission
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-slate-300 leading-relaxed font-light text-lg">
                                    Reflex L1 is a decentralized infrastructure layer for <strong>Parametric Micro-Insurance</strong>. By utilizing immutable smart contracts and high-fidelity oracle data, Reflex eliminates the friction, costs, and subjectivity of traditional insurance claims processing.
                                </p>
                                <blockquote className="border-l-2 border-primary/30 pl-6 py-2 italic text-slate-400 font-light text-sm">
                                    &quot;Traditional insurance is a promise to investigate; Reflex is a promise to pay.&quot;
                                </blockquote>
                            </div>
                        </section>

                        {/* ═══════════ FOR POLICYHOLDERS ═══════════ */}
                        <section id="policyholders" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-neon-cyan text-4xl">verified_user</span>
                                The Policyholder Lifecycle
                            </h2>
                            <div className="space-y-8">
                                <p className="text-slate-400 font-light leading-relaxed">
                                    Reflex provides a transparent way to hedge against specific, quantifiable risks without deductible negotiations or manual claim filings.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { icon: "shopping_cart_checkout", color: "neon-cyan", title: "1. Precision Purchase", desc: "Select a target (Flight BA205, Port of Rotterdam) and define risk parameters. Premiums are calculated from historical volatility and pool utilization." },
                                        { icon: "security", color: "purple-400", title: "2. Subnet Escrow", desc: "Premium commits to the ReflexLiquidityPool. Full Max Payout is locked from the shared treasury for the entire index period." },
                                        { icon: "satellite_alt", color: "primary", title: "3. Oracle Monitoring", desc: "Relayer + Chainlink DONs monitor active targets. If an event breaches the strike threshold, a consensus verification payload is pushed to L1." },
                                        { icon: "payments", color: "emerald-400", title: "4. Atomic Settlement", desc: "No manual claim button. The contract triggers USDC release to the policyholder's wallet the moment consensus is confirmed." },
                                    ].map((step) => (
                                        <div key={step.title} className="glass-panel p-6 rounded-xl space-y-3 transition-transform hover:scale-[1.02]">
                                            <div className={`w-10 h-10 rounded-lg bg-${step.color}/10 flex items-center justify-center text-${step.color}`}>
                                                <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm">{step.title}</h4>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ FOR INVESTORS ═══════════ */}
                        <section id="investors" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-4xl">trending_up</span>
                                The Investor Yield Engine
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-10">
                                <p className="text-slate-300 font-light leading-relaxed">
                                    Liquidity Providers (LPs) act as the protocol&apos;s underwriters. By depositing USDC, they provide collateral to back Max Payouts and earn multifaceted yield.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
                                    <div className="space-y-5">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-400">account_balance_wallet</span>
                                            Yield Waterfall
                                        </h4>
                                        {[
                                            { n: "01", title: "Premium Underwriting", desc: "97% of premiums (after 3% origination fee) flow to the LP pool as profit upon policy expiration." },
                                            { n: "02", title: "Aave v3 Yield", desc: "Idle USDC is routed to Aave for base lending interest, compounded block-by-block." },
                                            { n: "03", title: "Protocol Incentives", desc: "Future native token emissions for long-term LPs to bootstrap deep liquidity." },
                                        ].map((item) => (
                                            <div key={item.n} className="flex gap-3 items-start">
                                                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] text-emerald-400 font-bold">{item.n}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white font-bold">{item.title}</p>
                                                    <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 p-5 bg-red-500/5 border border-red-500/10 rounded-xl">
                                        <h4 className="text-red-400 font-bold flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined">warning</span>
                                            Risk Profile
                                        </h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                                            LPs shoulder the risk of payouts. If an insured event fires, the payout is deducted from the shared pool. Mitigations:
                                        </p>
                                        <ul className="text-[10px] text-slate-500 space-y-1.5 font-light">
                                            <li>• <strong>$10M Hard Cap</strong> — Max exposure per single policy.</li>
                                            <li>• <strong>Non-Correlation</strong> — Risk spread across independent indices.</li>
                                            <li>• <strong>Utilization Guard</strong> — Sales halt if coverage exceeds 90% of assets.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ MARKET MECHANICS ═══════════ */}
                        <section className="scroll-mt-32 space-y-20">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-white italic tracking-tighter">Market Mechanics</h2>
                                <p className="text-slate-400 font-light max-w-2xl">Industrial specification for each risk index, its mathematical model, and primary data source.</p>
                            </div>

                            {/* Agriculture */}
                            <div id="agriculture" className="glass-panel p-8 rounded-2xl border-l-4 border-green-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-3xl">grass</span> Agriculture Index
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Dual-Threshold Linear Interpolation (DTLI)</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">Post-Season</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-slate-300 font-light leading-relaxed">Hedge against cumulative rainfall variance. Payout scales linearly as precipitation drops from Strike to Exit threshold.</p>
                                        <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-green-400 border border-green-500/20">
                                            <div className="text-slate-600 mb-1">// Fractional loss between Strike and Exit</div>
                                            {`Ratio = Clamp((Strike - Actual) / (Strike - Exit), 0, 1);\nPayout = maxPayout × Ratio;`}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 space-y-3">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Risk Factors</h5>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Strike</strong> — mm level where partial payout begins (e.g. 80% of historical mean)</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Exit</strong> — Catastrophic level triggering 100% payout</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Oracle</strong> — NOAA / GHCND cumulative rainfall</p>
                                    </div>
                                </div>
                            </div>

                            {/* Energy */}
                            <div id="energy" className="glass-panel p-8 rounded-2xl border-l-4 border-amber-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span className="material-symbols-outlined text-amber-500 text-3xl">bolt</span> Energy Hedge
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Incremental Degree Day Accumulator (IDDA)</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest">Daily Settlement</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-slate-300 font-light leading-relaxed">Protects against utility price spikes from extreme climate. Tracks HDD/CDD against 18.3°C base.</p>
                                        <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-amber-400 border border-amber-500/20">
                                            {`HDD = Max(0, 18.3 - MeanTemp);\nPayout = Min(MaxPayout, HDD × TickValue);`}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 space-y-3">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Factors</h5>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Tick Value</strong> — USD per Degree Day unit</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Resolution</strong> — 24h oracle cycle</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-white">Oracle</strong> — OpenWeatherMap</p>
                                    </div>
                                </div>
                            </div>

                            {/* Catastrophe */}
                            <div id="catastrophe" className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span className="material-symbols-outlined text-red-500 text-3xl">earthquake</span> Catastrophe Proximity
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Haversine Magnitude-Weighted Tiers</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest">Incident Trigger</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-slate-300 font-light leading-relaxed">Payout determined by Haversine distance from user coordinates to USGS-verified epicenter (&gt;5.0 Mw).</p>
                                        <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-red-400 border border-red-500/20">
                                            {`Dist = Haversine(User, Epicenter);\nIf (Dist < 25km) → 100% Payout;\nIf (Dist < 50km) → 30% Payout;\nElse → 0;`}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 p-5 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                        <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stabilization</h6>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">60-minute lag allows USGS to refine epicenter coordinates and magnitude data before triggering on-chain payout.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Binary */}
                            <div id="binary" className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-32">
                                <div className="glass-panel p-6 rounded-2xl border-t-4 border-indigo-500 space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-400">sailing</span> Maritime Wind
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Binary 100% payout if sustained wind ≥ 35 knots at target IMO location. Oracle: OpenWeatherMap.</p>
                                    <div className="p-2.5 bg-black/40 rounded text-[10px] font-mono text-indigo-300 uppercase">Strike: WIND_GUST ≥ 35 KNT</div>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500 space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400">flight_takeoff</span> Travel Solutions
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Binary payout if verified arrival lag ≥ 120 minutes. Oracle: FlightAware AeroAPI.</p>
                                    <div className="p-2.5 bg-black/40 rounded text-[10px] font-mono text-blue-300 uppercase">Strike: ARR_LAG ≥ 120 MIN</div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ PREMIUM PRICING ═══════════ */}
                        <section id="premium-pricing" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-400 text-4xl">receipt_long</span>
                                Premium Pricing Mechanics
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-slate-300 font-light leading-relaxed">
                                    Premiums are priced using an <strong>Expected Loss + Margin</strong> model. The base expected loss is derived from historical data, then a protocol margin is applied.
                                </p>
                                <div className="p-5 bg-black/40 rounded-xl font-mono text-xs text-amber-400 border border-amber-500/20 space-y-1">
                                    <div className="text-slate-600">// TravelSolutions.quotePremium()</div>
                                    {`BaseExpectedLoss = (RequestedPayout × nDelayed) / nTotal;\nPremium = BaseExpectedLoss × (10000 + 500) / 10000;`}
                                    <div className="text-slate-600 mt-2">// PROTOCOL_MARGIN = 500 BPS (5% markup on expected loss)</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-white">nDelayed / nTotal</p>
                                        <p className="text-[10px] text-slate-500">Historical frequency ratio</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-white">5%</p>
                                        <p className="text-[10px] text-slate-500">Protocol Margin (500 BPS)</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-white">EIP-712</p>
                                        <p className="text-[10px] text-slate-500">Signed quote verification</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ LP TOKENOMICS ═══════════ */}
                        <section id="lp-tokenomics" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-400 text-4xl">token</span>
                                LP Share Tokenomics
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-slate-300 font-light leading-relaxed">
                                    LP shares follow an <strong>ERC-4626-style vault model</strong>. Shares represent a proportional claim on the pool&apos;s total assets (local USDC + Aave aUSDC balance).
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 bg-black/40 rounded-xl border border-purple-500/20 space-y-2">
                                        <h4 className="text-purple-400 font-bold text-sm">Deposit (Mint Shares)</h4>
                                        <div className="font-mono text-[11px] text-purple-300">
                                            {`// First depositor: 1:1 ratio\nIf (totalShares == 0)\n  shares = amount;\nElse\n  shares = (amount × totalShares) / totalAssets;`}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-black/40 rounded-xl border border-purple-500/20 space-y-2">
                                        <h4 className="text-purple-400 font-bold text-sm">Withdraw (Burn Shares)</h4>
                                        <div className="font-mono text-[11px] text-purple-300">
                                            {`withdraw = (shares × totalAssets) / totalShares;\n// Proportional claim on USDC + aUSDC\n// No withdrawal cooldown currently`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ ORACLE DATA FLOW ═══════════ */}
                        <section id="oracle-flow" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400 text-4xl">device_hub</span>
                                Oracle Data Flow
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-slate-400 font-light leading-relaxed">The end-to-end pipeline from real-world event to on-chain settlement:</p>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { step: "1", label: "External API", desc: "FlightAware, NOAA, USGS, OpenWeather push real-time data", color: "blue" },
                                        { step: "2", label: "Relayer Service", desc: "Off-chain Node.js service polls APIs, formats payloads, validates thresholds", color: "purple" },
                                        { step: "3", label: "Chainlink DON", desc: "Multi-node consensus verifies the data payload via zkTLS proofs", color: "amber" },
                                        { step: "4", label: "On-Chain Callback", desc: "executeClaim() called on the product contract with verified data", color: "red" },
                                        { step: "5", label: "Settlement", desc: "LP Pool releases USDC to policyholder via releasePayout()", color: "emerald" },
                                    ].map((s) => (
                                        <div key={s.step} className={`flex items-center gap-4 p-4 bg-${s.color}-500/5 rounded-xl border border-${s.color}-500/10`}>
                                            <div className={`w-8 h-8 rounded-full bg-${s.color}-500/20 flex items-center justify-center text-${s.color}-400 font-black text-xs shrink-0`}>{s.step}</div>
                                            <div>
                                                <p className="text-xs text-white font-bold">{s.label}</p>
                                                <p className="text-[10px] text-slate-500">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ POLICY STATES ═══════════ */}
                        <section id="policy-states" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-sky-400 text-4xl">swap_horiz</span>
                                Policy Lifecycle States
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-blue-400">0</div>
                                        <p className="text-xs text-white font-bold">Active</p>
                                        <p className="text-[10px] text-slate-500">Policy is live, oracle is monitoring the target. Max payout is locked in the LP pool.</p>
                                    </div>
                                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-emerald-400">1</div>
                                        <p className="text-xs text-white font-bold">Claimed</p>
                                        <p className="text-[10px] text-slate-500">Event breached threshold. USDC payout was released to the policyholder.</p>
                                    </div>
                                    <div className="p-5 bg-slate-500/5 border border-slate-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-slate-400">2</div>
                                        <p className="text-xs text-white font-bold">Expired</p>
                                        <p className="text-[10px] text-slate-500">Policy expired without a trigger event. Max payout reservation is released back to the LP pool.</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">Transitions: Active → Claimed (via executeClaim with positive trigger) or Active → Expired (via expirePolicy / Chainlink Keepers after expiresAt timestamp).</p>
                            </div>
                        </section>

                        {/* ═══════════ FEE STRUCTURE ═══════════ */}
                        <section id="fees" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-orange-400 text-4xl">price_change</span>
                                Fee Structure
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Fee</th>
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Rate</th>
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Paid By</th>
                                                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs text-slate-300">
                                            <tr className="border-b border-white/5"><td className="py-3 font-bold">Origination Fee</td><td>3% (300 BPS)</td><td>Policyholder</td><td>Protocol Treasury</td></tr>
                                            <tr className="border-b border-white/5"><td className="py-3 font-bold">Protocol Margin</td><td>5% (500 BPS)</td><td>Policyholder</td><td>Baked into premium pricing</td></tr>
                                            <tr className="border-b border-white/5"><td className="py-3 font-bold">Performance Fee</td><td>10% (1000 BPS)</td><td>LP Yield</td><td>Protocol Treasury</td></tr>
                                            <tr><td className="py-3 font-bold">Withdrawal Fee</td><td>0%</td><td>LP</td><td>N/A — no withdrawal fee</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ CONTRACT ADDRESSES ═══════════ */}
                        <section id="contracts" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-violet-400 text-4xl">code</span>
                                Contract Addresses
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-4">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Avalanche Fuji Testnet (Chain ID: 43113)</p>
                                {[
                                    { name: "ReflexLiquidityPool", addr: "0xb4741AD6436023f275fD1725B0Df1042dDFd44Cc" },
                                    { name: "ProductFactory", addr: "0xEDA58669214Ab2342bfD42f41FC8E4674931D72F" },
                                    { name: "TravelSolutions", addr: "0x860f5d9e6A6F7C2A6dBe8c396CA5dc37f298f86b" },
                                    { name: "AgricultureIndex", addr: "0xA63CdC07ebC3B2deAF5faD45aabC35C2Dd86fF80" },
                                    { name: "EnergySolutions", addr: "0xc8392691CC8e09fBc34a17cbCfb607e6a9a6d663" },
                                    { name: "CatastropheProximity", addr: "0xaCbbeFe183Bff58FA57c99D0352d4cA1e720240A" },
                                    { name: "MaritimeSolutions", addr: "0xfC873105314170de85A043fc39F332e203DA7B1a" },
                                    { name: "USDC (Mock)", addr: "0x5425890298aed601595a70AB815c96711a31Bc65" },
                                ].map((c) => (
                                    <div key={c.name} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-xs text-white font-bold">{c.name}</span>
                                        <code className="text-[10px] text-slate-400 font-mono truncate max-w-[300px]">{c.addr}</code>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ═══════════ SECURITY ═══════════ */}
                        <section id="security" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-4xl">verified</span>
                                Protocol Guardrails
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold text-sm border-b border-white/5 pb-2">Solvency Invariant</h4>
                                        <div className="p-4 bg-black/40 rounded-lg text-emerald-400 font-mono text-xs">
                                            {`totalAssets() >= totalMaxPayouts\n// Checked in routePremiumAndReserve()\n// Enforced: new policies revert if violated`}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold text-sm border-b border-white/5 pb-2">Oracle Trust</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">Multi-node Chainlink DON consensus. EIP-712 signed quotes prevent unauthorized premium manipulation. Only the authorizedQuoter can sign valid quotes.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                                    <div className="text-center"><p className="text-2xl font-black text-white">640k+</p><p className="text-[10px] text-slate-500 font-bold uppercase">Fuzz Sequences</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-white">100%</p><p className="text-[10px] text-slate-500 font-bold uppercase">Escrow Backed</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-white">$10M</p><p className="text-[10px] text-slate-500 font-bold uppercase">Tx Cap</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-white">0s</p><p className="text-[10px] text-slate-500 font-bold uppercase">Claim Delay</p></div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ GLOSSARY ═══════════ */}
                        <section id="glossary" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-pink-400 text-4xl">menu_book</span>
                                Glossary
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {[
                                        { term: "Strike", def: "The threshold value at which a policy begins to pay out." },
                                        { term: "Exit", def: "The catastrophic threshold triggering maximum payout." },
                                        { term: "Tick Value", def: "USD value per unit of deviation in tick-based models." },
                                        { term: "DON", def: "Decentralized Oracle Network — Chainlink's multi-node data verification system." },
                                        { term: "Haversine", def: "Formula for calculating great-circle distance between two GPS coordinates." },
                                        { term: "HDD / CDD", def: "Heating / Cooling Degree Days — measures of temperature deviation from 18.3°C base." },
                                        { term: "BPS", def: "Basis Points — 1 BPS = 0.01%. Used for fee and margin calculations." },
                                        { term: "EIP-712", def: "Ethereum typed structured data signing standard used for quote verification." },
                                        { term: "aUSDC", def: "Aave v3 interest-bearing USDC token received when USDC is supplied to Aave." },
                                        { term: "Keepers", def: "Chainlink Automation nodes that trigger policy expiration when timestamps pass." },
                                        { term: "totalMaxPayouts", def: "Sum of all maximum possible payouts across active policies." },
                                        { term: "Solvency Invariant", def: "totalAssets() ≥ totalMaxPayouts must hold at all times." },
                                    ].map((g) => (
                                        <div key={g.term} className="py-2 border-b border-white/5">
                                            <span className="text-xs text-white font-bold">{g.term}</span>
                                            <span className="text-[10px] text-slate-500 ml-2">— {g.def}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ FAQ ═══════════ */}
                        <section id="faq" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-teal-400 text-4xl">help_center</span>
                                FAQ & Edge Cases
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { q: "What happens if the oracle goes down?", a: "Policies remain in Active (status=0) until the oracle recovers. No payouts or expirations can occur without verified data. The protocol never guesses." },
                                    { q: "What if pool utilization reaches 100%?", a: "The routePremiumAndReserve() function reverts with 'InsufficientCapitalCap'. New policy sales are effectively halted until existing policies expire or more liquidity is deposited." },
                                    { q: "Can a policy be claimed after it expires?", a: "No. Once status transitions to 2 (Expired), the executeClaim() function reverts with 'Not active'. This is enforced by the status check and verified in 640k+ fuzz sequences." },
                                    { q: "What happens during chain congestion?", a: "Chainlink Keepers will retry expiration calls. Claim settlements may be delayed by block inclusion time, but the payout amount is deterministic and cannot change." },
                                    { q: "Can LPs withdraw during active policies?", a: "Yes, but only up to the point where the solvency invariant holds. If withdrawal would cause totalAssets < totalMaxPayouts, the available withdrawal amount is reduced proportionally." },
                                    { q: "How are gas costs handled?", a: "Policyholders pay gas for purchasePolicy(). Claim execution and policy expiration gas is covered by the Relayer/Keeper infrastructure." },
                                ].map((faq) => (
                                    <div key={faq.q} className="glass-panel p-6 rounded-xl">
                                        <h4 className="text-sm text-white font-bold mb-2">{faq.q}</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-light">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
