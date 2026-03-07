# Reflex — Protection Market for Parametric Micro-Insurance

Reflex is a decentralized **Protection Market** for parametric micro-insurance built on Avalanche. It allows users and businesses to hedge against real-world risks (weather, travel, catastrophe, energy) using transparent, code-driven policies triggered by Chainlink Decentralized Oracle Networks (DONs).

---

## 🏛️ Protocol Philosophy: Parametric vs. Traditional
Reflex isn't just "insurance on the blockchain"; it's a fundamental shift in how risk is managed.

| Feature | Traditional Insurance | Reflex Parametric Market |
|---|---|---|
| **Claims Process** | Manual, slow, subjective adjusting | **Automated**, instant, code-driven |
| **Transparency** | Black-box payout logic | **Open Source** mathematical models |
| **Trust Model** | Trust the institution to pay | **Trust the Math** and Oracle Consensus |
| **Liquidity** | Fragmented, inefficient | **Unified LP Pools** integrated with Aave |
| **Payout Trigger** | Qualitative damage assessment | **Quantifiable** Oracle thresholds |

---

## 🚀 Core Value Proposition
- **Instant Settlement**: No manual claims adjusting. Smart contracts pay out the moment oracle data verifies a trigger.
- **Deep Liquidity**: A shared USDC liquidity pool with Aave v3 integration for capital efficiency.
- **Parametric Variety**: 5 distinct risk products with diverse mathematical payout models (Linear, Tick, Tiered, Binary).
- **Security First**: 640k+ invariant tests and hardened contracts with reentrancy guards and payout caps.
- **Visual Excellence**: A premium, 3D-heavy interface with "Shiny Ruby" glassmorphic design and decentralized identity via classic warrior avatars.

---

## 🏗️ Technical Architecture

### 1. The On-Chain Engine (Avalanche Fuji)
- **ReflexLiquidityPool**: The central treasury. Handles LP deposits, issues `rLP` shares, and executes authorized payouts. Idle USDC is supplied to Aave v3 to generate base yield.
- **ProductFactory**: The administrative hub for deploying risk-verified parametric logic.
- **Parametric Products**: Stateless logic hubs that calculate risk-based payouts.
  - **TravelSolutions**: Binary delay trigger (>120m) using FlightAware data.
  - **AgricultureIndex**: Dual-Threshold Linear Interpolation based on rainfall variability.
  - **EnergySolutions**: Incremental Degree Day Accumulator (HDD/CDD) for climate hedging.
  - **CatastropheProximity**: Tiered payouts based on Haversine distance from epicenters.
  - **MaritimeSolutions**: Binary wind speed trigger for logistics protection.

### 2. The Oracle Fabric (Chainlink)
- **Chainlink Functions**: Pulls data from external APIs (FlightAware, NOAA, USGS, OpenWeather).
- **Consensus Layer**: DON nodes reach consensus on the data before pushing to Fuji.
- **Keepers (Automation)**: Monitoring and expiring policies that pass their timestamp without a trigger.

### 3. The Relayer Layer (Node.js)
A high-performance service that orchestrates:
- **EIP-712 Quote Signing**: Providing cryptographically secure, time-bound premium quotes.
- **Risk Simulation**: Pre-calculating risk probability to ensure accurate pricing.
- **Data Proxying**: Protecting API keys while ensuring decentralized verification.

---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity 0.8.24, Foundry, OpenZeppelin UUPS (Upgradable).
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion (3D Effects).
- **Blockchain Interface**: Wagmi, Viem, ConnectKit.
- **Oracles**: Chainlink DONs, Functions, and Keepers.
- **DeFi Integration**: Aave v3 (Liquidity Supply/Withdraw).

---

## 🧬 Security & Lifecycle Invariants
Reflex maintains strict protocol invariants verified via stateful fuzzing:
1. **Solvency**: `Pool Assets >= Sum(Max Payouts)` of all active policies. This is checked at the moment of purchase.
2. **Capital Efficiency**: Idle assets remain in Aave while preserving withdrawal liquidity.
3. **Hard Caps**: Every policy is capped to prevent catastrophic drain via oracle failure or extreme outlying events.
4. **Identity System**: Users are assigned classic warrior avatars based on a deterministic hash of their wallet address, creating a persistent on-chain identity without traditional PII.

---

## 🏁 Quick Start

### 1. Smart Contracts
```bash
cd contracts
forge install
forge build
# Run security invariants
forge test --match-path test/SecurityInvariants.t.sol -vv
```

### 2. Relayer
```bash
cd relayer
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📄 Documentation
For detailed mathematical formulas, API references, and "How to Earn" guides, see the in-app [Documentation](http://localhost:3000/docs).

## ⚖️ License
MIT
