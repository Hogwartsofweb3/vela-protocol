# Sync with Marvin: Project Walkthrough & Talking Points

*Use this document as your guide when discussing the Vela Protocol journey from start to finish with Marvin.*

---

## 1. The Origin & The Pivot
**The Initial Concept:** We started the hackathon exploring ideas around an IP investing platform and a Telegram trading agent.
**The Pivot to RWA:** 
*   We realized the Colosseum judges (and VCs) look for massive, $1B+ TAM (Total Addressable Market) opportunities. 
*   RWA tokenization is projected to be a $16T market by 2030, and stablecoins on Solana are hitting all-time highs.
*   **The Problem Identified:** We noticed that while yields are migrating on-chain (Ondo, Kamino, BackedFi), the UX for institutional treasuries is terrible. They have to manually manage multiple positions. There was no "Jupiter for Yield." 
*   **The Pivot:** We instantly pivoted to building **Vela Protocol**: an institutional-grade RWA aggregator.

## 2. The Architecture (How We Built It)
**The Smart Contract (Rust/Anchor):**
*   We built a completely non-custodial Vault. 
*   We implemented strict PDA (Program Derived Address) constraints so user funds can never be rugged or stolen. 
*   We used the new **Token-2022** standard to mint our receipt token (`yUSDC`), preparing us for future features like transfer hooks (for protocol revenue).

**The Keeper Network (TypeScript/Node.js):**
*   Smart contracts cannot pull data from the outside world by themselves. 
*   So, we built an off-chain oracle network (the Keeper). Every 60 seconds, it fetches live APYs from Ondo and Kamino. If Kamino drops below a certain threshold, the Keeper pings our smart contract to automatically rebalance the millions of dollars in the vault to Ondo.

**The Frontend (Next.js/React):**
*   We built an institutional, high-contrast dashboard connecting directly to the Solana Devnet via the Wallet Adapter.

## 3. Security & "The Safety Tripwire"
*   We didn't just build a toy; we built it with institutional security in mind.
*   **The 50% APY Insanity Cap:** We hardcoded a rule that if an oracle reports an APY higher than 50%, the contract rejects it. This prevents oracle manipulation hacks.
*   **The 3.5% Safety Tripwire:** If all yields crash below 3.5%, the protocol automatically unwinds and parks the funds back into baseline US Treasuries.

## 4. Adversity Overcome (The "Relentlessly Resourceful" Story)
*   **The Compiler Deadlock:** Mid-way through building, the Solana compiler broke because core Rust dependencies upgraded to `edition2024`, which the local compiler didn't support. 
*   **The Corporate Firewall:** We couldn't download the update because a strict corporate firewall blocked all connections to `release.solana.com`.
*   **The Solution:** Instead of giving up, we manually downgraded the entire dependency tree, stripped out the broken lock files, and ultimately pivoted to compiling in the cloud to secure our Devnet MVP. This proves we can execute through brick walls.

## 5. Execution Velocity & Agentic Dev
*   **The Core Metric:** We built a live, mathematically verified Rust smart contract, an off-chain oracle network, and a React frontend in under 7 days.
*   **The Method:** We utilized an "Agentic Development Model" (Pair programming with an AI agent) to write complex CPIs (Cross-Program Invocations) and debug token metadata in record time.

## 6. The Hackathon Submission Strategy
*   We are not pitching a "cool hackathon project." We are pitching a real company.
*   We designed a 10-slide deck with strict rules: large fonts, max 20 words per slide, heavily indexing on the "Why Now" and "The Market Moment".
*   We framed the submission exactly around the Colosseum investment thesis: solving a massive fragmentation problem in the fastest-growing sector of DeFi.
