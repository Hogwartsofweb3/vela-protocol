import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

function sha256(input: string): Buffer {
  return crypto.createHash("sha256").update(input).digest();
}

function instructionDiscriminator(name: string): number[] {
  return Array.from(sha256(`global:${name}`).slice(0, 8));
}

function accountDiscriminator(name: string): number[] {
  return Array.from(sha256(`account:${name}`).slice(0, 8));
}

const idl = {
  version: "0.1.0",
  name: "vela_protocol",
  address: "22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP",
  metadata: {
    name: "vela_protocol",
    version: "0.1.0",
    spec: "0.1.0"
  },
  instructions: [
    {
      name: "initializeAggregator",
      discriminator: instructionDiscriminator("initialize_aggregator"),
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "aggregatorState", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("aggregator_state")) }] } },
        { name: "yieldOracle", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yield_oracle")) }] } },
        { name: "yusdcMint", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yusdc_mint")) }] } },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
        { name: "tokenProgram" },
        { name: "rent", address: "SysvarRent111111111111111111111111111111111" }
      ],
      args: []
    },
    {
      name: "deposit",
      discriminator: instructionDiscriminator("deposit"),
      accounts: [
        { name: "user", writable: true, signer: true },
        { name: "aggregatorState", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("aggregator_state")) }] } },
        { name: "userPosition", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("user_position")) }, { kind: "account", path: "user" }] } },
        { name: "usdcMint", writable: true },
        { name: "vaultUsdcAccount", writable: true },
        { name: "userUsdcAccount", writable: true },
        { name: "yusdcMint", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yusdc_mint")) }] } },
        { name: "userYusdcAccount", writable: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
        { name: "tokenProgram" },
        { name: "token2022Program" },
        { name: "associatedTokenProgram", address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bv" }
      ],
      args: [{ name: "amount", type: "u64" }]
    },
    {
      name: "withdraw",
      discriminator: instructionDiscriminator("withdraw"),
      accounts: [
        { name: "user", writable: true, signer: true },
        { name: "aggregatorState", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("aggregator_state")) }] } },
        { name: "userPosition", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("user_position")) }, { kind: "account", path: "user" }] } },
        { name: "usdcMint", writable: true },
        { name: "vaultUsdcAccount", writable: true },
        { name: "userUsdcAccount", writable: true },
        { name: "yusdcMint", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yusdc_mint")) }] } },
        { name: "userYusdcAccount", writable: true },
        { name: "owner" },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
        { name: "tokenProgram" },
        { name: "token2022Program" },
        { name: "associatedTokenProgram", address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bv" }
      ],
      args: [{ name: "amount", type: "u64" }]
    },
    {
      name: "updateOracle",
      discriminator: instructionDiscriminator("update_oracle"),
      accounts: [
        { name: "keeper", writable: true, signer: true },
        { name: "aggregatorState", pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("aggregator_state")) }] } },
        { name: "yieldOracle", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yield_oracle")) }] } }
      ],
      args: [
        { name: "ondoApyBps", type: "u16" },
        { name: "kaminoApyBps", type: "u16" }
      ]
    },
    {
      name: "rebalance",
      discriminator: instructionDiscriminator("rebalance"),
      accounts: [
        { name: "keeper", writable: true, signer: true },
        { name: "aggregatorState", writable: true, pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("aggregator_state")) }] } },
        { name: "yieldOracle", pda: { seeds: [{ kind: "const", value: Array.from(Buffer.from("yield_oracle")) }] } }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "AggregatorConfig",
      discriminator: accountDiscriminator("AggregatorConfig")
    },
    {
      name: "UserPosition",
      discriminator: accountDiscriminator("UserPosition")
    },
    {
      name: "YieldOracle",
      discriminator: accountDiscriminator("YieldOracle")
    }
  ],
  errors: [
    { code: 6000, name: "MinimumDepositNotMet", msg: "Deposit is below the $50 minimum" },
    { code: 6001, name: "MathOverflow", msg: "Arithmetic overflow detected" },
    { code: 6002, name: "UnauthorizedKeeper", msg: "Caller is not the authorized keeper" },
    { code: 6003, name: "WithdrawalNotReady", msg: "Withdrawal is locked until the next epoch" },
    { code: 6004, name: "InsufficientBalance", msg: "Insufficient yUSDC balance to withdraw" },
    { code: 6005, name: "OracleStale", msg: "Oracle data is stale" },
    { code: 6006, name: "DeltaTooSmall", msg: "APY spread is below the rebalance threshold" }
  ],
  types: [
    {
      name: "AggregatorConfig",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "pubkey" },
          { name: "keeper", type: "pubkey" },
          { name: "yusdcMint", type: "pubkey" },
          { name: "totalDeposited", type: "u64" },
          { name: "currentStrategy", type: "u8" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "UserPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "pubkey" },
          { name: "activeDeposit", type: "u64" },
          { name: "pendingWithdrawal", type: "u64" },
          { name: "unlockTimestamp", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "YieldOracle",
      type: {
        kind: "struct",
        fields: [
          { name: "ondoApyBps", type: "u16" },
          { name: "kaminoApyBps", type: "u16" },
          { name: "lastUpdate", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
};

// Write to target/idl/
const outputPath = path.join(__dirname, "../../../../target/idl/vela_protocol.json");
fs.writeFileSync(outputPath, JSON.stringify(idl, null, 2));
console.log("✅ IDL generated successfully at:", outputPath);
console.log("\nDiscriminators:");
console.log("  initialize_aggregator:", instructionDiscriminator("initialize_aggregator"));
console.log("  deposit:              ", instructionDiscriminator("deposit"));
console.log("  withdraw:             ", instructionDiscriminator("withdraw"));
console.log("  update_oracle:        ", instructionDiscriminator("update_oracle"));
console.log("  rebalance:            ", instructionDiscriminator("rebalance"));
