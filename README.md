# Vela Protocol ⛵

> **One deposit. Every RWA yield on Solana, auto-compounded.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](#)

Vela is an institutional-grade Real World Asset (RWA) aggregator built on Solana. We automatically route stablecoin liquidity to the highest-yielding RWA protocols (like Ondo, Kamino, and BackedFi) while abstracting the complexity into a single, composable Token-2022 receipt: **yUSDC**.

Submitted for **Colosseum Frontier 2026**.

## 🛑 The Problem

The tokenized treasury market on Solana is fragmented. To earn optimal RWA yield today, treasuries and DAOs must manually manage 4+ separate positions across different issuers—each with varying redemption windows, smart contract risks, and zero composability. 

**There is no Jupiter for RWA yield.**

## 💡 The Solution

**Vela.** A single interface for institutional yield.

1. **Deposit USDC:** Receive `yUSDC` (a Token-2022 receipt).
2. **Auto-Routing:** Vela's smart contract instantly routes liquidity to the highest-yielding verified RWA protocol.
3. **Safety Tripwire:** If yields drop below our 3.5% threshold, our decentralized Keeper Network automatically rotates funds back to US Treasuries. Total peace of mind.

## 🏗️ Architecture

Vela is built for maximum security and composability:

*   **Anchor Smart Contract:** Non-custodial vault holding deposits. User funds are never touched.
*   **Token-2022:** `yUSDC` utilizes the Token-2022 standard for future-proof features (transfer hooks, metadata).
*   **Keeper Network:** Off-chain TypeScript agents monitor live APYs and trigger on-chain rebalances when thresholds are met.
*   **Next.js Frontend:** A high-contrast, institutional dashboard leveraging the Solana Wallet Adapter.

## 🚀 Quick Start (Local Development)

### Prerequisites
*   Node.js v18+
*   Rust & Cargo
*   Solana CLI

### 1. Smart Contract
```bash
cd programs/vela_protocol
cargo build-sbf
```

### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the Devnet-deployed contract.

### 3. Keeper Network
```bash
cd services/keeper
npm install
npx tsx src/init.ts # Triggers oracle updates and rebalancing
```

## 👥 The Team

We are a lean, relentlessly resourceful team building the foundational liquidity layer for the next trillion dollars of tokenized assets.

*   **Michael Okoro** (@Hogwartsofweb3) - Founder & Product Director
*   **Antigravity** - Agentic Developer (Architecture, Rust/Anchor, TypeScript)

*Built end-to-end in 7 days via an Agentic Development Model.*
