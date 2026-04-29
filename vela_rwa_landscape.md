# 🌐 Vela — RWA Landscape & Protocol Integration Roadmap
> **Last updated:** April 2026 | **Author:** Antigravity (for Vela Protocol)

---

## The Core Narrative: Why Vela Exists

> **The question every user will ask:** "Why should I deposit into Vela when I can just go directly to Ondo Finance or BlackRock BUIDL myself?"

**The answer is three words: You. Can't. Directly.**

Every institutional-grade RWA with stable yield on Solana has one thing in common — **they are closed to ordinary users.** The minimum investment thresholds are designed for institutions, DAO treasuries, and hedge funds — not individuals.

| Protocol | Direct Access Minimum | Reality for Regular Users |
|---|---|---|
| **BlackRock BUIDL** | $5,000,000 | Institutional only. KYC + legal agreements required. |
| **Ondo USDY** | ~$500+ but KYC restricted, US persons blocked | Geo-blocked, KYC/AML gauntlet for each country |
| **Ondo OUSG** | **$100,000 minimum** | Accredited investor only. US Treasury exposure behind a wall. |
| **Franklin Templeton BENJI** | **$1,000,000+** | Institutional only. Whitelist-only access. |
| **VanEck VBILL** | Institutional | Primarily for registered funds and family offices |
| **Apollo ACRED** | Institutional | Credit fund access — accredited investors with $250K+ minimums |
| **Hastra PRIME** | Institutional | Real estate credit — not available to retail |

**Vela's answer:** Deposit **$50 USDC**. Get exposure to all of them, auto-compounded, through a single token.

This is the "Jupiter for RWA yield" thesis. Jupiter didn't build a DEX — it built a router. Vela doesn't issue RWAs — it routes yield through them, democratizing access at any deposit size.

---

## 📊 The Stable-Yield RWA Shortlist

> Sorted by Phase priority: trust level, Solana-native liquidity, and regulatory defensibility.

### Phase 1 — MVP (Hackathon → Launch, Now → Aug 2026)
> **Goal:** Prove the concept with the most trusted, most liquid, most defensible assets.
> **Decision criteria:** Must be Solana-native, have live on-chain TVL, have stable/predictable yield.

---

#### 🥇 #1 — BUIDL (BlackRock / Securitize)
| Field | Value |
|---|---|
| **Issuer** | BlackRock + Securitize |
| **Category** | U.S. Treasury Bills |
| **APY** | ~3.53% |
| **Solana TVL** | $231M |
| **Risk** | Highest trust / Lowest risk |

**Why Phase 1:**
BUIDL is the single most powerful credibility anchor in the entire RWA space. BlackRock managing $10T+ in assets and choosing Solana for their tokenized treasury fund is a signal institutional capital has arrived. Having BUIDL in Vela's routing stack means a judge, VC, or potential depositor can say "it's backed by BlackRock" — which ends the trust conversation immediately.

**Why you can't access it directly:**
$5,000,000 minimum. Institutional-only onboarding through Securitize. Legal agreements, KYC, and AML that take weeks. Regular users are categorically excluded.

**Vela's moat:** Route $50 into a pool that allocates to BUIDL. User gets US Treasury yield. No minimum. No whitelist. Instant.

---

#### 🥈 #2 — USDY (Ondo Finance)
| Field | Value |
|---|---|
| **Issuer** | Ondo Finance |
| **Category** | U.S. Treasuries + Bank Deposits |
| **APY** | ~3.55% |
| **Solana TVL** | $182M |
| **Risk** | Very High trust / Very Low risk |

**Why Phase 1:**
USDY is the most Solana-native institutional RWA token. It's already deeply integrated into the Solana DeFi ecosystem — Kamino accepts it as collateral, it's available on Jupiter, and it has the deepest liquidity of any tokenized treasury on the network. For the hackathon demo, USDY is the flagship integration.

**Why you can't access it directly:**
Ondo's onboarding is geo-restricted and KYC-heavy. US persons face additional restrictions (USDY is available to non-US only through the primary). The direct API is not a consumer product — it's designed for protocol-level integrations and large capital allocators. There is no "$500 USDY please" button. There is a whitelist, a compliance form, and waiting periods.

**Vela's moat:** Vela holds USDY at the protocol level. Users hold yUSDC. The compliance burden is Vela's — the yield is the user's.

---

#### 🥉 #3 — PRIME (Hastra)
| Field | Value |
|---|---|
| **Issuer** | Hastra |
| **Category** | HELOC / Asset-Backed Real Estate Credit |
| **APY** | ~7.21% |
| **Solana TVL** | $335M (largest single platform) |
| **Risk** | Medium-High |

**Why Phase 1:**
PRIME is Vela's yield booster. While BUIDL and USDY anchor the portfolio with low-risk treasuries at ~3.5%, PRIME doubles the yield potential with real-estate backed credit at 7.21%. The oracle and rebalance logic will route to PRIME when it offers a sufficient spread above the treasury baseline. This is what makes Vela a genuine *optimization* engine, not just a wrapper.

**Why you can't access it directly:**
HELOC-backed credit facilities are institutional credit products. You don't "buy PRIME" on a DEX. You go through Hastra's institutional onboarding with credit qualification requirements. The $335M TVL exists because institutions are the users — not individuals.

**Vela's moat:** Vela is the consumer-facing layer. PRIME is the engine. Users don't need to know what a HELOC is.

---

#### #4 — OUSG (Ondo Finance)
| Field | Value |
|---|---|
| **Issuer** | Ondo Finance |
| **Category** | U.S. Government Bonds |
| **APY** | ~3.24% |
| **Solana TVL** | $71.8M |
| **Risk** | High trust |

**Why Phase 1:**
OUSG is a conservative fallback — US Government bond exposure at 3.24%. When the oracle signals treasury rates are attractive relative to credit risk, Vela routes here as the lowest-volatility allocation. Think of it as the "safe harbor" strategy in Vela's rebalancing logic.

**Why you can't access it directly:**
**$100,000 minimum.** Accredited investors only. This is one of the starkest examples of the access problem Vela solves. $100K minimum for a US treasury bond product that yields 3.24% — a rate you can get for free in a savings account, except you have to be rich first.

**Vela's moat:** A user deposits $50 and participates in the same bond exposure BlackRock clients get. That's the product.

---

#### #5 — VBILL (VanEck)
| Field | Value |
|---|---|
| **Issuer** | VanEck |
| **Category** | U.S. Treasury Bills |
| **APY** | ~3.53% |
| **Solana TVL** | $13.8M |
| **Risk** | High trust |

**Why Phase 1:**
VanEck brings institutional brand credibility alongside BlackRock. Having both in the routing stack allows Vela to diversify counterparty risk at the protocol level — if BUIDL has a redemption delay, Vela can route through VBILL without interrupting user yield. This is exactly the kind of infrastructure resilience institutional depositors look for.

**Why you can't access it directly:**
VanEck's tokenized products are distributed through institutional channels. No consumer onboarding. Minimum ticket sizes designed for registered funds and family offices.

**Vela's moat:** Redundancy. Multiple treasury routes, single user interface.

---

### Phase 2 — Growth (Post-Hackathon, Sep 2026 → Q1 2027)
> **Goal:** Add higher-yield, diversified RWA categories once the protocol has proven stability and TVL exceeds $1M.
> **Decision criteria:** Higher yield potential but require more monitoring. Added once oracle logic is battle-tested.

---

#### 🟡 ACRED (Apollo)
| Field | Value |
|---|---|
| **Issuer** | Apollo Global Management |
| **Category** | Diversified Private Credit |
| **APY** | ~8.71% |
| **Solana TVL** | $35M |
| **Risk** | Medium |

**Why Phase 2:**
Apollo is one of the world's largest alternative asset managers with $650B+ AUM. ACRED brings private credit exposure — corporate loans, leveraged buyouts, direct lending — which historically yields significantly more than treasuries. At 8.71%, adding ACRED as a high-yield allocation in Vela's rebalancer meaningfully improves overall portfolio APY.

**Why not Phase 1:**
Private credit is less liquid than US treasuries. Redemption timelines are longer, and credit cycles affect yields in ways treasury rates don't. Vela needs mature oracle logic and withdrawal management before routing user funds here.

**Why you can't access it directly:**
Apollo's credit funds require accredited investor status and $250,000+ minimums. ACRED on-chain is an institutional tokenization — not a consumer product.

---

#### 🟡 ONYC (OnRe)
| Field | Value |
|---|---|
| **Issuer** | OnRe |
| **Category** | Reinsurance |
| **APY** | ~10.15% |
| **Solana TVL** | $140M |
| **Risk** | Medium (uncorrelated) |

**Why Phase 2:**
Reinsurance is one of the most powerful diversifiers in any yield portfolio because it is **completely uncorrelated to both crypto markets and interest rate cycles.** Insurance premiums don't move with Fed rate decisions or BTC price. At 10.15% yield, ONYC adds a high-yield, uncorrelated sleeve to Vela's portfolio — which is exactly what sophisticated depositors want.

**Why not Phase 1:**
Reinsurance is a complex asset class that requires careful risk modeling. Catastrophe events (hurricanes, floods) can create sharp drawdowns in reinsurance pools. Vela needs robust oracle monitoring and position sizing logic before routing here.

**Why you can't access it directly:**
Reinsurance has historically been available only to institutional investors through Lloyd's of London syndicates or private cat bond funds. OnRe's tokenization is the first consumer-adjacent version — but it still requires institutional onboarding through OnRe's platform.

---

## 🎯 Integration Priority Matrix

| Asset | Phase | APY | Minimum (Direct) | Vela Minimum | Key Reason |
|---|---|---|---|---|---|
| BUIDL | 1 | 3.53% | $5,000,000 | $50 | Credibility anchor |
| USDY | 1 | 3.55% | Geo-restricted + KYC | $50 | Solana-native, liquid |
| PRIME | 1 | 7.21% | Institutional | $50 | Yield booster |
| OUSG | 1 | 3.24% | $100,000 | $50 | Conservative fallback |
| VBILL | 1 | 3.53% | Institutional | $50 | Treasury redundancy |
| ACRED | 2 | 8.71% | $250,000+ | $50 | Private credit diversifier |
| ONYC | 2 | 10.15% | Institutional | $50 | Uncorrelated yield |

---

## 🔑 The One-Liner Answer to "Why Not Go Directly?"

> **"You can't. The minimum to access BlackRock BUIDL directly is $5 million. Ondo OUSG requires $100,000 and accredited investor status. Franklin Templeton BENJI requires $1 million and institutional onboarding. Vela lets you deposit $50 and earn the same yield. That's the product."**

This is Vela's access democratization story. It's not just about convenience — it's about a class of assets that have been structurally unavailable to 99% of people. Vela is the bridge.

---

## 📐 Rebalancing Logic (How Vela Chooses Where to Route)

The keeper oracle checks all integrated protocols every 30 seconds. The rebalance instruction fires only when:
1. **The spread between the current route and the highest-yielding route exceeds 20 basis points** (0.20%) — this prevents constant thrashing for tiny gains.
2. **Oracle data is fresh** (under 60 seconds old) — stale data never triggers a rebalance.
3. **The transaction is signed by the stored keeper authority** — no unauthorized routing.

**Example:**
- USDY at 3.55%, PRIME at 7.21% → spread is 366 bps → **rebalance triggers, routes to PRIME**
- USDY at 3.55%, OUSG at 3.30% → spread is 25 bps → **rebalance fires, marginal gain captured**
- USDY at 3.55%, VBILL at 3.53% → spread is 2 bps → **no rebalance, gas cost > yield gain**

---

## 📅 Integration Timeline

| Milestone | Target Date | Assets Active |
|---|---|---|
| Hackathon Demo | May 11, 2026 | USDY (live oracle) |
| Mainnet Launch | Jun–Jul 2026 | BUIDL + USDY + OUSG |
| Full Phase 1 | Aug 2026 | + PRIME + VBILL |
| Phase 2 Launch | Q4 2026 | + ACRED |
| Phase 2 Complete | Q1 2027 | + ONYC |

---

*Document maintained by Antigravity for Vela Protocol internal use. Last updated April 2026.*
