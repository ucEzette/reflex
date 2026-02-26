export default function DocsPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <div className="max-w-4xl w-full relative z-10 flex flex-col gap-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Documentation</h1>
                    <p className="text-slate-400 text-lg font-light">Learn how Reflex L1 leverages Chainlink Oracles to build decentralized parametric insurance.</p>
                </div>

                <div className="space-y-16">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            System Architecture
                        </h2>
                        <div className="glass-panel p-8 rounded-xl prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-a:text-primary">
                            <p>
                                Reflex L1 is deployed on an Avalanche EVM Subnet. The protocol consists of an upgradeable UUPS smart contract (Escrow) that locks premiums in USDC and awaits verifiable triggers from the off-chain relayer.
                            </p>
                            <h3>Key Components</h3>
                            <ul>
                                <li><strong>ReflexParametricEscrow (Solidity):</strong> Holds USDC premiums and manages policy states.</li>
                                <li><strong>Chainlink DON:</strong> Connects to Aviationstack via Chainlink Functions to securely verify real-world flight data flights.</li>
                                <li><strong>Avalanche Teleporter:</strong> Facilitates cross-subnet communication for instant payout delivery.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-neon-cyan">verified_user</span>
                            How the Chainlink Oracle Works
                        </h2>
                        <div className="glass-panel p-8 rounded-xl prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-a:text-primary">
                            <p>
                                Traditional parametric insurance relies heavily on centralized or trusted third-party APIs. Reflex L1 eliminates this trust assumption by utilizing <strong>Chainlink Functions</strong>.
                            </p>
                            <p>
                                When the smart contract queries the Aviationstack API for a flight&apos;s status, the Chainlink Decentralized Oracle Network (DON) executes the request and comes to a consensus. The smart contract verifies this Oracle proof on-chain before executing a payout, mathematically guaranteeing that the API response was not tampered with.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-400">code</span>
                            Smart Contract Reference
                        </h2>
                        <div className="glass-panel p-8 rounded-xl prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-a:text-primary">
                            <p>The core logic resides in <code>ReflexParametricEscrow.sol</code>. Key functions include:</p>
                            <ul>
                                <li><code>purchasePolicy(string memory _apiTarget, uint256 _premium, uint256 _payoutAmount, uint256 _durationHours)</code>: Initiates a new policy and locks funds.</li>
                                <li><code>fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err)</code>: The callback triggered by the Chainlink DON with the verification payload.</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
