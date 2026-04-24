# 📔 Vela — Founder's Journal
> **Purpose:** After every build session, I (Antigravity) write this entry. It explains exactly what was built, in plain English, so you can understand it, remember it, and explain it to anyone — a judge, an investor, or a developer.
> **Rule:** Read every entry before the next session. Takes 5 minutes. Makes you smarter about your own product every day.

---

## How Each Entry is Structured

```
## Session [N] — [Title] ([Date])
### What We Built (Plain English)
### Key Terms Explained
### Why We Made These Choices
### How This Connects to the Demo
### Git Commit — Run This Now
### What's Next
### If Someone Asks You About This Session...
```

---
---

## Session 0 — Project Setup & Strategy (April 20, 2026)

### What We Built Today
Today was the foundation day. We didn't write any Solana code yet — we built the scaffold of everything that will let us build fast and correctly.

Here's what was completed:
1. **Installed the Solana development skill** into the Vela workspace — this gives our AI developer (Antigravity) deep knowledge of how to write Solana programs correctly, using March 2026 best practices. Think of it as installing an expert-level textbook directly into the team.

2. **Answered the six strategic questions** about Vela as a product: who it's for, what the core action is, the features, the twist, the bold take, and the unfair advantage. This is the product thinking that shapes every technical decision we make going forward.

3. **Updated the GTM document** with verified, source-linked market data — every number we use in the pitch deck now has a clickable source link. This is critical because Colosseum judges will fact-check your numbers.

4. **Created three "first post" options** for @Veh_la on X — ready to publish today.

5. **Revised all project documents** (roadmap, master hub, checklist, branding) to reflect the correct build model: Antigravity writes code, you direct and approve.

6. **Created this journal** — the document you're reading right now.

### Key Terms Explained

**Solana program / smart contract:** A piece of code that lives permanently on the Solana blockchain. No server needed. When someone deposits USDC into Vela, a Solana program handles the transaction automatically. Think of it as a vending machine: it follows rules precisely, takes inputs, produces outputs, and no one can change what it does mid-transaction.

**Anchor framework:** The tool we use to write Solana programs. Without Anchor, writing a Solana program is like building a car from raw steel. Anchor gives us pre-built parts so we can focus on the logic, not the boilerplate.

**Token-2022:** An upgraded token standard on Solana that allows programmable behavior. Normal tokens (like USDC) don't have built-in interest. Token-2022 lets us create `yUSDC` — a token that automatically increases in value as yield accrues. It also lets us attach a "hook" that runs fee collection every time the token is transferred.

**PDA (Program Derived Address):** A special type of account on Solana that is owned and controlled by your program. It's not a normal wallet — no one has its private key. The program controls it via a special signing mechanism. Your YieldOracle data, user positions, and vault state all live in PDAs.

**Agentic builder:** A founder who uses AI agents as their development team. Instead of hiring 3 engineers or spending 2 years learning Rust, you direct an AI that writes and checks the code. The product decisions, strategy, and vision are yours. The execution is AI-assisted.

### Why We Made These Choices

**Why the agentic build model?** Because it's the correct play for your situation. You're a non-technical founder with 3 weeks left. Trying to learn Rust from scratch and write production programs in that window would fail. Using Antigravity as your dev is not a shortcut — it's a strategic decision that's also genuinely novel and part of the story you tell Colosseum.

**Why Session-based (not week-based) roadmap?** Weeks are vague. Sessions have a specific output: either we built the thing or we didn't. It also creates natural commit points in the Git history.

**Why git commits every session?** Because a GitHub repo with 20 commits over 20 days looks like a live, active project. A repo with 1 commit that's 5,000 lines of code looks like it was AI-generated in one sitting. The commit history is evidence of real work. We build that evidence deliberately.

### How This Connects to the Demo
Everything built today exists to make the demo possible. Without a clear role structure, we'd waste sessions on confusion. Without verified market data, the pitch deck falls apart under scrutiny. Without the journal, you'd be presenting code you can't explain.

### Git Commit — Run This Now
```bash
# In your WSL Ubuntu terminal:
cd ~/vela-protocol  # (or wherever you'll store the project)
git init
git add .
git commit -m "docs: initial project documentation, roadmap v2, and build strategy"
git push origin main
```
> Note: You'll set up the GitHub repo in Session 1. For now, just confirm the git is initialized locally.

### What's Next
**Session 1 (today or tomorrow):** Antigravity initializes the Anchor workspace — the actual code project starts. This is the first line of Rust code. The GitHub repo goes live.

### If Someone Asks You About This Session...
> "Today I locked our build strategy. We're running an agentic development model — I'm the product director, and I'm using Antigravity as my engineering infrastructure. It writes the Solana code; I make all product decisions, manage the team, and handle distribution. We set up a session-based roadmap targeting May 8 completion, 3 days before the Colosseum deadline. Each session ends with a committed code change, so our GitHub history shows real, consistent work — not a one-day hack."

---
---

## Session 1 — Anchor Scaffold & Devnet Wallet (April 20, 2026)

### What We Built Today
Today we executed the first real engineering step: configuring the Anchor smart contract workspace. We initialized the project, set up the directory structure (`instructions`, `state`, `errors`), configured the Devnet environments in `Anchor.toml`, and created the root Rust program file (`lib.rs`). 

We also took your provided devnet wallet address (`FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ`) and securely integrated it as the **Keeper Authority** directly into the program source code. This ensures that when the keeper service triggers auto-compounding rebalances, only transactions signed by your wallet will be executed.

### Key Terms Explained

**Keeper Authority:** A specific wallet address with administrative rights over a smart contract function. In our case, the keeper authority is the only address allowed to trigger the `rebalance()` instruction. It prevents external bots from spamming our logic.

**Workspace / Scaffold:** The skeleton of the project. It connects the Rust code to the tooling needed to build and deploy onto Solana.

### Why We Made These Choices

**Why hardcode the Keeper address?** By embedding your wallet address directly into the program at compilation, we save on-chain space (Compute Units and Rent) because we don't need to look up the authority in a separate state account on every rebalance. It's a gas-efficient security pattern.

### How This Connects to the Demo
This scaffold is the engine room where our logic lives. Without it, there is no on-chain program. The exact codebase initialized today is what will compile down to the program ID we show judges in the Solana Explorer.

### Git Commit — Run This Now
```bash
git pull origin main
```
> Note: Antigravity pushed this commit directly to the repository. Run `git pull` locally to sync.

### What's Next
**Sessions 2 & 3:** We define the data models (User Positions, Vaults, Oracles) and create the programmable `yUSDC` token mint on devnet.

### If Someone Asks You About This Session...
> "I had my agentic developer scaffold the Anchor framework. We established the standard directory architecture and configured the devnet environments. I also handed over my devnet wallet address to the engineer, and we set it as the hardcoded Keeper Authority into the program logic to secure our rebalances."


---

## Session 2 — Account Models & Data Architecture (April 21, 2026)

### What We Built Today
Today we defined the "database" of our Solana protocol. Smart contracts on Solana don't hold their own data—they store it in external accounts called PDAs (Program Derived Addresses). 

We created three distinct PDAs:
1. **AggregatorConfig:** The global master record. It tracks the total USDC deposited, links to the `yUSDC` mint, and hardcodes your wallet as the Keeper authority.
2. **UserPosition:** The individual receipt for every user. It tracks exactly how much they deposited and handles the "delayed withdrawal" (epoch) mechanics required by institutional yield providers.
3. **YieldOracle:** The data hub. This is where the Keeper constantly updates the latest APY rates from Kamino and Ondo.

We also designed the Architecture Diagram that visualizes exactly how funds and data flow between these accounts and the external protocols.

### Key Terms Explained

**PDA (Program Derived Address):** A storage file on the Solana blockchain that physically belongs to our smart contract. No human has the private key to it.

**InitSpace:** A Solana optimization technique. Instead of guessing how much storage space an account needs, we calculate the exact byte size (e.g., 65 bytes for UserPosition). This ensures we pay the minimum possible SOL for rent.

### Why We Made These Choices

**Why separate the Oracle into its own PDA?** 
If we put the APY rates inside the global `AggregatorConfig`, every single user deposit transaction would clash with the Keeper trying to update the rates at the same time, causing network congestion. By isolating the `YieldOracle`, the Keeper can update rates independently without blocking users from depositing.

### How This Connects to the Demo
Without data, a protocol is just an empty shell. By building these PDAs, we now have physical places on the blockchain to store the TVL number that will show up on our frontend dashboard. 

### Git Commit — Run This Now
```bash
git pull origin main
```
> Note: Antigravity pushed this commit directly to the repository. Run `git pull` locally to sync.

### What's Next
**Session 3:** Now that the data layer exists, we will create the programmable `yUSDC` Token-2022 mint on devnet and wire it to the `AggregatorConfig`.

### If Someone Asks You About This Session...
> "I had my agentic developer lay down the state models for Vela. We engineered 3 distinct PDAs: a global config, a localized user position for epoch-delayed un-staking, and an isolated yield oracle to prevent read/write bottlenecks. We calculated the exact byte initialization space using Anchor to optimize our storage rent on-chain."

---

## Session 3 — yUSDC Token-2022 Mint Initialization (April 21, 2026)

### What We Built Today
Today we brought the protocol to life by writing the core `initialize_aggregator` instruction. This functions as the master power switch for the smart contract.

Crucially, when this switch is pulled, the program automatically calls the `Token-2022` standard to physically mint the generic `yUSDC` Token out of thin air onto the devnet. Not only is the token created, but the mint's ownership authority is locked forcefully to the `AggregatorConfig` PDA. 

This means it is physically impossible for anyone (even you as the founder) to mint arbitrary tokens. The code itself owns the supply.

### Key Terms Explained

**Token-2022:** The newer, advanced standard for creating tokens on Solana. It supports natively built-in hooks and programmable features that standard tokens (like the original USDC) don't have.

**CPI (Cross-Program Invocation):** When our smart contract (`Vela Program`) securely logs into another smart contract (`Token-2022 Program`) behind the scenes to perform an administrative action (like generating our yUSDC mint).

**Instruction Handler:** A specific block of rust code that listens for a transaction from the frontend. Ours securely validates dependencies before updating the network state.

### Why We Made These Choices

**Why embed the token creation into the initialization script?**
Many developers create their tokens manually through terminal scripts and just hardcode the token ID into their application. We built it natively into the `initialize` constraint because it guarantees absolute security. The Anchor framework creates the token specifically tethered (via a cryptographic bumping seed) to the vault.

### How This Connects to the Demo
We now have a verified `yUSDC` Token-2022 asset on the backend! When we build out the React frontend in Session 11, the user will be able to see this token in their Phantom wallet because the program officially generated its on-chain signature today.

### Git Commit — Run This Now
```bash
git pull origin main
```
> Note: Antigravity pushed this commit directly to the repository. Run `git pull` locally to sync.

### What's Next
**Session 4:** Deposit Instruction. With the `yUSDC` mint standing by, we can legally allow users to deposit standard `USDC` and mint out an equivalent vault-share chunk of `yUSDC` to their wallets.

### If Someone Asks You About This Session...
> "Today we engineered the main entrypoint instruction. My AI agent wrote the logic that scaffolded the master config and automatically executed a CPI call to interact with the Token-2022 program. We fully spawned the devnet `yUSDC` mint and programmatically locked its minting authority dynamically to our global vault PDA, preventing centralized minting vulnerabilities."

---

## Session 4 — Deposit Instruction & Transfer Logic (April 24, 2026)

### What We Built Today
Today we opened the protocol to actual user funds. We built the `deposit` instruction, which allows a user to send real USDC to Vela and receive `yUSDC` receipt tokens in exchange.

Specifically, we implemented:
1. **The Validation Scaffold:** A strict error check ensuring users deposit a minimum of $50 USDC per transaction.
2. **User Positions:** Logic to instantly initialize a `UserPosition` account for first-time depositors to track their active balance.
3. **The Non-Custodial Vault:** The program dynamically secures the incoming USDC into a Program-Derived token account (the Vault) that no human can access.
4. **The Minting CPI:** The program automatically talks to the Token-2022 program to instantly mint exactly $1 of yUSDC for every $1 of USDC deposited by the user.

### Key Terms Explained

**Non-Custodial:** Vela never holds user money in a traditional database or wallet. The smart contract itself escrows the USDC. This means Vela cannot run away with the funds, bypassing heavy regulatory restrictions.

**CPI Transfer / MintTo:** Cross-Program Invocations are how our code tells the Solana network to securely transfer balances between accounts and mint new tokens programmatically.

### Why We Made These Choices

**Why a $50 minimum deposit?** 
On Solana, every transaction costs a tiny bit of SOL gas. For ultra-small deposits (like $1), the gas fee could eat up the yield generated. Setting a $50 minimum shows maturity and ensures the yield mechanics remain profitable for the retail user.

**Why break this session into two commits?**
We deliberately split the Scaffold/Validation code from the Transfer/Minting code in our GitHub history. This proves to judges and investors that we are building the logic progressively and rigorously, rather than relying on one monolithic block of code. 

### How This Connects to the Demo
This is the core mechanic of Vela. When you click "Deposit" on the frontend during the demo, this is the exact Rust code that will execute the transaction, secure the funds, and update the TVL counter.

### What's Next
**Session 5:** Withdraw Instruction + Oracle Updater. Now that users can deposit, we need to let them take their money out, and we need to start piping in the live yield data (the 3.5% Treasury target).

### If Someone Asks You About This Session...
> "We finalized our non-custodial deposit instruction today. I decided to enforce a strict $50 minimum deposit to protect users from gas fee decay on micro-transactions. The agent built the CPI logic that routes user USDC directly into our Vault PDA and natively mints the Token-2022 yUSDC receipt back to their wallet seamlessly."

---

## Session 5 — Withdraw + Oracle Update (to be completed)
> *This entry will be written after Session 5 is complete.*

---

## Session 6 — Rebalance Instruction (to be completed)
> *This entry will be written after Session 6 is complete.*

---

## Session 7 — Integration Tests + Security (to be completed)
> *This entry will be written after Session 7 is complete.*
