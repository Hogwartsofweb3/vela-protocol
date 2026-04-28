# 📋 Vela — Roadmap & Build Plan v2
> **Hackathon window:** April 6 – May 11, 2026
> **Current date:** April 20, 2026 — Session 1 starts today
> **Build model:** Antigravity (AI) writes all code. Michael directs, approves, and distributes.
> **Target:** Feature-complete by **May 8** — 3 days buffer for polish + submission before the May 11 deadline.

---

## Role Split — How This Works

| Role | Owner | Responsibilities |
|---|---|---|
| **Product Director** | Michael | Approves every major decision, defines priorities, handles all community/content/distribution |
| **Agentic Developer** | Antigravity | Writes all Rust/Anchor/TypeScript code, runs builds, designs architecture, runs tests |
| **Designer** | Contractor | Brand identity, pitch deck, shareable graphics, architecture diagrams |
| **Writer/Researcher** | Contractor | Submission copy, pitch deck text, content drafts, market research |

> **Rule:** Nothing gets merged to `main` without Michael's explicit approval. I build, you decide what ships.

---

## Git Commit Strategy

> Every session closes with a commit pushed to GitHub. This creates a real, granular commit history that shows an active project — not one AI dump.

```bash
# Run this at the close of every session (in your WSL terminal, inside the project folder)
git add .
git commit -m "feat: [description from session close below]"
git push origin main
```

**Commit types:**
- `feat:` — new feature built
- `fix:` — something broken was repaired
- `test:` — tests added or improved
- `docs:` — documentation or README updated
- `chore:` — setup, config, tooling

---

## 🗺️ At a Glance — 20 Sessions, 6 Phases

| Phase | Sessions | Dates | Deliverable |
|---|---|---|---|
| 1 — Foundation | 1–4 | Apr 20–22 | Anchor scaffold + all PDAs + Token-2022 yUSDC mint |
| 2 — Core Instructions | 5–7 | Apr 23–24 | `deposit()`, `withdraw()`, `rebalance()`, `update_oracle()` |
| 3 — Infrastructure | 8–10 | Apr 25–27 | Keeper service, protocol adapters, LiteSVM tests |
| 4 — Frontend | 11–14 | Apr 28–May 1 | Full Next.js dashboard (deposit, portfolio, withdraw) |
| 5 — Integration & Security | 15–17 | May 2–4 | Real funds, security audit, performance polish |
| 6 — Submission | 18–20 | May 5–8 | README, Loom demo, Colosseum submission filed |

---

## Phase 1 — Foundation (Sessions 1–4, Apr 20–22)
> **Goal:** A deployable Anchor program on devnet with the correct account architecture and a live Token-2022 mint.

### Session 1 — Project Scaffold (Apr 20)
**Antigravity builds:**
- [x] Initialize Anchor workspace: `anchor init vela-protocol`
- [x] Configure `Anchor.toml` for devnet (correct cluster + wallet path)
- [x] Set up workspace `Cargo.toml` with correct Anchor + Solana versions
- [x] Create `programs/vela-protocol/src/lib.rs` with program shell
- [x] Create project directory structure (`instructions/`, `state/`, `errors/`)
- [x] Initialize Git repo + create `.gitignore`
- [x] Create bare GitHub repo + push initial structure

**Michael does:**
- [x] Create the GitHub repo at github.com/@Hogwartsofweb3/vela-protocol (public)
- [x] Share the repo link back so Antigravity can use it as reference

**Session 1 close — commit message:**
```
chore: initialize vela-protocol anchor workspace with project structure
```

---

### Session 2 — Account Model (Apr 21)
**Antigravity builds:**
- [x] Define `AggregatorState` PDA struct (global config: fee bps, authority, vault count)
- [x] Define `UserPosition` PDA struct (owner, shares_held, deposited_usdc, deposit_timestamp)
- [x] Define `ProtocolVault` PDA struct (protocol_id, tvl, apy_bps, last_updated)
- [x] Define `YieldOracle` PDA struct (rates array [4 slots], timestamp, is_stale flag)
- [x] Write account size calculations + `INIT_SPACE` for each
- [x] Add `#[error_code]` enum with all custom errors
- [x] Deploy empty program shell to devnet + verify it lands

**Session 2 close — commit message:**
```
feat: define AggregatorState, UserPosition, ProtocolVault, YieldOracle PDAs
```

---

### Session 3 — Token-2022 yUSDC Mint (Apr 22)
**Antigravity builds:**
- [x] Write `initialize_mint` instruction for yUSDC Token-2022 mint
- [x] Configure `InterestBearingMint` extension (rate set via oracle)
- [x] Configure `TransferHook` extension scaffold (protocol fee on every transfer)
- [x] Write `initialize` instruction for `AggregatorState` (sets authority, fee bps)
- [x] Write LiteSVM test: mint initializes correctly on devnet

**Michael does:**
- [x] Review the yUSDC mint address once deployed (it will appear in the Founder's Journal)
- [x] Post the architecture diagram to X as a "build in public" tweet (use the diagram Antigravity produces in the Journal)

**Session 3 close — commit message:**
```
feat: initialize Token-2022 yUSDC mint with InterestBearingMint and TransferHook extensions
```

---

### Session 4 — Deposit Instruction (Apr 22)
**Antigravity builds:**
- [x] Write `deposit()` instruction: validates USDC transfer in, mints yUSDC to user
- [x] Link deposit to `YieldOracle` — reads current best APY from oracle
- [x] Create `UserPosition` PDA on first deposit (init if not exists pattern, done safely)
- [x] Add signer + ownership checks on all accounts
- [x] Write LiteSVM test: deposit 100 USDC → receive yUSDC

**Session 4 close — commit message:**
```
feat: implement deposit() instruction - USDC in, yUSDC minted to user position
```

---

## Phase 2 — Core Instructions (Sessions 5–7, Apr 23–24)
> **Goal:** All three program instructions working end-to-end on devnet.

### Session 5 — Withdraw + Oracle Update Instructions (Apr 23)
**Antigravity builds:**
- [x] Write `withdraw()` instruction: burns yUSDC proportionally, returns USDC
- [x] Add 1-epoch delay guard on withdrawals (set `withdraw_eligible_after` timestamp)
- [x] Write `update_oracle()` instruction: only callable by stored keeper authority
- [x] Add oracle staleness guard (reverts if data is >60 seconds old)
- [x] Write LiteSVM tests for both instructions

**Session 5 close — commit message:**
```
feat: implement withdraw() and update_oracle() instructions with staleness guard
```

---

### Session 6 — Rebalance Instruction (Apr 24)
**Antigravity builds:**
- [x] Write `rebalance()` instruction: reads oracle, selects highest APY vault
- [x] Keeper-only authorization: reverts if not signed by stored keeper pubkey
- [x] Add delta threshold guard: only rebalances if APY spread is >20 bps
- [x] Emit Solana program logs on every rebalance (for Helius webhook capture)
- [x] Write LiteSVM test: deposit → set oracle → trigger rebalance

**Session 6 close — commit message:**
```
feat: implement rebalance() instruction with keeper auth and delta threshold guard
```

---

### Session 7 — Integration Test Pass (Apr 24)
**Antigravity builds:**
- [ ] Full LiteSVM end-to-end test: deposit → oracle update → rebalance → withdraw
- [ ] Run security checklist against all instructions (from `solana-dev-skill/references/security.md`)
- [ ] Fix any issues surfaced by security review
- [ ] Clean all `cargo clippy` warnings
- [ ] Deploy full program to devnet + test with real Phantom wallet

**Michael does:**
- [ ] Install Phantom wallet browser extension (if not already)
- [ ] Create a devnet wallet address + airdrop test SOL: https://faucet.solana.com
- [ ] Share devnet wallet address so Antigravity can set the keeper pubkey

**Session 7 close — commit message:**
```
test: add full end-to-end LiteSVM integration test and security review pass
```

---

## Phase 3 — Infrastructure (Sessions 8–10, Apr 25–27)
> **Goal:** Live off-chain keeper service writing real APY data to the oracle on devnet.

### Session 8 — Keeper Service Skeleton (Apr 25)
**Antigravity builds:**
- [ ] Scaffold Node.js keeper service (`services/keeper/`) with TypeScript
- [ ] Set up Helius SDK + RPC connection to devnet
- [ ] Write Ondo USDY APY fetcher (polls Ondo API every 30s, normalizes to bps)
- [ ] Write Kamino K-Lend APY fetcher (reads on-chain Kamino accounts via RPC)
- [ ] Write oracle writer: signs + sends `update_oracle()` transaction with fresh rates
- [ ] Keeper runs as a simple `setInterval` loop

**Session 8 close — commit message:**
```
feat: keeper service skeleton with Ondo + Kamino APY fetchers and oracle writer
```

---

### Session 9 — Protocol Adapters (Apr 26)
**Antigravity builds:**
- [ ] Ondo USDY deposit adapter: wraps Ondo's deposit API into Vela's normalized interface
- [ ] Kamino K-Lend adapter: wraps Kamino's deposit transaction builder
- [ ] Protocol router: picks highest-APY adapter, routes keeper rebalance commands
- [ ] Error handling + retry logic for failed oracle updates
- [ ] BackedFi adapter stub (skeleton only — can be activated post-hackathon)

**Session 9 close — commit message:**
```
feat: Ondo and Kamino protocol adapters with router and BackedFi stub
```

---

### Session 10 — Test Coverage + Devnet Dry Run (Apr 27)
**Antigravity builds:**
- [ ] Additional Mollusk unit tests: CU benchmarks for each instruction
- [ ] End-to-end devnet dry run: keeper live, oracle updating every 30s, confirm on explorer
- [ ] Write `ARCHITECTURE.md` (used for pitch deck Slide 5 and GitHub README)
- [ ] First clean GitHub README draft

**Michael does:**
- [ ] Review devnet explorer URL from Antigravity for the oracle PDA
- [ ] Post "here's the oracle updating live on devnet" tweet with Helius explorer screenshot (Antigravity provides the screenshot URL in the Journal)

**Session 10 close — commit message:**
```
docs: architecture overview and first README draft; keeper running on devnet
```

---

## Phase 4 — Frontend (Sessions 11–14, Apr 28–May 1)
> **Goal:** A working web dashboard deployed on Vercel. Deposit USDC, see yUSDC grow.

### Session 11 — Next.js Scaffold + Wallet Connection (Apr 28)
**Antigravity builds:**
- [ ] Scaffold: `npx create-solana-dapp@latest ./frontend` (picks framework-kit template)
- [ ] Configure `@solana/client` provider with Helius devnet RPC
- [ ] Wallet connection: `useWalletConnection()` hook + Connect/Disconnect button
- [ ] Apply Vela brand: load Google Fonts (Outfit + Inter), apply color tokens from branding doc
- [ ] Deploy to Vercel (first live URL)

**Michael does:**
- [ ] Create a Vercel account (vercel.com) if not already done
- [ ] Share Vercel project name so Antigravity can configure the deploy

**Session 11 close — commit message:**
```
feat: Next.js frontend scaffold with wallet connection and Vela brand tokens
```

---

### Session 12 — APY Dashboard (Apr 29)
**Antigravity builds:**
- [ ] APY table: reads live `YieldOracle` PDA from devnet, shows per-protocol rates
- [ ] Protocol breakdown chart (Recharts — shows Ondo vs Kamino allocation)
- [ ] Live TVL display + auto-refresh every 30s
- [ ] Loading skeleton states for all data components

**Session 12 close — commit message:**
```
feat: live APY dashboard reading YieldOracle PDA data with auto-refresh
```

---

### Session 13 — Deposit Flow UI (Apr 30)
**Antigravity builds:**
- [ ] Deposit form: USDC amount input + max button
- [ ] Transaction builder: calls `deposit()` instruction via `@solana/kit`
- [ ] Simulate before sign: shows fee estimate + APY routed to before Phantom opens
- [ ] Post-deposit: displays yUSDC balance in wallet, share price above $1.00
- [ ] Error handling: insufficient balance, blocked connection, tx expired

**Session 13 close — commit message:**
```
feat: deposit flow UI with pre-sign simulation and yUSDC balance display
```

---

### Session 14 — Portfolio View + Withdraw UI (May 1)
**Antigravity builds:**
- [ ] Portfolio view: user's yUSDC balance, yield accrued, current APY
- [ ] Share price chart: yUSDC NAV over time (pulls from keeper's logged data)
- [ ] Withdraw form: shows eligible date, queued amount, estimated USDC returned
- [ ] Mobile responsive pass across all pages
- [ ] Vercel production deploy + domain config

**Session 14 close — commit message:**
```
feat: portfolio view, yield tracker, and withdraw UI with mobile responsive layout
```

---

## Phase 5 — Integration & Security (Sessions 15–17, May 2–4)
> **Goal:** Real money in the vault, security complete, demo-ready.

### Session 15 — Mainnet Seed + Production Keeper (May 2)
**Antigravity builds:**
- [ ] Switch RPC config to mainnet-beta (Helius production endpoint)
- [ ] Configure production keeper on a VPS (Digital Ocean $5/mo droplet — Antigravity writes the setup script)
- [ ] Seed vault with $20–50 USDC real funds + confirm on Solana Explorer mainnet

**Michael does:**
- [ ] Transfer $20–50 USDC to the Vela vault wallet (Antigravity provides exact wallet address + tx instructions)
- [ ] Confirm the tx hash in Solana Explorer and share it — this tx hash appears in the pitch deck

**Session 15 close — commit message:**
```
chore: mainnet configuration, production keeper deploy, vault seeded with real funds
```

---

### Session 16 — Security Hardening (May 3)
**Antigravity builds:**
- [ ] Full security checklist audit (all 16 questions from security.md)
- [ ] Add overflow/underflow guards on all share math (`checked_add`, `checked_mul`)
- [ ] CU profiling: all instructions under 200k CUs confirmed
- [ ] Program upgrade authority set to multisig (for demo credibility)
- [ ] Fix any issues found

**Session 16 close — commit message:**
```
fix: security hardening - overflow guards, CU optimization, upgrade authority to multisig
```

---

### Session 17 — Polish Pass (May 4)
**Antigravity builds:**
- [ ] Frontend animations (deposit confirmation, yield counter increment)
- [ ] Empty states (no wallet connected, no position yet)
- [ ] Error messages for every failure mode (plain English, not hex codes)
- [ ] Lighthouse performance audit (target >85 score)
- [ ] SEO: title tags, meta descriptions, OG image

**Session 17 close — commit message:**
```
feat: frontend polish - animations, empty states, error messages, performance pass
```

---

## Phase 6 — Submission (Sessions 18–20, May 5–8)

### Session 18 — GitHub + Documentation (May 5)
**Antigravity builds:**
- [ ] Final `README.md`: product overview, architecture diagram, setup guide, live demo link
- [ ] Clean commit history reviewed (rebase if needed)
- [ ] `SECURITY.md`: what was audited and how
- [ ] IDL exported + published to repo

**Session 18 close — commit message:**
```
docs: final README, SECURITY.md, and IDL export for submission
```

---

### Session 19 — Demo Recording Prep (May 6)
**Antigravity writes:**
- [ ] Loom script (word-for-word, 2 minutes, follows the checklist template)
- [ ] Demo flow checklist (which wallet, which actions in order, where to screen-share)
- [ ] Submission description (150 words final version, ready to paste)
- [ ] Pitch deck final text for all 10 slides

**Michael does:**
- [ ] Record Loom demo video following the script (face + screen share)
- [ ] Share the Loom URL back

**Session 19 close — commit message:**
```
docs: submission description, pitch deck copy, and demo script finalized
```

---

### Session 20 — Submit (May 7–8)
**Antigravity prepares:**
- [ ] Final pre-submission review of all checklist items
- [ ] Confirm live demo URL is up + wallet connects
- [ ] Draft submission tweet thread for @Veh_la

**Michael does:**
- [ ] Complete Colosseum submission form at arena.colosseum.org (Antigravity fills every field in the Founder's Journal ready to copy-paste)
- [ ] Post submission tweet thread from @Veh_la
- [ ] Cross-post from @Hogwartsofweb3

---

## Post-Hackathon / Mainnet Pre-flight (Explorer Checklist)
> **Goal:** Resolve all missing metadata on Solana Explorer before going live with real funds.

- [ ] **Security.txt:** Generate and upload a `security.txt` via `@solana-program/program-metadata` to provide bug bounty contact info.
- [ ] **Program IDL:** Resolve the `proc_macro2` anchor-syn bug, generate the IDL JSON, and upload it on-chain so explorers can parse our custom instructions.
- [ ] **Tokens:** Run the protocol `initialize` instruction to deploy the `yUSDC` mint and the vault, which will populate the 'Tokens' tab.
- [ ] **Domains (Optional):** Purchase a `.sol` domain (e.g. `velaprotocol.sol`) and attach it to the Program ID.

---

## Michael's Daily Checklist (Every Build Day)

> You don't write code. You do these. Every day. Non-negotiable.

| Time | Activity |
|---|---|
| Morning | Open today's Founder's Journal entry — read what was built yesterday |
| Morning | Review any approvals Antigravity flagged (takes 5–10 min) |
| Midday | Post 1× on @Veh_la (use content templates — writer drafts, you approve) |
| Afternoon | Engage on Solana/RWA X posts (reply, like, follow judges) |
| Evening | Run the session's git commit (exact command in the Journal entry) |
| Evening | Read the session's "explain it to someone" paragraph — know your product |

---

## Buffer Days: May 9–11

| Date | Activity |
|---|---|
| May 9 | Submission filed. Any last-minute fixes if demo breaks. |
| May 10 | Engage on X — @mention judges, Colosseum, Solana Foundation |
| May 11 | Deadline day. Confirm submission received. Post "it's in" tweet. |
