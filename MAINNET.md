# Reflex L1 - Mainnet Deployment Checklist

This document outlines the critical steps required for a safe and successful production transition to Avalanche Mainnet.

## 1. Smart Contract Hardening
- [ ] **Final Audit Review**: Ensure all finding from Phase 72 (USDC flow, Keeper hooks) are verified.
- [ ] **Contract Verification**: Verify all contracts on Snowtrace (Avalanche Explorer).
- [ ] **Ownership Renouncement**: Transfer `ProxyAdmin` and `ReflexLiquidityPool` owner to a multi-sig (e.g., Gnosis Safe).
- [ ] **Pausability Test**: Verify `pause()` and `unpause()` functionality on a mainnet fork.

## 2. Infrastructure & Oracles
- [ ] **Chainlink DON Config**: Confirm specific DON IDs for Mainnet (Rain, Degree Days, Flight Status).
- [ ] **Keeper Upkeep**: Register all product contracts on [automation.chain.link](https://automation.chain.link).
- [ ] **API Keys**: 
    - [ ] FlightAware (Production Tier)
    - [ ] OpenWeatherMap (Enterprise)
    - [ ] Stromglass.io (Commercial)
- [ ] **Monitoring**: Set up Datadog/Grafana for Relayer and Bot health.

## 3. Frontend Production Build
- [ ] **Environment Variables**:
    - `NEXT_PUBLIC_CHAIN_ID=43114` (Avalanche C-Chain)
    - Update all `CONTRACT_ADDRESS` pointers in `lib/contracts.ts` to Mainnet deployments.
- [ ] **Performance Audit**: Run Lighthouse audit and ensure >90 score in all categories.
- [ ] **Global Search Index**: Ensure `ALL_MARKETS` configuration matches Mainnet market parameters.

## 4. Liquidity & TVL
- [ ] **Initial Seed**: Deposit initial $50k+ USDC into `ReflexLiquidityPool`.
- [ ] **Risk Caps**: Set `totalMaxPayouts` limits for each market to safe initial thresholds.
- [ ] **Aave V3 Integration**: Confirm Mainnet `aUSDC` and `Pool` addresses are correct in `lib/contracts.ts`.

## 5. Security & Transparency
- [ ] **Public Status Page**: Link to `transparency/page.tsx` from main site.
- [ ] **Bug Bounty**: Launch Immunefi program for Reflex core contracts.
- [ ] **Social Proof**: Update OpenGraph and Twitter cards to point to production URLs.

---
**Status**: Ready for Final Review
**Target Date**: Q2 2026
