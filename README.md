# Reflex: Decentralized Parametric Risk Marketplace

Reflex is an institutional-grade parametric risk infrastructure built on Avalanche. By replacing subjective claims assessments with deterministic smart contract logic, Reflex enables trustless, high-velocity protection for real-world risks (Aviation, Agriculture, Energy, and Maritime) using verifiable data triggers and algorithmic settlement.

---

## Technical Overview

Reflex utilizes a **Hub-and-Spoke** architecture designed for maximum capital efficiency and risk isolation.

### 1. Segmented Risk Vaults
Liquidity is compartmentalized into sector-specific pools. This design ensures that a catastrophic event in one vertical (e.g., a regional drought) cannot drain capital reserved for unrelated risks (e.g., flight delays).

### 2. Dual-Yield Architecture
Reflex eliminates the "dead capital" problem in insurance. Unutilized USDC in risk pools is automatically routed to **Aave V3** to earn baseline yield. Underwriters earn from both premium spreads and DeFi interest, while the protocol retains a 10% performance fee on the generated yield.

### 3. The Oracle Fabric
Deterministic settlement is powered by a multi-layered oracle integration:
- **Chainlink Functions:** Retrieves tamper-proof RWA data (NOAA, FlightAware, OpenWeather).
- **Chainlink Automation:** Autonomously executes payout logic the moment risk thresholds are breached.
- **Avalanche Teleporter:** Coordinates cross-chain settlement and ZK-proof verification.

### 4. Invisible UX (Account Abstraction)
Integrated with **thirdweb Smart Accounts** and **Paymasters**, Reflex provides a gasless, "one-tap" purchase experience. Users interact with the protocol via an Enterprise SDK that abstracts all blockchain complexity.

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
