/**
 * set-yusdc-metadata.ts
 *
 * One-time script: writes name / symbol / URI into the yUSDC mint's
 * Token-2022 native TokenMetadata extension so Phantom shows it correctly.
 *
 * IMPORTANT: Must be signed by the ADMIN wallet (the one that ran
 * `anchor deploy` and called `initialize_aggregator`), NOT the keeper wallet.
 *
 * Usage (from services/keeper/ in WSL):
 *   npm run set-metadata
 *
 * The script reads ~/.config/solana/id.json automatically as the admin wallet.
 */

import "cross-fetch/polyfill";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// ── Constants ─────────────────────────────────────────────────────────────────
const PROGRAM_ID    = new PublicKey("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");
const TOKEN_2022_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const RPC_URL       = "https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023";

// Token metadata — what Phantom will display
const TOKEN_NAME   = "Vela Yield USD";
const TOKEN_SYMBOL = "yUSDC";
const TOKEN_URI    =
  "https://raw.githubusercontent.com/Hogwartsofweb3/vela-protocol/main/assets/yusdc-metadata.json";

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load the admin wallet (~/.config/solana/id.json or WSL path)
  let solanaKeyPath = path.join(os.homedir(), ".config", "solana", "id.json");
  if (!fs.existsSync(solanaKeyPath)) {
    solanaKeyPath = "\\\\wsl$\\Ubuntu\\home\\hogwartsofweb3\\.config\\solana\\id.json";
  }
  if (!fs.existsSync(solanaKeyPath)) {
    console.error(`\n❌  No Solana CLI wallet found at: ${solanaKeyPath}`);
    console.error(`   Run: solana-keygen new`);
    process.exit(1);
  }
  const secretKey    = new Uint8Array(JSON.parse(fs.readFileSync(solanaKeyPath, "utf-8")));
  const adminKeypair = Keypair.fromSecretKey(secretKey);

  console.log("─────────────────────────────────────────────");
  console.log("🌊  Vela yUSDC Metadata Setter (IDL mode)");
  console.log("─────────────────────────────────────────────");
  console.log(`Admin wallet : ${adminKeypair.publicKey.toBase58()}`);

  // 2. Set up Anchor provider
  const connection = new Connection(RPC_URL, {
    commitment: "confirmed",
    fetch: require("cross-fetch"),
  });
  const wallet     = new anchor.Wallet(adminKeypair);
  const provider   = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  // 3. Balance check
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin balance: ${(balance / 1e9).toFixed(4)} SOL`);
  if (balance < 5_000_000) {
    console.error("\n❌  Less than 0.005 SOL — run: solana airdrop 1");
    process.exit(1);
  }

  // 4. Load IDL — built by `anchor build`, lives at target/idl/
  //    Path relative to this file (src/): ../../../target/idl/
  const idlPath = path.resolve(__dirname, "../../../target/idl/vela_protocol.json");
  if (!fs.existsSync(idlPath)) {
    console.error(`\n❌  IDL not found at: ${idlPath}`);
    console.error(`   Run 'anchor build' in the vela-protocol/ directory first.`);
    process.exit(1);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  console.log(`IDL loaded from: ${idlPath}`);

  // 5. Build the Anchor program client
  const program = new anchor.Program(idl, provider) as anchor.Program<any>;

  // 6. Derive PDAs
  const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    PROGRAM_ID
  );
  const [yusdcMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")],
    PROGRAM_ID
  );

  console.log(`aggregator_state : ${aggregatorStatePda.toBase58()}`);
  console.log(`yusdc_mint       : ${yusdcMintPda.toBase58()}`);

  // 7. Verify mint exists
  const mintInfo = await connection.getAccountInfo(yusdcMintPda);
  if (!mintInfo) {
    console.error("\n❌  yUSDC mint not found on devnet. Run initialize_aggregator first.");
    process.exit(1);
  }
  console.log(`\n✅  yUSDC mint found on-chain (${mintInfo.data.length} bytes)`);

  // 8. Call create_token_metadata via Anchor (correct discriminator guaranteed)
  console.log(`\nMetadata to write:`);
  console.log(`  Name  : "${TOKEN_NAME}"`);
  console.log(`  Symbol: "${TOKEN_SYMBOL}"`);
  console.log(`  URI   : ${TOKEN_URI}`);
  console.log("\n📡 Sending transaction...");

  try {
    const sig = await program.methods
      .createTokenMetadata(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI)
      .accounts({
        admin:            adminKeypair.publicKey,
        aggregatorState:  aggregatorStatePda,
        yusdcMint:        yusdcMintPda,
        token2022Program: TOKEN_2022_ID,
        systemProgram:    SystemProgram.programId,
      })
      .signers([adminKeypair])
      .rpc({ commitment: "confirmed" });

    console.log("\n✅  yUSDC metadata written successfully!");
    console.log(`   TX : ${sig}`);
    console.log(`   Solscan: https://solscan.io/tx/${sig}?cluster=devnet`);
    console.log("\n   Phantom will now show \"Vela Yield USD (yUSDC)\" with the Vela logo.");
    console.log("   (Re-import the token in Phantom if the name doesn't refresh immediately.)");
  } catch (err: any) {
    console.error("\n❌  Transaction failed:", err?.message ?? err);
    if (err?.logs?.length) {
      console.error("\nProgram logs:");
      err.logs.forEach((l: string) => console.error("  ", l));
    }
    process.exit(1);
  }
}

main().catch(console.error);
