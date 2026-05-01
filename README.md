# Vela Protocol ⛵

> **One deposit. Every RWA yield on Solana, auto-compounded.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](#)

Vela is an institutional-grade Real World Asset (RWA) aggregator built on Solana. We autonomously route stablecoin liquidity to the highest-yielding RWA protocols (like Ondo, Kamino, and Hastra) while abstracting the complexity into a single, composable Token-2022 receipt: **yUSDC**.

Submitted for **Colosseum Frontier 2026**.

## 🛑 The Problem (TAM & Impact)

The $10B+ tokenized treasury market on Solana is fragmented and gatekept. To earn optimal RWA yield today, DAOs and retail users face $100k-$1M minimums, strict KYC, and manual management across 4+ separate, non-composable positions. 

**There is no Jupiter for RWA yield.** Vela bridges the gap between institutional yield and retail access.

## 💡 The Solution (Novelty & UX)

**Vela.** A single interface for autonomous institutional yield.

1. **Deposit USDC:** Receive `yUSDC` (a Token-2022 receipt). Thanks to Solana's sub-second finality, deposits are instantaneous.
2. **Auto-Routing:** Vela's autonomous Keeper network constantly monitors RWA yields. When spreads widen, the smart contract routes liquidity to the highest-yielding verified protocol.
3. **Safety Tripwire:** If yields drop below our strict 3.5% threshold, our Keeper automatically rotates funds back to US Treasuries. Total peace of mind.

## 🔒 Security & Solana Best Practices

We built Vela with an obsessive focus on security, leveraging Solana-native best practices to ensure funds are completely secure (Functionality & Security):

* **Anchor Framework:** The entire program is written in Anchor `v0.30.1`, utilizing strict `#[account(mut, signer)]` constraints, PDA seed validation, and owner checks to prevent unauthorized access.
* **Sealevel Defenses:** All arithmetic uses `checked_add` and `checked_sub` to prevent overflow exploits. We do not use raw `AccountInfo` where typed accounts are available.
* **Oracle Stale-Data Guard:** The `rebalance` instruction automatically rejects yield data older than 60 seconds and enforces a hard APY insanity cap.
* **100% Non-Custodial:** User funds are secured in PDA-owned vaults. We never have custody of user USDC.

## 🔧 How to Build On Us (Composability)

Vela is designed as a composable yield primitive for the Solana ecosystem. Other DeFi protocols, DAOs, or wallets can easily deposit into Vela via Cross-Program Invocations (CPI).

**CPI Example: Depositing into Vela from your program**
```rust
// Import the Vela Protocol CPI context
use vela_protocol::cpi::accounts::Deposit;
use vela_protocol::cpi::deposit;

// Construct the CPI context with the required accounts
let cpi_accounts = Deposit {
    user: ctx.accounts.your_user.to_account_info(),
    aggregator_state: ctx.accounts.vela_state.to_account_info(),
    user_position: ctx.accounts.vela_user_position.to_account_info(),
    usdc_mint: ctx.accounts.usdc_mint.to_account_info(),
    vault_usdc_account: ctx.accounts.vela_vault.to_account_info(),
    user_usdc_account: ctx.accounts.user_usdc.to_account_info(),
    yusdc_mint: ctx.accounts.yusdc_mint.to_account_info(),
    user_yusdc_account: ctx.accounts.user_yusdc.to_account_info(),
    system_program: ctx.accounts.system_program.to_account_info(),
    token_program: ctx.accounts.token_program.to_account_info(),
    token_2022_program: ctx.accounts.token_2022_program.to_account_info(),
    associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
};

let cpi_ctx = CpiContext::new(ctx.accounts.vela_program.to_account_info(), cpi_accounts);

// Deposit 500 USDC via CPI
deposit(cpi_ctx, 500_000_000)?;
```

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
