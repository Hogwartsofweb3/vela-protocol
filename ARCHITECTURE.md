# 🏗️ Vela Protocol Architecture

Vela is designed as a high-velocity, non-custodial RWA yield aggregator. The architecture is explicitly split into three distinct layers to ensure institutional-grade security, rapid iteration, and highly responsive user interfaces.

*(Note for Design Team: Use these three pillars for Slide 5 of the Pitch Deck).*

---

## 1. The Smart Contract Layer (Solana Anchor)
The foundation of Vela is a Rust-based smart contract deployed on the Solana blockchain using the Anchor framework.

**Key Components:**
- **Non-Custodial Vaults:** Users deposit standard `USDC` and receive `yUSDC` (a Token-2022 Interest-Bearing Mint) representing their share of the vault.
- **YieldOracle PDA:** A central, on-chain truth source that stores the live APYs of integrated platforms (e.g., Kamino, Ondo).
- **Security Guards:** 
  - Mandatory 60-second staleness checks on all oracle data.
  - Strict math overflow/underflow protection.
  - 1-epoch withdrawal delays to prevent flash-loan manipulation.

**Why this matters:** The smart contract holds the funds, but it is entirely "dumb" to the outside world. It relies entirely on mathematical proofs and strict authorizations to move money.

---

## 2. The Intelligence Layer (Off-Chain Keeper)
Smart contracts cannot query external APIs. Vela solves this with a highly resilient Node.js Keeper Service that runs off-chain 24/7.

**Key Components:**
- **Protocol Adapters:** Standardized TypeScript interfaces that translate Vela's internal logic into the specific transaction instructions required by external platforms like Kamino and Ondo.
- **The Router Engine:** Evaluates live yields. If the spread between two protocols exceeds the gas threshold (20 bps), it dynamically constructs the Solana transactions required to rebalance the vault.
- **Resilient Execution:** Powered by exponential backoff retries, ensuring 100% uptime even if Solana RPCs experience temporary degradation.

**Why this matters:** This is the "brain" of the auto-compounding feature. It abstracts the complexity of 15 different DeFi protocols into one single, optimized yield stream.

---

## 3. The Application Layer (Next.js + @solana/kit)
*(To be built in Phase 4)*
The frontend is a lightweight, blazing-fast web dashboard built on Next.js.

**Key Components:**
- **Wallet-Standard Connection:** Instant pairing with Phantom, Solflare, or Backpack.
- **Live RPC Subscriptions:** Connects directly to Helius RPC nodes to display real-time TVL, user balances, and APY without relying on a centralized database.
- **Predictive UI:** Simulates transactions locally before the user signs, displaying exact fee estimates and expected returns.

**Why this matters:** Institutions and high-net-worth individuals demand clean, predictable, and fast interfaces. By pushing all heavy lifting to the Keeper and the Smart Contract, the frontend remains a simple, elegant window into the protocol.
