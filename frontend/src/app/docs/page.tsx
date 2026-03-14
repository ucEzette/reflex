export default function DocsPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center overflow-x-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-5xl w-full relative z-10 flex flex-col gap-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-tight drop-shadow-2xl text-center md:text-left">
                        Protocol <span className="text-primary">Manual</span>
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
                                <li><a href="#overview" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary">Protocol Overview</a></li>
                                <li><a href="#policyholders" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary">For Policyholders</a></li>
                                <li><a href="#investors" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary">For Investors</a></li>
                                <li><a href="#integrations" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary">Protocol Integrations</a></li>
                                <li><a href="#autonomous-agent" className="block px-4 py-1.5 text-sm font-bold text-primary hover:text-primary transition-colors border-l border-primary">Autonomous Agent (WDK)</a></li>
                            </ul>
                        </nav>
                        <nav className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Markets</h3>
                            <ul className="space-y-1">
                                <li><a href="#agriculture" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Agriculture (Linear)</a></li>
                                <li><a href="#energy" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Energy (Tick)</a></li>
                                <li><a href="#catastrophe" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Catastrophe (Tiered)</a></li>
                                <li><a href="#binary" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Maritime & Travel</a></li>
                            </ul>
                        </nav>
                        <nav className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Technical</h3>
                            <ul className="space-y-1">
                                <li><a href="#premium-pricing" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Premium Pricing</a></li>
                                <li><a href="#lp-tokenomics" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">LP Tokenomics</a></li>
                                <li><a href="#oracle-flow" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Oracle Data Flow</a></li>
                                <li><a href="#policy-states" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Policy States</a></li>
                                <li><a href="#fees" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Fee Structure</a></li>
                                <li><a href="#contracts" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Contracts</a></li>
                                <li><a href="#security" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Security</a></li>
                                <li><a href="#glossary" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">Glossary</a></li>
                                <li><a href="#faq" className="block px-4 py-1.5 text-sm text-foreground hover:text-primary transition-colors border-l border-white/5 hover:border-primary font-light">FAQ</a></li>
                            </ul>
                        </nav>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="lg:col-span-9 space-y-28 pb-20">

                        {/* ═══════════ PROTOCOL OVERVIEW ═══════════ */}
                        <section id="overview" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
                                Protection Market Mission
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-foreground leading-relaxed font-light text-lg">
                                    Reflex is a decentralized <strong>Protection Market</strong> for Parametric Micro-Insurance. By utilizing immutable smart contracts and high-fidelity oracle data, Reflex eliminates the friction, costs, and subjectivity of traditional insurance claims processing.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <h4 className="text-primary font-bold text-sm mb-2">The Problem</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                            Traditional insurance ignores small daily losses under $50 because their administrative overhead costs more than the payout itself—leaving consumers unprotected against high-frequency, low-severity risks.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                        <h4 className="text-primary font-bold text-sm mb-2">The Reflex Solution</h4>
                                        <p className="text-[11px] text-slate-100 leading-relaxed">
                                            We replace human adjusters with <strong>Chainlink Oracle Networks</strong>. If the data says a flight is delayed 120 minutes, the contract pays out instantly. No claims forms, no waiting, no arguments.
                                        </p>
                                    </div>
                                </div>
                                <blockquote className="border-l-2 border-primary/30 pl-6 py-2 italic text-slate-400 font-light text-sm">
                                    &quot;In a Protection Market, the code is the contract, and the data is the adjuster.&quot;
                                </blockquote>
                            </div>
                        </section>

                        {/* ═══════════ FOR POLICYHOLDERS ═══════════ */}
                        <section id="policyholders" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
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
                                        { icon: "payments", color: "emerald-400", title: "4. Atomic Settlement", desc: "No manual claim button. The contract triggers USDT release to the policyholder's wallet the moment consensus is confirmed." },
                                    ].map((step) => (
                                        <div key={step.title} className="glass-panel p-6 rounded-xl space-y-3 transition-transform hover:scale-[1.02]">
                                            <div className={`w-10 h-10 rounded-lg bg-${step.color}/10 flex items-center justify-center text-${step.color}`}>
                                                <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                            </div>
                                            <h4 className="text-foreground font-bold text-sm">{step.title}</h4>
                                            <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ FOR INVESTORS ═══════════ */}
                        <section id="investors" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-4xl">trending_up</span>
                                The Investor Yield Engine
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-10">
                                <p className="text-foreground font-light leading-relaxed">
                                    Liquidity Providers (LPs) act as the protocol&apos;s underwriters. By depositing USDT, they provide collateral to back Max Payouts and earn multifaceted yield.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
                                    <div className="space-y-5">
                                        <h4 className="text-foreground font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-400">account_balance_wallet</span>
                                            Yield Waterfall
                                        </h4>
                                        {[
                                            { n: "01", title: "Premium Underwriting", desc: "97% of premiums (after 3% origination fee) flow to the LP pool as profit upon policy expiration." },
                                            { n: "02", title: "Aave v3 Yield", desc: "Idle USDT is routed to Aave for base lending interest, compounded block-by-block." },
                                            { n: "03", title: "Protocol Incentives", desc: "Future native token emissions for long-term LPs to bootstrap deep liquidity." },
                                        ].map((item) => (
                                            <div key={item.n} className="flex gap-3 items-start">
                                                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] text-emerald-400 font-bold">{item.n}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-foreground font-bold">{item.title}</p>
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

                        {/* ═══════════ PROTOCOL INTEGRATIONS ═══════════ */}
                        <section id="integrations" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">integration_instructions</span>
                                Protocol Integrations
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-12">
                                {/* Avalanche */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <span className="material-symbols-outlined text-red-400 text-xl">layers</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Avalanche Ecosystem</h3>
                                    </div>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        Reflex is natively built for the <strong>Avalanche Network</strong>. We utilize <strong>Avalanche Teleporter</strong> for cross-chain communication and <strong>Avalanche Fuji</strong> for our primary testnet deployment, leveraging the network's sub-second finality for rapid parametric settlement.
                                    </p>
                                </div>

                                {/* Chainlink */}
                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <span className="material-symbols-outlined text-blue-400 text-xl">hub</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Chainlink DON & Functions</h3>
                                    </div>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        The protocol utilizes <strong>Chainlink Functions</strong> and Decentralized Oracle Networks (DONs) to source high-fidelity off-chain data. The <code className="text-primary font-mono text-xs">cre/PolicyVerifier.ts</code> logic serves as a gated entry point, performing cryptographic verification of external events before authorizing payouts.
                                    </p>
                                    <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-primary border border-primary/20">
                                        {`// cre/PolicyVerifier.ts execution\nasync run(input: VerificationInput) {\n  const isValid = await verifyParametricTrigger(input.data);\n  if (!isValid) throw new Error("Trigger conditions not met");\n  return { authorized: true, payout: input.requestedPayout };\n}`}
                                    </div>
                                </div>

                                {/* World ID */}
                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100/10 rounded-lg border border-slate-100/20">
                                            <span className="material-symbols-outlined text-slate-100 text-xl">face</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">World ID (WDK Integration)</h3>
                                    </div>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        To protect the liquidity pool from Sybil attacks, we integrate <strong>World ID</strong>. Using the <strong>World ID Developer Kit (WDK)</strong>, we ensure that every parametric policy is backed by a verified human identity, maintaining the protocol's actuarial integrity.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">IDKit Widget</p>
                                            <code className="text-[9px] text-zinc-400">{'<IDKitWidget app_id="reflex" action="purchase_policy">'}</code>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">WDK Verification</p>
                                            <p className="text-xs text-foreground font-bold">ZK-Proof via Orb/Device Verification</p>
                                        </div>
                                    </div>
                                </div>

                                {/* thirdweb */}
                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                            <span className="material-symbols-outlined text-emerald-400 text-xl">bolt</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">thirdweb x Account Abstraction</h3>
                                    </div>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        The implementation utilizes <strong>thirdweb's Account Abstraction</strong> stack to enable gasless transaction flows. By using <strong>Connect SDK</strong> and <strong>In-App Wallets</strong>, we provide a seamless UX for users to secure protection without managing complex gas requirements.
                                    </p>
                                    <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-400 border border-emerald-500/20">
                                        {`// Gasless execution via thirdweb Smart Wallet\nconst result = await buyPolicy({\n  product: "Agri-Corn",\n  gasless: true // Sponsored via thirdweb Paymaster\n});`}
                                    </div>
                                </div>

                                {/* Aave V3 */}
                                <div className="space-y-4 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                            <span className="material-symbols-outlined text-indigo-400 text-xl">account_balance</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Aave V3 Yield Optimization</h3>
                                    </div>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        Reflex Liquidity Pools are deeply integrated with <strong>Aave V3</strong>. Idle USDT in the pools is automatically routed to Aave's lending markets, ensuring that liquidity providers earn base yield on their capital in addition to parametric insurance premiums.
                                    </p>
                                </div>
                            </div>
                        </section>
                        
                        {/* ═══════════ AUTONOMOUS AGENT (WDK) ═══════════ */}
                        <section id="autonomous-agent" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-400 text-4xl">psychology</span>
                                Autonomous Agent (Tether WDK)
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-foreground italic">The Protocol Backstop</h3>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        Reflex L1 is managed by a self-custodial <strong>Autonomous Risk Agent</strong>. This agent serves as a "Backstop Keeper," monitoring both on-chain yield and off-chain risks to ensure the protocol remains solvent and capital-efficient without manual intervention.
                                    </p>
                                </div>

                                {/* Flowchart Wrapper */}
                                <div className="relative py-12 px-4 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
                                    
                                    <div className="relative flex flex-col items-center gap-12 z-10">
                                        {/* Step 1: Sensing */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-2xl group">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5 transition-transform group-hover:scale-110">
                                                <span className="material-symbols-outlined text-3xl">sensors</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-foreground font-bold text-sm">1. Sensing (Data Ingestion)</h4>
                                                <p className="text-[10px] text-slate-500">Relayer polls Aave V3 yield stats and Meteorological/Aviation oracles (NOAA, FlightAware).</p>
                                            </div>
                                        </div>

                                        <div className="h-8 w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50" />

                                        {/* Step 2: Reasoning */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-2xl group">
                                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/5 transition-transform group-hover:scale-110">
                                                <span className="material-symbols-outlined text-3xl">brain</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-foreground font-bold text-sm">2. Reasoning (LLM Analysis)</h4>
                                                <p className="text-[10px] text-slate-500">Groq-hosted Llama 3.3 evaluates the context. If yield &gt; gas or risk anomaly detected, it initiates an "Acting" phase.</p>
                                            </div>
                                        </div>

                                        <div className="h-8 w-px bg-gradient-to-b from-purple-500/50 to-amber-500/50" />

                                        {/* Step 3: Acting */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-2xl group">
                                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5 transition-transform group-hover:scale-110">
                                                <span className="material-symbols-outlined text-3xl">key</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left border-l-2 border-amber-500/30 pl-4 py-1">
                                                <h4 className="text-amber-400 font-bold text-sm">3. Acting (Tether WDK)</h4>
                                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                    The Agent utilizes the <strong>Tether Wallet Development Kit (WDK)</strong> to securely sign transactions. Unlike traditional bots, the agent manages its own self-custodial EVM wallet, broadcasting instructions directly to Avalanche Fuji.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="h-8 w-px bg-gradient-to-b from-amber-500/50 to-emerald-500/50" />

                                        {/* Step 4: Settlement */}
                                        <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-2xl group">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5 transition-transform group-hover:scale-110">
                                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-foreground font-bold text-sm">4. Settlement (Blockchain)</h4>
                                                <p className="text-[10px] text-slate-500">Avalanche Fuji executes on-chain actions: <code className="text-emerald-400">harvestYield()</code> or <code className="text-emerald-400">updateProtocolMargin()</code>.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                    <div className="space-y-3">
                                        <h4 className="text-foreground font-bold text-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-400 text-sm">verified_user</span>
                                            Self-Custodial Autonomy
                                        </h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                                            By integrating the <code className="text-amber-400 text-[10px]">@tetherto/wdk-wallet-evm</code>, our agent operates outside of centralized relayers. It holds its own keys, manages gas, and executes logic as a first-class participant in the Avalanche ecosystem.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-foreground font-bold text-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">settings_suggest</span>
                                            Dynamic Risk Adjustment
                                        </h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                                            The agent can dynamically adjust risk margins by up to <strong>1000 BPS</strong> in response to detected meteorological anomalies, protecting Liquidity Providers before major disaster events are fully realized.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ MARKET MECHANICS ═══════════ */}
                        <section className="scroll-mt-32 space-y-20">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-foreground italic tracking-tighter">Market Mechanics</h2>
                                <p className="text-slate-400 font-light max-w-2xl">Industrial specification for each risk index, its mathematical model, and primary data source.</p>
                            </div>

                            {/* Agriculture */}
                            <div id="agriculture" className="glass-panel p-8 rounded-2xl border-l-4 border-green-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-3xl">grass</span> Agriculture Index
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Dual-Threshold Linear Interpolation (DTLI)</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">Post-Season</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-foreground font-light leading-relaxed">Hedge against cumulative rainfall variance. Payout scales linearly as precipitation drops from Strike to Exit threshold.</p>
                                        <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-green-400 border border-green-500/20">
                                            <div className="text-slate-600 mb-1">{'// Fractional loss between Strike and Exit'}</div>
                                            {`Ratio = Clamp((Strike - Actual) / (Strike - Exit), 0, 1);\nPayout = maxPayout × Ratio;`}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 space-y-3">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Risk Factors</h5>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Strike</strong> — mm level where partial payout begins (e.g. 80% of historical mean)</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Exit</strong> — Catastrophic level triggering 100% payout</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Oracle</strong> — NOAA / GHCND cumulative rainfall</p>
                                    </div>
                                </div>
                            </div>

                            {/* Energy */}
                            <div id="energy" className="glass-panel p-8 rounded-2xl border-l-4 border-amber-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                            <span className="material-symbols-outlined text-amber-500 text-3xl">bolt</span> Energy Hedge
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Incremental Degree Day Accumulator (IDDA)</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest">Daily Settlement</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-foreground font-light leading-relaxed">Protects against utility price spikes from extreme climate. Tracks HDD/CDD against 18.3°C base.</p>
                                        <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-amber-400 border border-amber-500/20">
                                            {`HDD = Max(0, 18.3 - MeanTemp);\nPayout = Min(MaxPayout, HDD × TickValue);`}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 space-y-3">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Factors</h5>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Tick Value</strong> — USD per Degree Day unit</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Resolution</strong> — 24h oracle cycle</p>
                                        <p className="text-[10px] text-slate-500">• <strong className="text-foreground">Oracle</strong> — OpenWeatherMap</p>
                                    </div>
                                </div>
                            </div>

                            {/* Catastrophe */}
                            <div id="catastrophe" className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 scroll-mt-32">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                            <span className="material-symbols-outlined text-red-500 text-3xl">earthquake</span> Catastrophe Proximity
                                        </h3>
                                        <p className="text-xs text-slate-500 italic mt-1">Haversine Magnitude-Weighted Tiers</p>
                                    </div>
                                    <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest">Incident Trigger</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-7 space-y-4">
                                        <p className="text-sm text-foreground font-light leading-relaxed">Payout determined by Haversine distance from user coordinates to USGS-verified epicenter (&gt;5.0 Mw).</p>
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
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-400">sailing</span> Maritime Wind
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Binary 100% payout if sustained wind ≥ 35 knots at target IMO location. Oracle: OpenWeatherMap.</p>
                                    <div className="p-2.5 bg-black/40 rounded text-[10px] font-mono text-indigo-300 uppercase">Strike: WIND_GUST ≥ 35 KNT</div>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500 space-y-4">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400">flight_takeoff</span> Travel Solutions
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">Binary payout if verified arrival lag ≥ 120 minutes. Oracle: FlightAware AeroAPI.</p>
                                    <div className="p-2.5 bg-black/40 rounded text-[10px] font-mono text-blue-300 uppercase">Strike: ARR_LAG ≥ 120 MIN</div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ PREMIUM PRICING ═══════════ */}
                        <section id="premium-pricing" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-400 text-4xl">receipt_long</span>
                                Premium Pricing Mechanics
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-foreground font-light leading-relaxed">
                                    Premiums are priced using an <strong>Expected Loss + Margin</strong> model. The base expected loss is derived from historical data, then a protocol margin is applied.
                                </p>
                                <div className="p-5 bg-black/40 rounded-xl font-mono text-xs text-amber-400 border border-amber-500/20 space-y-1">
                                    <div className="text-slate-600">{'// TravelSolutions.quotePremium()'}</div>
                                    {`BaseExpectedLoss = (RequestedPayout × nDelayed) / nTotal;\nPremium = BaseExpectedLoss × (10000 + 500) / 10000;`}
                                    <div className="text-slate-600 mt-2">{'// PROTOCOL_MARGIN = 500 BPS (5% markup on expected loss)'}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-foreground">nDelayed / nTotal</p>
                                        <p className="text-[10px] text-slate-500">Historical frequency ratio</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-foreground">5%</p>
                                        <p className="text-[10px] text-slate-500">Protocol Margin (500 BPS)</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                                        <p className="text-lg font-black text-foreground">EIP-712</p>
                                        <p className="text-[10px] text-slate-500">Signed quote verification</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ LP TOKENOMICS ═══════════ */}
                        <section id="lp-tokenomics" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-400 text-4xl">token</span>
                                LP Share Tokenomics
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <p className="text-foreground font-light leading-relaxed">
                                    LP shares follow an <strong>ERC-4626-style vault model</strong>. Shares represent a proportional claim on the pool&apos;s total assets (local USDT + Aave aUSDT balance).
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
                                            {`withdraw = (shares × totalAssets) / totalShares;\n// Proportional claim on USDT + aUSDT\n// No withdrawal cooldown currently`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ ORACLE DATA FLOW ═══════════ */}
                        <section id="oracle-flow" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-cyan-400 text-4xl">device_hub</span>
                                Oracle Data Flow & Tech Stack
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-foreground">The "How It Was Made" Architecture</h3>
                                    <p className="text-slate-400 font-light leading-relaxed text-sm">
                                        Reflex is built using a modern, event-driven stack designed for high availability and cryptographic integrity. Every component is chosen to minimize trust and maximize performance.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Frontend (The Interface)</h4>
                                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-4">
                                                Built with <strong>Next.js 14</strong> and <strong>Tailwind CSS</strong>. We use <strong>Framer Motion</strong> to achieve our signature 3D Shiny Ruby aesthetic. This isn't just a skin; it's a reactive HUD for risk management.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest">On-Chain (The L1)</h4>
                                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-4">
                                                Developed in <strong>Solidity 0.8.24</strong> using <strong>Foundry</strong>. We utilize <strong>OpenZeppelin's UUPS</strong> standards for upgradability and secure, capital-efficient vaults integrated with <strong>Aave v3</strong>.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest">Relayer (The Orchestrator)</h4>
                                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-4">
                                                A high-speed <strong>Node.js</strong> service that manages EIP-712 quote signing, API proxying, and cross-chain teleporter monitoring. It bridges the gap between Web2 data and Web3 execution.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-10 border-t border-white/5">
                                    <h3 className="text-xl font-bold text-foreground italic">Settlement Pipeline</h3>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { step: "1", label: "External Data Capture", desc: "Our Relayer polls industry-standard APIs like FlightAware (AeroAPI), NOAA GHCND, and OpenWeatherMap.", color: "blue" },
                                            { step: "2", label: "Risk Simulation", desc: "The Relayer performs off-chain risk calculations to provide instant, EIP-712 signed premium quotes to the user.", color: "purple" },
                                            { step: "3", label: "Chainlink DON Consensus", desc: "For payout verification, multiple DON nodes verify the external data payload using zkTLS or standard oracle proofs.", color: "amber" },
                                            { step: "4", label: "On-Chain Validation", desc: "The Parametric Product contract verifies the oracle's signature and the data integrity via our internal Verification Engine.", color: "red" },
                                            { step: "5", label: "Atomic Disbursement", desc: "The LP Pool releases the reserved Max Payout directly to the policyholder's address without any user intervention.", color: "emerald" },
                                        ].map((s) => (
                                            <div key={s.step} className={`flex items-center gap-4 p-4 bg-${s.color}-500/5 rounded-xl border border-${s.color}-500/10`}>
                                                <div className={`w-8 h-8 rounded-full bg-${s.color}-500/20 flex items-center justify-center text-${s.color}-400 font-black text-xs shrink-0`}>{s.step}</div>
                                                <div>
                                                    <p className="text-xs text-foreground font-bold">{s.label}</p>
                                                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ POLICY STATES ═══════════ */}
                        <section id="policy-states" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-sky-400 text-4xl">swap_horiz</span>
                                Policy Lifecycle States
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-blue-400">0</div>
                                        <p className="text-xs text-foreground font-bold">Active</p>
                                        <p className="text-[10px] text-slate-500">Policy is live, oracle is monitoring the target. Max payout is locked in the LP pool.</p>
                                    </div>
                                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-emerald-400">1</div>
                                        <p className="text-xs text-foreground font-bold">Claimed</p>
                                        <p className="text-[10px] text-slate-500">Event breached threshold. USDT payout was released to the policyholder.</p>
                                    </div>
                                    <div className="p-5 bg-slate-500/5 border border-slate-500/10 rounded-xl text-center space-y-2">
                                        <div className="text-3xl font-black text-slate-400">2</div>
                                        <p className="text-xs text-foreground font-bold">Expired</p>
                                        <p className="text-[10px] text-slate-500">Policy expired without a trigger event. Max payout reservation is released back to the LP pool.</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">Transitions: Active → Claimed (via executeClaim with positive trigger) or Active → Expired (via expirePolicy / Chainlink Keepers after expiresAt timestamp).</p>
                            </div>
                        </section>

                        {/* ═══════════ FEE STRUCTURE ═══════════ */}
                        <section id="fees" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
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
                                        <tbody className="text-xs text-foreground">
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
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-violet-400 text-4xl">code</span>
                                Contract Addresses
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-12">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-8">Avalanche Fuji Testnet (Chain ID: 43113)</p>

                                {/* Core Architecture */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-400">account_balance</span>
                                        Core Architecture
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { 
                                                name: "ReflexParametricEscrow (Proxy)", 
                                                addr: "0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4",
                                                desc: "The primary micro-insurance engine and policy vault. Manages policy issuance, handles parametric triggers via Chainlink Functions, and coordinates cross-chain settlements via Avalanche Teleporter."
                                            },
                                            { 
                                                name: "ProductFactory", 
                                                addr: "0x870268aafe40b15f6bf14d42c435e6d2c7b660fe",
                                                desc: "A central administrative registry for all protocol products. Handles official authorization of new risk products and enforces access control for pool capital."
                                            },
                                            { 
                                                name: "USDT (Testnet Mock)", 
                                                addr: "0x4F6d9867564b31bD7Bd1ADA8376640201bf15e0B",
                                                desc: "The primary settlement currency for the Reflex protocol on Fuji. Used for policy purchases, liquidity provision, and claim payouts."
                                            },
                                        ].map((c) => (
                                            <div key={c.name} className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm text-foreground font-bold">{c.name}</span>
                                                    <a href={`https://testnet.snowscan.xyz/address/${c.addr}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-violet-400 flex items-center gap-1">
                                                        Snowscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                    </a>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{c.desc}</p>
                                                <code className="text-[9px] text-slate-500 font-mono bg-black/40 px-2 py-1 rounded select-all truncate">{c.addr}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sector Liquidity Pools */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-400">payments</span>
                                        Sector Liquidity Pools
                                    </h3>
                                    <p className="text-xs text-slate-500 italic">All pools utilize the ReflexLiquidityPool engine, routing idle capital to Aave V3 for yield optimization.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { name: "Travel Liquidity Pool", addr: "0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c", desc: "Institutional capital backing the Travel risk sector." },
                                            { name: "Agriculture Liquidity Pool", addr: "0xcb4c97087ed4c858281c39df44ae0997561ffe8c", desc: "Capital reserve for agricultural productivity hazards." },
                                            { name: "Energy Liquidity Pool", addr: "0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6", desc: "Dedicated liquidity for renewable energy supply risk." },
                                            { name: "Catastrophe Liquidity Pool", addr: "0x9d803a3066c858d714c4f5ee286eaa6249d451ab", desc: "High-intensity capital for natural disaster protection." },
                                            { name: "Maritime Liquidity Pool", addr: "0x6586035d5e39e30bf37445451b43eeaeeaa1405a", desc: "Global trade liquidity backing ocean logistics." },
                                        ].map((c) => (
                                            <div key={c.name} className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm text-foreground font-bold">{c.name}</span>
                                                    <a href={`https://testnet.snowscan.xyz/address/${c.addr}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-emerald-400 flex items-center gap-1">
                                                        Snowscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                    </a>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{c.desc}</p>
                                                <code className="text-[9px] text-slate-500 font-mono bg-black/40 px-2 py-1 rounded select-all truncate">{c.addr}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Parametric Modules */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400">developer_board</span>
                                        Parametric Modules
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { name: "TravelSolutions", addr: "0x98ce0538928303b6e31a9c376a1d4a37374f1d93", desc: "Flight delay protection using aviation oracles for automated payouts." },
                                            { name: "AgricultureIndex", addr: "0xfaab070d6f017955252e0a19cc532f227edb2425", desc: "Drought and extreme weather protection via verifiable climate indices." },
                                            { name: "EnergySolutions", addr: "0x762285536f8f07fe75706bb429d230a0e7b22966", desc: "Hedging for energy shortfalls and renewable production volatility." },
                                            { name: "CatastropheProximity", addr: "0x9b0378eeb2b22367183c09dc79966a32c79074c5", desc: "Location-based protection against high-magnitude natural disasters." },
                                            { name: "MaritimeSolutions", addr: "0x255ff883066744bf2d2914da1ebc26ff4d4b58c8", desc: "Shipping risk management covering logistics delays and offshore events." },
                                        ].map((c) => (
                                            <div key={c.name} className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm text-foreground font-bold">{c.name}</span>
                                                    <a href={`https://testnet.snowscan.xyz/address/${c.addr}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-400 flex items-center gap-1">
                                                        Snowscan <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                    </a>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed mb-3">{c.desc}</p>
                                                <code className="text-[9px] text-slate-500 font-mono bg-black/40 px-2 py-1 rounded select-all truncate">{c.addr}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ SECURITY ═══════════ */}
                        <section id="security" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-4xl">verified</span>
                                Protocol Guardrails
                            </h2>
                            <div className="glass-panel p-8 rounded-2xl space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-foreground font-bold text-sm border-b border-white/5 pb-2">Solvency Invariant</h4>
                                        <div className="p-4 bg-black/40 rounded-lg text-emerald-400 font-mono text-xs">
                                            {`totalAssets() >= totalMaxPayouts\n// Checked in routePremiumAndReserve()\n// Enforced: new policies revert if violated`}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-foreground font-bold text-sm border-b border-white/5 pb-2">Oracle Trust</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">Multi-node Chainlink DON consensus. EIP-712 signed quotes prevent unauthorized premium manipulation. Only the authorizedQuoter can sign valid quotes.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                                    <div className="text-center"><p className="text-2xl font-black text-foreground">640k+</p><p className="text-[10px] text-slate-500 font-bold uppercase">Fuzz Sequences</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-foreground">100%</p><p className="text-[10px] text-slate-500 font-bold uppercase">Escrow Backed</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-foreground">$10M</p><p className="text-[10px] text-slate-500 font-bold uppercase">Tx Cap</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-foreground">0s</p><p className="text-[10px] text-slate-500 font-bold uppercase">Claim Delay</p></div>
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ GLOSSARY ═══════════ */}
                        <section id="glossary" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
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
                                        { term: "aUSDT", def: "Aave v3 interest-bearing USDT token received when USDT is supplied to Aave." },
                                        { term: "Tether WDK", def: "Wallet Development Kit — A self-custodial EVM wallet framework used by the AI Agent for on-chain execution." },
                                        { term: "Keepers", def: "Chainlink Automation nodes that trigger policy expiration when timestamps pass." },
                                        { term: "totalMaxPayouts", def: "Sum of all maximum possible payouts across active policies." },
                                        { term: "Solvency Invariant", def: "totalAssets() ≥ totalMaxPayouts must hold at all times." },
                                    ].map((g) => (
                                        <div key={g.term} className="py-2 border-b border-white/5">
                                            <span className="text-xs text-foreground font-bold">{g.term}</span>
                                            <span className="text-[10px] text-slate-500 ml-2">— {g.def}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ═══════════ FAQ ═══════════ */}
                        <section id="faq" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
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
                                        <h4 className="text-sm text-foreground font-bold mb-2">{faq.q}</h4>
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
