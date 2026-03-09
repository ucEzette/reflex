# Reflex — Protection Market for Parametric Micro-Insurance

Reflex is a decentralized **Protection Market** for parametric micro-insurance built on **Avalanche**. It enables trustless hedging against real-world risks (weather, aviation, maritime) via verifiable data triggers and algorithmic payout models, designed for everyday people.

---

## 🏆 The Convergence Index: Sybil-Resistant & Gasless UX

Reflex is engineered for the real world, integrating state-of-the-art technologies to create a seamless user experience.

### 1. Avalanche Teleporter & ZK-Proofs
- **Cross-Chain Consensus**: We leverage **Avalanche Teleporter** to pass ZK-proofs and settlement messages across the Avalanche ecosystem.
- **Implementation**: The `ReflexParametricEscrow.sol` contract acts as a `ITeleporterReceiver`, processing verified flight delay proofs from remote chains.

### 2. Sybil Resistance via World ID
- **The Human Layer**: Integrated **World ID** to ensure every policyholder is a unique human, preventing bot attacks on the protection market and ensuring fair access.

### 3. thirdweb Account Abstraction (Gasless Transactions)
- **The UX Layer**: Integrated **thirdweb Paymasters** and Smart Accounts to provide a 1-click, 0-gas experience. Users can purchase policies without holding AVAX or worrying about gas fees.

### 4. Chainlink Runtime Environment (CRE) Orchestration
- **The Brain**: Used to orchestrate off-chain verification and on-chain execution, acting as a secure gatekeeper via the `cre/PolicyVerifier.ts` action.

---

## 🏛️ Technical Architecture & Design

Reflex utilizes a **Hub-and-Spoke** architecture designed for modularity and high capital efficiency.

### 1. The Core Engine (Avalanche Fuji)
- **ReflexLiquidityPool (The Hub)**: A central treasury utilizing the **UUPS Upgradeable Proxy** pattern. It manages global solvency and LP accounting. 
- **Parametric Products (The Spokes)**: Stateless logic contracts that calculate payouts based on diverse mathematical models (Linear Interpolation, Tiered, Binary).
- **Aave v3 Integration**: Idle USDC is programmatically supplied to Aave v3, harvesting baseline yield for LPs.

### 2. The Oracle Fabric (Chainlink Triple-Threat)
- **Chainlink Functions**: Pulls RWA data (FlightAware, NOAA, OpenWeather) to trigger policy evaluations.
- **Chainlink Automation**: Autonomously expires policies and releases locked liquidity.
- **Chainlink CCIP**: Facilitates cross-chain settlement orchestration.

### 3. The Relayer Layer (Node.js)
- **EIP-712 Quote Signing**: Ensures cryptographically secure, time-bound premium quotes.
- **Risk Simulation**: Pre-calculating probability distributions to ensure accurate pricing.

---

## 🧬 Security & Invariants

Reflex is hardened through extensive stateful fuzzing and strictly enforced protocol invariants:
1. **Solvency Invariant**: `Total Pool Assets >= Current Locked Payouts + New Max Payout`.
2. **Deterministic Identity**: PII-free reputation layer using wallet-hash-based warrior avatars.
3. **Strict Payout Caps**: Hard `MAX_PAYOUT_CAP` per sector pool to mitigate tail-risk.

---

## 🛠️ Technology Stack

- **Blockchain**: Avalanche (Fuji Testnet, Teleporter).
- **Smart Contracts**: Solidity 0.8.24, Foundry, OpenZeppelin UUPS.
- **Infrastructure**: Chainlink (Functions, Automation, CCIP, CRE).
- **UX & Identity**: thirdweb (Account Abstraction), World ID (Sybil Resistance).
- **DeFi**: Aave v3 (Yield Optimization).
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion (3D/Glassmorphism).

---

## 🏁 Development & Verification

### 1. Smart Contract Verification
Run the comprehensive suite of **640k+ invariant tests**:
```bash
cd contracts
forge test --match-path test/SecurityInvariants.t.sol -vv
```

### 2. Local Environment
```bash
# Frontend
cd frontend && npm install && npm run dev

# Relayer
cd relayer && npm install && npm run dev
```

---

## 📄 Documentation
For detailed mathematical formulas and integration guides, see the [Detailed Technical Workflow](file:///Users/adam/.gemini/antigravity/brain/a0747a8a-ade6-4a9e-993f-a22bf31e2913/detailed_workflow.md).

## ⚖️ License
MIT

