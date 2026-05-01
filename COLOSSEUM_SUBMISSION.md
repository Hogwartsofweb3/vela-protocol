# Colosseum Hackathon Submission Form

*Copy and paste these exact text blocks into the arena.colosseum.org submission portal.*

### Project Name
Vela Protocol

### Tagline (One-Liner)
One deposit. Every RWA yield on Solana, auto-compounded.

### Project Description
The tokenized treasury market on Solana is fragmented. To earn optimal yield today, treasuries and DAOs must manually manage 4+ separate positions across Ondo, Kamino, and BackedFi—each with different redemption windows and zero composability. There is no Jupiter for RWA yield.

Vela solves this. We built an institutional-grade RWA aggregator. Users deposit USDC and receive `yUSDC`, a single, composable Token-2022 receipt. Our non-custodial Anchor vault automatically routes liquidity to the highest-yielding verified RWA protocol. 

To ensure absolute security, our off-chain Keeper network monitors live APYs. If yields drop below our 3.5% threshold, our "safety tripwire" instantly triggers an on-chain rebalance, rotating funds back to US Treasuries. Vela provides institutions with a single, frictionless primitive for on-chain yield.

### Track
DeFi / Institutional 

### Tech Stack Used
*   **Smart Contracts:** Rust, Anchor Framework
*   **Tokens:** Token-2022 Standard (Extensions)
*   **Backend / Oracles:** TypeScript, Node.js (Keeper Network)
*   **Frontend:** Next.js, React, TailwindCSS, Solana Wallet Adapter
*   **Infrastructure:** Helius RPCs

### What inspired you to build this?
We realized that while RWA tokenization is the future of DeFi, the onboarding barriers are fundamentally broken for the average user. Platforms like Ondo Finance require extensive KYC and minimum deposits upwards of $1 Million. Traditional entities like Franklin Templeton require strict licensing. 

I was personally inspired to build Vela because I wanted something better—a protocol where anyone, anywhere, can access institutional-grade RWA yields with just $50. No manual checks, no gatekeeping, just a fully automated smart contract. Furthermore, with the launch of the Solana Developer Platform (SDP) in March 2026—validating institutional demand from giants like Mastercard and Worldpay—the timing was perfect to build the foundational aggregator that sits on top of these new issuance rails.

### What was the hardest technical challenge you overcame?
Orchestrating the CPI (Cross-Program Invocation) logic between our Vault PDAs, the Token-2022 program, and the underlying yield protocols (Kamino/Ondo) was incredibly complex. We had to implement strict architectural constraints, including a 50% APY "Insanity Cap" to prevent oracle manipulation, and ensure the `aggregator_state` PDA could securely sign transactions to mint `yUSDC` without ever exposing user funds to custodial risk. We also overcame severe local compiler deadlocks by rapidly migrating our build pipeline mid-hackathon to ensure we shipped a live Devnet MVP.
