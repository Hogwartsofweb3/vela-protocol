# 🌌 Vela Protocol

> **Institutional-Grade Real World Asset (RWA) Yield Aggregator on Solana.**

Vela Protocol is a non-custodial smart contract system that automatically routes stablecoin deposits to the highest-yielding RWA platforms (like Ondo Finance) and DeFi lending markets (like Kamino). 

Built for the **Colosseum Frontier Hackathon (2026)**.

---

## ⚡ The Problem & Solution
While tokenized Treasuries (like BUIDL and USDY) offer safe, predictable yield, their rates are static. Meanwhile, DeFi lending protocols offer higher, dynamic yields that fluctuate based on market demand. 

**Vela combines both.** 
Users deposit USDC into a single, seamless vault. Off-chain intelligence monitors global rates. When DeFi yields spike, Vela automatically rebalances the vault to capture the premium. When DeFi yields drop, Vela retreats to the safety of US Treasuries. 

One deposit. Maximum risk-adjusted yield. Zero manual management.

---

## 🏗️ Architecture
Vela operates on a robust 3-layer architecture:
1. **Smart Contracts (Anchor):** Non-custodial vaults, mathematical proofs, and Token-2022 Interest-Bearing Mints.
2. **Intelligence Layer (Node.js Keeper):** An off-chain router that evaluates live APYs from Ondo and Kamino and commands the vault to rebalance.
3. **Application Layer (Next.js):** A blazing-fast, consumer-friendly dashboard for deposits and analytics.

*For a deep dive into the technical design, read our [Architecture Overview](ARCHITECTURE.md).*

---

## 🚀 Quick Start (Development)

### Prerequisites
- [Rust & Cargo](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js & npm](https://nodejs.org/en/download/)

### 1. Build the Smart Contracts
```bash
# Compile the Anchor program
anchor build

# Sync the IDL and types
npm run build
```

### 2. Run the Test Suite
The protocol is heavily guarded against math overflows and oracle manipulation.
```bash
# Run the integration test suite
anchor test
```

### 3. Start the Keeper Service
The off-chain intelligence engine requires a funded devnet wallet.
```bash
cd services/keeper
npm install

# Generate a local keypair for the keeper
solana-keygen new -o keeper.json

# Airdrop devnet SOL to pay for transactions
solana airdrop 2 $(solana-keygen pubkey keeper.json)

# Start the routing engine
npm run dev
```

---

## 🔒 Security
Vela was built with an "institutional-first" mindset.
- **Math Overflows:** All mathematical operations use strict `checked_add`/`checked_sub` guards.
- **Oracle Staleness:** The protocol completely rejects any yield data older than 60 seconds.
- **Withdrawal Delays:** 1-epoch withdrawal minimums prevent flash-loan manipulation.

---

## 📜 License
MIT License. See [LICENSE](LICENSE) for details.
