# Reflex L1 — Parametric Flight Delay Insurance

Decentralized parametric micro-insurance on Avalanche. Users purchase flight delay coverage with USDC ($5 premium), and if a flight is delayed more than 2 hours, they automatically receive a $50 USDC payout — verified via zkTLS proofs.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│  ┌───────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │  Wallet   │  │    Purchase    │  │    Active Policies     │ │
│  │  Connect  │  │   Dashboard    │  │    Table + Countdown   │ │
│  └───────────┘  └────────────────┘  └────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ wagmi / viem
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ReflexParametricEscrow.sol (Fuji C-Chain)          │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ purchasePolicy│  │receiveTeleporter │  │  expirePolicy    │  │
│  │ (USDC escrow) │  │ (zkTLS verify)  │  │  (time-based)    │  │
│  └──────────────┘  └─────────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Avalanche Teleporter (AWM)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   zkTLS Relayer (Node.js)                        │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │  Cron Job    │  │  FlightAware   │  │   Reclaim zkTLS    │  │
│  │  (60s poll)  │  │  AeroAPI Query │  │   Proof Generator  │  │
│  └──────────────┘  └────────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component        | Technology                                          |
|-----------------|-----------------------------------------------------|
| Smart Contracts | Solidity ^0.8.24, Foundry                          |
| Frontend        | Next.js 14, TypeScript, Tailwind CSS, wagmi, viem  |
| Relayer         | Node.js, TypeScript, ethers.js v6, node-cron       |
| Oracles         | Reclaim Protocol zkTLS (`@reclaimprotocol/zk-fetch`)|
| Network         | Avalanche Fuji Testnet (C-Chain)                   |
| Cross-Chain     | Avalanche Teleporter (AWM)                         |

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- MetaMask or Core Wallet
- Avalanche Fuji testnet AVAX (faucet: https://faucet.avax.network/)

### 1. Clone & Configure

```bash
git clone <repo-url> && cd reflex
cp .env.example .env
# Fill in your PRIVATE_KEY, API keys, etc.
```

### 2. Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Compile
forge build

# Deploy to Fuji (update .env first)
source ../.env
forge script script/Deploy.s.sol:DeployReflex \
  --rpc-url $FUJI_RPC_URL \
  --broadcast \
  -vvvv

# Note the deployed addresses and update .env
```

### 3. Relayer

```bash
cd relayer

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Update ESCROW_CONTRACT_ADDRESS, TELEPORTER_ADDRESS, etc.

# Run
npm run dev
```

### 4. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Update NEXT_PUBLIC_ESCROW_ADDRESS, NEXT_PUBLIC_USDC_ADDRESS

# Run dev server
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
reflex/
├── contracts/                 # Foundry smart contracts
│   ├── src/
│   │   ├── ReflexParametricEscrow.sol   # Main escrow contract
│   │   ├── interfaces/
│   │   │   ├── ITeleporterMessenger.sol  # Teleporter interface
│   │   │   └── ITeleporterReceiver.sol   # Teleporter receiver
│   │   └── mocks/
│   │       ├── MockUSDC.sol             # Test USDC token
│   │       └── MockTeleporterMessenger.sol
│   ├── script/
│   │   └── Deploy.s.sol                 # Deployment script
│   ├── foundry.toml
│   └── remappings.txt
├── relayer/                   # Node.js zkTLS relayer
│   ├── src/
│   │   └── relayer.ts                   # Main relayer service
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # Next.js web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Main page
│   │   │   └── globals.css              # Global styles
│   │   ├── components/
│   │   │   ├── Providers.tsx            # wagmi/react-query
│   │   │   ├── WalletConnect.tsx        # Wallet connection
│   │   │   ├── PolicyDashboard.tsx      # Purchase flow
│   │   │   └── ActivePolicies.tsx       # Policy table
│   │   └── lib/
│   │       ├── wagmiConfig.ts           # Chain config
│   │       └── contracts.ts             # ABIs
│   └── package.json
├── .env.example
└── README.md
```

## Contract Functions

| Function | Description |
|----------|------------|
| `purchasePolicy(apiTarget, premium, payout, hours)` | Purchase parametric insurance policy |
| `receiveTeleporterMessage(chainId, sender, message)` | Receive zkTLS proof and trigger payout |
| `expirePolicy(policyId)` | Mark expired policies as inactive |
| `getUserPolicies(user)` | Get all policy IDs for a user |
| `getPolicy(policyId)` | Get full policy details |

## License

MIT
