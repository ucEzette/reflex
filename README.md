# Reflex: Decentralized Parametric Risk Marketplace

Reflex is an institutional-grade parametric risk infrastructure built on Avalanche. By replacing subjective claims assessments with deterministic smart contract logic, Reflex enables trustless, high-velocity protection for real-world risks (Aviation, Agriculture, Energy, and Maritime) using verifiable data triggers and algorithmic settlement.

---

## Technical Overview

Reflex utilizes a **Hub-and-Spoke** architecture designed for maximum capital efficiency and risk isolation.

### 1. Segmented Risk Vaults
Liquidity is compartmentalized into sector-specific pools. This design ensures that a catastrophic event in one vertical (e.g., a regional drought) cannot drain capital reserved for unrelated risks (e.g., flight delays).

### 2. Dual-Yield Architecture
Reflex eliminates the "dead capital" problem in insurance. Unutilized USDC in risk pools is automatically routed to **Aave V3** to earn baseline yield. Underwriters earn from both premium spreads and DeFi interest, while the protocol retains a 10% performance fee on the generated yield.

### ⬡ Chainlink Convergence: RWA & Oracles Track

Reflex is designed as the ultimate showcase of Chainlink's decentralized infrastructure, perfectly aligning with the **Real-World Assets (RWA) & Oracles** track. We utilize every major Chainlink service to build a fully automated, trustless parametric risk protocol.

#### 📡 1. Chainlink Functions (Off-Chain Data)
Secures external Real-World Asset data directly into the EVM. When a policy expires, `ReflexParametricEscrow.sol` calls Chainlink Functions to query premium Web2 APIs (NOAA, FlightAware, OpenWeather). The oracle strictly evaluates parameters like hurricane wind speeds or aviation delays, returning a cryptographic consensus that unlocks deterministic payouts.

#### ⚙️ 2. Chainlink Automation (Keepers)
Eliminates human dependency in the settlement lifecycle. Chainlink Automation nodes monitor the state of the risk vaults and automatically trigger time-sensitive lifecycle functions (e.g., `submitConsensusClaim()`) the exact moment a policy's condition timeframe expires.

#### 🌉 3. Chainlink CCIP (Cross-Chain Settlement)
Reflex leverages the Cross-Chain Interoperability Protocol (CCIP) natively within `ReflexCrossChainReceiver.sol` to allow global liquidity mapping. 

#### 📉 4. Chainlink Data Feeds (Solvency Audits)
Provides cryptographic proof-of-reserve. Integrated into our frontend Solvency Dashboard, Chainlink Data Feeds continuously verify the **USDT/USD** peg to guarantee that the core collateral reserves used for underwriting remain solvent and properly valued.

#### 🏗️ 5. Chainlink Runtime Environment (CRE)
To prevent massive on-chain gas costs for complex meteorological algorithms, Reflex utilizes the `@chainlink/cre-sdk` to run an off-chain `PolicyVerifier` Action. This evaluates massive data arrays securely on the edge network before committing a consolidated output on-chain.

---

### How to Test the Chainlink Integrations

**Testing Chainlink Functions:**
1. Clone the repo and navigate to the root directory.
2. Ensure you have the `.env` variables set up (see Tether WDK section).
3. Open the frontend:
```bash
cd frontend && npm install && npm run dev
```
4. Connect an Avalanche Fuji web3 wallet and purchase a "Travel" policy for a simulated flight. Ensure the expiration time is set dynamically.
5. You can view the on-chain emitted `ChainlinkRequestSent` and `ChainlinkRequestFulfilled` transaction events directly on Snowtrace mapped to the Escrow contract.

**Testing Chainlink CRE Execution:**
The local environment simulates the CRE verifier logic.
1. Navigate to the `cre/` directory:
```bash
cd cre
npm install
npm run simulate
```
This triggers the `PolicyVerifier` locally, taking mock risk variables and processing the deterministic payload using the CRE SDK.

### WDK INTEGRATION: Autonomous DeFi Agent Track

Reflex is governed by a **truly autonomous on-chain agent** designed to completely satisfy the *Autonomous DeFi Agent* track requirements. It goes far beyond a simple LLM text-generation call: it is a self-custodial, deterministic execution engine that constantly monitors the ecosystem, reasons about opportunity and risk, and signs transactions trustlessly.

#### 🧠 1. Deciding WHEN and WHY (Not Just How)
The agent operates as a persistent daemon independent of human intervention. It runs a continuous `150s` polling loop assessing real-world conditions.
- **Why**: The agent uses an LLM (running **Llama 3.3 70B** via the Vercel AI SDK) to reason over fetched context. It compares live Aave V3 yield against pre-configured targets, and checks meteorological/aviation APIs for anomalies (e.g., Cat-5 hurricanes or systemic flight groundings).
- **When**: It actively determines whether current thresholds warrant executing smart-contract tools. If an anomaly is identified, the agent uses its `UnderwriteTool` or `HarvestTool`.

#### 💸 2. USDT as Base Asset & Settlement Layer
The entire protocol and its vaults are collateralized by **USDT**. The agent's core function is protecting and managing this USDT liquidity, harvesting USDT yields from Aave, and triggering USDT payouts when parametric conditions are met.

#### 🔑 3. WDK Integration for Transaction Execution
Crucially, the agent holds its own private keys using the **Tether Wallet Development Kit (WDK)** (`@tetherto/wdk-wallet-evm`). By holding its own multi-chain EVM wallet derived from its `AGENT_MNEMONIC`, it independently signs and broadcasts transactions to the Avalanche Fuji network.

#### 🏦 4. Institutional Guardrails & DeFi Composability
To ensure the AI agent cannot act maliciously, it interacts with a dedicated supervisor contract (`ReflexAgentController.sol`). The contract strictly limits its daily actions and restricts its powers to only `harvestYield()` and `adjustOracleGasLimit()`.

---

### 👨‍⚖️ How YOU Can Run & Test the Agent

You can spin up the autonomous agent on your end to watch it evaluate risk and execute USDT-denominated transactions via the WDK wallet.

**Step 1. Configure the Environment**
Navigate to the `relayer` directory and create a `.env` file:
```env
AGENT_MNEMONIC="your 12 or 24 word standard seed phrase"
GROQ_API_KEY="your_groq_api_key" # Or use Google via AI SDK
RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
# PLUS: The private key of the admin wallet to whitelist the agent
PRIVATE_KEY="admin_private_key"
```

**Step 2. Fund & Whitelist the Agent**
The agent will derive a WDK wallet address upon booting. Fund this address with a small amount of testnet AVAX for gas. Then, authorize the agent on the smart contracts using the admin key:
```bash
cd relayer
npx ts-node scripts/whitelist_agent.ts
```

**Step 3. Run the Autonomous Daemon**
Spin up the relayer to initialize the Tether WDK wallet and start the continuous monitoring loop:
```bash
npm run dev
```

**Step 4. Force a Test Execution**
By default, the agent only spends API credits and gas if actual risks (e.g., flight delays > 120 mins, harvest yield > $50) are detected. 
To force it to execute immediately for testing, simply hop into `relayer/src/agent/agent.ts` (~ line 146), and temporarily hardcode the triggers:
```typescript
const isProfitable = true; 
const isWeatherAnomaly = true;
const isAviationAnomaly = true;
```
When the loop runs, the agent will analyze the scenario, articulate its reasoning (e.g., *"Detected high Aave yield, executing harvestYield"*), and sign the transaction automatically via the WDK wallet.

### 5. Invisible UX (Future Roadmap)
While the backend is fully autonomous, the frontend is designed for seamless user onboarding. We plan to integrate **thirdweb Smart Accounts** and **Paymasters** to provide a gasless, "one-tap" purchase experience, abstracting all blockchain complexity for retail users.

---

## Smart Contract Registry (Avalanche Fuji)

All core protocol components are verified on Snowtrace to ensure total transparency and auditable solvency.

### Core Protocol Engine

| Contract | Description | Address |
| :--- | :--- | :--- |
| **ReflexParametricEscrow** | Primary policy vault and settlement engine. | `0xd8218d83e4fe4927aff7bcd0bed316a3c39be7b4` |
| **ProductFactory** | Central registry for administrative product authorization. | `0x870268aafe40b15f6bf14d42c435e6d2c7b660fe` |
| **Mock USDT** | Primary settlement and reserve currency. | `0x4F6d9867564b31bD7Bd1ADA8376640201bf15e0B` |

### Sector Liquidity Vaults

| Vault | Risk Sector | Address |
| :--- | :--- | :--- |
| **Travel Pool** | Aviation & Transit Disruption | `0xbcfeeaea01b9ddd2f8a1092676681c6b52dbe81c` |
| **Agriculture Pool** | Climatic & Crop Yield Risk | `0xcb4c97087ed4c858281c39df44ae0997561ffe8c` |
| **Energy Pool** | Renewable Output & Grid Volatility | `0xe8b7b01b2b4ec0f400f37f2d894e3654f05852f6` |
| **Catastrophe Pool** | Extreme Event Reinsurance | `0x9d803a3066c858d714c4f5ee286eaa6249d451ab` |
| **Maritime Pool** | Global Logistics & Freight Risk | `0x6586035d5e39e30bf37445451b43eeaeeaa1405a` |

---

## Enterprise SDK (@reflex/widget-sdk)

Reflex is designed for frictionless distribution via a themeable micro-frontend widget.

### Quick Integration
```typescript
import { ReflexWidget } from '@reflex/widget-sdk';

const MyCheckout = () => (
  <ReflexWidget 
    market="travel"
    assetId="AF-123"
    theme="glassmorphism"
    onPurchase={(id) => console.log(`Policy Secured: ${id}`)}
  />
);
```

---

## Security & Solvency Invariants

The protocol is hardened through extensive stateful fuzzing (640k+ tests) enforcing the following invariants:
1. **Solvency Guarantee:** `Total Assets >= Reserved Payouts + Premium Float`.
2. **Access Control:** Only authorized risk products can reserve capital from sector vaults.
3. **Upgradeability:** All core contracts utilize the UUPS (ERC-1967) proxy pattern for secure protocol evolution.

---

## Development & Setup

### Prerequisites
- **Foundry** (Smart Contract testing)
- **Node.js v20+** (Frontend and Relayer)
- **PNPM** (Recommended for monorepo management)

### Local Implementation
```bash
# Install dependencies
pnpm install

# Start Local Environment
pnpm dev

# Run Security Suite
cd contracts && forge test --match-path test/SecurityInvariants.t.sol
```

---

## License
Reflex Protocol is released under the **MIT License**. Created for the Avalanche Global Hackathon.
