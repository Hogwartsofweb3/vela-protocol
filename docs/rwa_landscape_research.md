# 🌊 Vela Protocol — Solana RWA Landscape Research
> **Purpose:** Identify all viable RWA protocols on Solana, categorize them, assess their yields, and determine integration priority for Vela.
> **Compiled:** April 23, 2026 | Source: rwa.xyz, ondo.finance, solana.com, protocol websites
> **Rule:** Always verify live APY figures directly on each protocol's website before pitch deck use — rates are dynamic.

---

## Market Context

| Metric | Data | Source |
|---|---|---|
| Total Solana RWA market cap | **$2B+** (crossed March 2026) | solana.com |
| Total global tokenized RWA TVL | **$29B+** | rwa.xyz |
| Total tokenized T-Bill TVL (all chains) | **$14B+** | mexc.com |
| Solana RWA token holders | **180,000+** (March 2026 record) | solana.com |
| Solana tokenized equity volume | **94% of all-time on-chain equity spot volume** | solana.com |
| Stablecoin supply on Solana | **$17B+** (March 2026 ATH) | solana.com |

**The thesis:** Solana has transitioned from retail DeFi to an institutional settlement layer. The RWA market is fragmented across issuers — Vela aggregates it.

---

## CATEGORY 1 — ✅ STABLE YIELD (Treasury-Backed / Institutional)
> **Definition:** Yield derived from U.S. Treasury bills, money market instruments, or government-backed debt. APY is relatively predictable, tied to the federal funds rate (~4.25–5.25% range in early 2026). Low volatility. The assets Vela should route capital into first.

---

### 1. Ondo Finance — USDY
- **Website:** [ondo.finance](https://ondo.finance)
- **Token:** `USDY` (Ondo U.S. Dollar Yield)
- **Underlying asset:** Short-term U.S. Treasuries + bank deposits
- **Current APY:** ~**3.55%** (7-day, variable)
- **Yield mechanism:** Token price appreciates — rebasing model, no manual claiming
- **Solana availability:** ✅ Yes — native on Solana
- **Access restriction:** Non-U.S. investors only (KYC required)
- **Minimum deposit:** Low — designed for broad non-institutional access
- **Vela integration verdict:** 🟢 **PRIMARY TARGET — Build this adapter first.** USDY is the most composable, widely-accepted tokenized yield product on Solana. Stable APY, Solana-native, no institutional minimums.
- **CPI complexity:** Medium — Ondo has a documented deposit API

---

### 2. Ondo Finance — OUSG
- **Website:** [ondo.finance](https://ondo.finance)
- **Token:** `OUSG` (Ondo Short-Term U.S. Government Bond Fund)
- **Underlying asset:** BlackRock U.S. Treasury ETF (short-duration)
- **Current APY:** ~**3.48%** (variable, tracks T-bill rate net of fees)
- **Yield mechanism:** Token appreciates in NAV daily
- **Solana availability:** ✅ Yes — supported on Solana
- **Access restriction:** ⚠️ **Institutional only** — Accredited investors and Qualified Purchasers only. Strict KYC/AML.
- **Minimum deposit:** $100,000+
- **Vela integration verdict:** 🟡 **SECONDARY TARGET — Phase 2 integration.** High-yield institutional product but access gates limit retail routing. Good for DAO treasury flows.

---

### 3. BlackRock BUIDL — USD Institutional Digital Liquidity Fund
- **Website:** [securitize.io/funds/buidl](https://securitize.io/funds/buidl) (managed via Securitize)
- **Token:** `BUIDL`
- **Underlying asset:** U.S. T-bills + overnight repos (BlackRock managed)
- **AUM:** $2B+ total
- **Current APY:** ~**3.5–5%** (net of management fee, tracks Fed funds rate)
- **Yield mechanism:** **Daily rebasing** — new tokens added to balances at $1.00 constant price
- **Solana availability:** ✅ Yes — multi-chain including Solana
- **Access restriction:** ⚠️ **Institutional only** — Qualified purchasers via Securitize onboarding
- **Minimum deposit:** $5,000,000 (effectively institutional-only)
- **Vela integration verdict:** 🟡 **NARRATIVE ASSET — Include in pitch, Phase 3+ for real CPI.** BUIDL on-chain is the best institutional credibility signal. Mention it as a "target adapter" in the demo even if the live CPI is Phase 3.

---

### 4. OpenEden — TBILL
- **Website:** [openeden.com](https://openeden.com)
- **Token:** `TBILL`
- **Underlying asset:** U.S. Treasury Bills (short-duration, 0–6 months)
- **Current APY:** ~**4.0–4.5%** (tracks T-bill rate minus 0.5% fee)
- **Yield mechanism:** Token NAV appreciates; no rebasing
- **Solana availability:** ✅ Yes — multi-chain, Solana supported
- **Access restriction:** ⚠️ Professional investors only (KYC required, but lighter than OUSG)
- **Minimum deposit:** Low-to-medium (accessible for professional retail)
- **Vela integration verdict:** 🟢 **VIABLE INTEGRATION — Phase 2.** Better yield than USDY. Less restrictive than OUSG. Strong documentation.

---

### 5. Kamino Finance — USDC/USDT Lending Markets
- **Website:** [app.kamino.finance](https://app.kamino.finance)
- **Token:** `kUSDC` / kTokens (receipt tokens for deposits)
- **Underlying asset:** DeFi lending — over-collateralized loans on Solana
- **Current APY:** **Variable — 4% to 12%+** (spikes during high utilization events)
- **Yield mechanism:** Supply yield from borrower interest + KMNO rewards
- **Solana availability:** ✅ Yes — native Solana
- **Access restriction:** 🟢 None — permissionless
- **Minimum deposit:** None
- **Vela integration verdict:** 🟢 **PRIMARY TARGET — Build this adapter first (with USDY).** Permissionless. Solana-native. High liquidity. Vela reads Kamino's on-chain borrow rates directly to populate the YieldOracle. This is the "DeFi yield leg" vs. Ondo's "TradFi yield leg."
- **⚠️ Stability note:** Kamino yields are variable and can spike (e.g., during the KelpDAO rsETH hack in April 2026, USDC supply APY spiked dramatically due to liquidity outflows). This volatility is a feature for Vela — the oracle reads it and routes accordingly.

---

## CATEGORY 2 — 🟡 MODERATE STABILITY (Private Credit / Institutional Lending)
> **Definition:** Yield from institutional lending to corporations or fintech companies. Higher APY than T-bills but more credit risk. Not "volatile" in the crypto sense, but not risk-free like Treasuries.

---

### 6. Maple Finance — syrupUSDC / syrupUSDT
- **Website:** [maple.finance](https://maple.finance)
- **Token:** `syrupUSDC`, `syrupUSDT`
- **Underlying asset:** Over-collateralized loans to institutional borrowers (trading firms, fintechs)
- **Current APY:** **~4.8% (syrupUSDC) / ~4.7% (syrupUSDT)**
- **Yield mechanism:** Interest from corporate loans + SYRUP token buyback incentives
- **Solana availability:** ✅ Yes — integrated via Kamino on Solana
- **Access restriction:** 🟢 Permissionless (retail accessible via Kamino integration)
- **Vela integration verdict:** 🟡 **PHASE 2–3 INTEGRATION.** Higher stable yield than Ondo. The credit risk is real but managed. Good for the "private credit" allocation bucket in Vela's router.

---

## CATEGORY 3 — 🔴 VOLATILE (Equity / Real Estate / Speculative RWA)
> **Definition:** Yield and/or price exposure tied to volatile underlying assets — equities, property indexes, synthetic positions. Not appropriate for Vela's yield routing core. Listed here for completeness.

---

### 7. BackedFi — xStocks (xAAPL, xNVDA, xSPY, etc.)
- **Website:** [backed.fi](https://backed.fi)
- **Tokens:** `xAAPLx`, `xNVDAx`, `xSPYx`, `xQQQx`, `xTSLAx` and 50+ more
- **Underlying asset:** Tokenized real-world equities (Apple, Nvidia, S&P 500 ETF, etc.)
- **APY:** ❌ No fixed yield — **price follows the underlying stock**
- **Solana availability:** ✅ Yes — live on Solana via Kamino, Raydium, Jupiter as collateral
- **Access restriction:** Non-U.S. only (regulatory restriction)
- **Vela integration verdict:** 🔴 **DO NOT ROUTE YIELD HERE.** xStocks are equity price exposure, not yield-bearing assets. Relevant as DeFi collateral but not for Vela's core routing. Mention in pitch deck as "future composability" (yUSDC as collateral for xStocks leverage).

---

### 8. Parcl — Real Estate Price Indexes
- **Website:** [parcl.co](https://parcl.co)
- **Token:** Synthetic real estate position tokens (per-city indexes: NYC, Miami, LA)
- **Underlying asset:** City-level real estate price indexes
- **APY:** ❌ No fixed yield — **speculative price exposure to property markets**
- **Solana availability:** ✅ Yes — native Solana
- **Access restriction:** 🟢 None — permissionless
- **Vela integration verdict:** 🔴 **SKIP — Incompatible with Vela's model.** Parcl is a real estate derivatives platform, not a yield aggregator. No stable APY to route into.

---

### 9. Credix — Private Credit (Emerging Markets)
- **Website:** [credix.finance](https://credix.finance)
- **Underlying asset:** Private loans to fintech lenders in emerging markets (Brazil, Mexico)
- **APY:** **Variable, ~8–12%** (higher yield = higher credit/emerging market risk)
- **Solana availability:** ✅ Yes — native Solana
- **Access restriction:** ⚠️ Accredited investors only in many jurisdictions
- **Vela integration verdict:** 🔴 **TOO HIGH RISK FOR PHASE 1.** Credix offers higher yield but the credit risk profile (unsecured corporate lending in emerging markets) is inappropriate for institutional USDC yield routing. Possible Phase 4+ "high yield" bucket.

---

## CATEGORY 4 — 🔵 INFRASTRUCTURE / STABLECOINS (Not Yield Protocols — Enabling Layer)
> These are not yield protocols but are critical infrastructure that Vela interacts with.

---

### 10. Solana Developer Platform (SDP)
- **Website:** [solana.com/developers](https://solana.com/developers)
- **Launched:** March 24, 2026
- **What it is:** Solana's institutional issuance API layer — connects Mastercard, Worldpay, Western Union, and 20+ providers to Solana rails
- **Vela relevance:** Vela is the first **consumer aggregator** on top of SDP issuance infrastructure. This is the "why now" slide in the pitch deck.

---

### 11. Jupiter
- **Website:** [jup.ag](https://jup.ag)
- **What it is:** Solana's primary liquidity aggregator + swap router
- **Vela relevance:** Used for rebalancing CPIs — when Vela moves funds between Ondo and Kamino, Jupiter swaps handle the routing. The Vela keeper calls Jupiter CPI for token swaps.

---

### 12. Helius
- **Website:** [helius.dev](https://helius.dev)
- **What it is:** Premium Solana RPC provider + webhook infrastructure
- **Vela relevance:** The keeper service uses Helius RPC for all on-chain reads. Helius webhooks capture `rebalance()` logs for the dashboard.

---

## Integration Priority Summary

| Priority | Protocol | Token | APY | Stability | Target Session |
|---|---|---|---|---|---|
| 🟢 **#1** | Kamino Finance | kUSDC | 4–12% (variable) | Medium-High | **Session 4–5** |
| 🟢 **#2** | Ondo Finance | USDY | ~3.55% | High | **Session 4–5** |
| 🟡 **#3** | OpenEden | TBILL | ~4.0–4.5% | High | Session 9 |
| 🟡 **#4** | Maple Finance | syrupUSDC | ~4.8% | Medium | Session 9 |
| 🟡 **#5** | Ondo Finance | OUSG | ~3.48% | High | Session 9 |
| 🔴 **Later** | BlackRock BUIDL | BUIDL | ~3.5–5% | High | Post-hackathon (institutional min) |
| 🔴 **Skip** | BackedFi xStocks | xStocks | N/A (equity) | Volatile | Not applicable |
| 🔴 **Skip** | Parcl | RE Index | N/A | Volatile | Not applicable |
| 🔴 **Phase 4+** | Credix | Private Credit | 8–12% | Low-Medium | Post-hackathon |

---

## Vela Routing Logic (Based on This Research)

```
YieldOracle reads:
  ├── Kamino USDC supply rate (on-chain, direct RPC read)
  ├── Ondo USDY rate (API + on-chain verification)
  └── OpenEden TBILL rate (Phase 2)

Router logic:
  IF kamino_apy_bps > ondo_apy_bps + 20 bps:
      → route to Kamino (chase higher DeFi yield)
  ELSE:
      → route to Ondo USDY (stable TradFi floor)

Fallback:
  → Always maintain minimum 20% in Ondo USDY (institutional trust signal)
```

**This is the core competitive edge:** Vela automatically picks Kamino when DeFi demand spikes yield above the T-bill floor, and retreats to Ondo when it doesn't. No user action required.

---

## Sources
- [ondo.finance](https://ondo.finance) — USDY/OUSG product pages
- [app.kamino.finance](https://app.kamino.finance) — Live supply APY dashboard
- [maple.finance](https://maple.finance) — syrupUSDC product page
- [openeden.com](https://openeden.com) — TBILL vault page
- [backed.fi](https://backed.fi) — xStocks product list
- [parcl.co](https://parcl.co) — Real estate index trading
- [credix.finance](https://credix.finance) — Private credit pools
- [rwa.xyz](https://rwa.xyz) — Aggregate RWA market data
- [solana.com/news/rwa-march-2026](https://solana.com) — Solana RWA milestone report
