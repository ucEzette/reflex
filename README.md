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

## 📜 Verified Smart Contracts (Avalanche Fuji)

Every core protocol component is verified on Snowtrace for auditability and transparency.

### 🏛️ Core Protocol Engine
| Contract | Description | Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| **ReflexParametricEscrow** | The primary micro-insurance engine and policy vault. Manages policy issuance, handles parametric triggers via **Chainlink Functions**, and coordinates cross-chain settlements via **Avalanche Teleporter**. | `0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4) |
| **ProductFactory** | A central administrative registry for all protocol products. Handles official authorization of new risk products and enforces access control for pool capital. | `0x870268aafe40b15f6bf14d42c435e6d2c7b660fe` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x870268aafe40b15f6bf14d42c435e6d2c7b660fe) |
| **Mock USDT** | The primary settlement currency for the Reflex protocol on Fuji. Used for policy purchases, liquidity provision, and payouts. | `0x4F6d9867564b31bD7Bd1ADA8376640201bf15e0B` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x4F6d9867564b31bD7Bd1ADA8376640201bf15e0B) |

### 📊 Sector Risk Pools (Liquidity Management)
*All sector pools utilize the **ReflexLiquidityPool** engine, routing idle capital to **Aave V3** for yield optimization.*

| Pool | Description | Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| **Travel Pool** | Aggregated institutional capital backing the Travel risk sector. | `0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c) |
| **Agriculture Pool** | Capital reserve for agricultural productivity and weather hazards. | `0xcb4c97087ed4c858281c39df44ae0997561ffe8c` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0xcb4c97087ed4c858281c39df44ae0997561ffe8c) |
| **Energy Pool** | Dedicated liquidity for renewable energy supply and grid risk. | `0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6) |
| **Catastrophe Pool** | High-intensity capital backing natural disaster risk protection. | `0x9d803a3066c858d714c4f5ee286eaa6249d451ab` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x9d803a3066c858d714c4f5ee286eaa6249d451ab) |
| **Maritime Pool** | Global trade liquidity backing ocean logistics and port risks. | `0x6586035d5e39e30bf37445451b43eeaeeaa1405a` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x6586035d5e39e30bf37445451b43eeaeeaa1405a) |

### 🛠️ Parametric Risk Products
| Product | Description | Address | Explorer Link |
| :--- | :--- | :--- | :--- |
| **TravelSolutions** | Flight delay protection using real-time aviation oracles to automate claim payouts. | `0x98ce0538928303b6e31a9c376a1d4a37374f1d93` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x98ce0538928303b6e31a9c376a1d4a37374f1d93) |
| **AgricultureIndex** | Drought and extreme weather protection triggered by verifiable climatic indices. | `0xfaab070d6f017955252e0a19cc532f227edb2425` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0xfaab070d6f017955252e0a19cc532f227edb2425) |
| **EnergySolutions** | Hedging for energy production shortfalls and renewable volatility. | `0x762285536f8f07fe75706bb429d230a0e7b22966` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x762285536f8f07fe75706bb429d230a0e7b22966) |
| **CatastropheProximity** | Geography-based protection against earthquakes and high-magnitude disasters. | `0x9b0378eeb2b22367183c09dc79966a32c79074c5` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x9b0378eeb2b22367183c09dc79966a32c79074c5) |
| **MaritimeSolutions** | Shipping risk management covering logistics delays and offshore disruptions. | `0x255ff883066744bf2d2914da1ebc26ff4d4b58c8` | [View on Snowtrace](https://testnet.snowscan.xyz/address/0x255ff883066744bf2d2914da1ebc26ff4d4b58c8) |

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

# Pausing Oracles (AviationStack/Weather)
# Set PAUSE_ORACLE=true in relayer/.env to stop auto-querying
```

---

## 📄 Documentation
For detailed mathematical formulas and integration guides, see the [Detailed Technical Workflow](file:///Users/adam/.gemini/antigravity/brain/a0747a8a-ade6-4a9e-993f-a22bf31e2913/detailed_workflow.md).

## ⚖️ License
MIT

