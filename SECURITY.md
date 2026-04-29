# Vela Protocol Security Model

Vela Protocol is built to handle institutional capital. Security is prioritized above all else, focusing on mitigating math overflows, oracle manipulation, and unauthorized access.

## 1. Mathematical Safety
Every mathematical operation within the Vela Anchor program utilizes strict bounds checking.
- All addition, subtraction, and multiplication operations use `checked_add`, `checked_sub`, and `checked_mul`.
- Any overflow or underflow explicitly throws a `VelaError::MathOverflow`, immediately failing the transaction and protecting vault funds.

## 2. Oracle Staleness & Integrity
The off-chain Keeper service pushes live APY data to the `YieldOracle` PDA.
- The smart contract logs the `last_updated_timestamp` on every oracle push.
- If a rebalance is triggered and the oracle data is older than 60 seconds, the transaction reverts with `VelaError::StaleOracle`.
- This prevents the protocol from rebalancing based on stale or manipulated historical yields.

## 3. Account Ownership Constraints
We enforce strict ownership constraints natively via Anchor's `#[account(constraint = ...)]` macros.
- When a user interacts with their `UserPosition` PDA, the contract verifies that the signer matches `user_position.owner`.
- Withdrawals can only be initiated by the exact wallet that deposited the funds.

## 4. Compute Unit Optimization
All core instructions (`deposit`, `withdraw`, `rebalance`) have been profiled and execute well under the 200,000 Compute Unit limit. 
- CPI calls to Kamino and Token-2022 are batched efficiently.
- Stack frames are kept strictly under the 4096-byte eBPF limit by splitting heavy initialization logic out of the core deposit loop.

## 5. Upgrade Authority
To ensure institutional trust, the `vela_protocol` program's upgrade authority is designed to be transferred to a Squads Multisig upon Mainnet deployment, preventing any unilateral malicious code updates by a single developer key.

## 6. Audit Status
The codebase is currently unaudited and intended for hackathon demonstration. A full Tier-1 audit (e.g., OtterSec, Zellic) is required prior to accepting retail/institutional capital on Mainnet-Beta.
