/**
 * Vela Protocol — Devnet Initialization Script
 *
 * This script runs the `initializeAggregator` instruction once on Devnet.
 * It creates the yUSDC mint PDA, the YieldOracle PDA, and the AggregatorConfig PDA
 * so that deposits and oracle updates can succeed.
 *
 * Run: npx ts-node scripts/init_devnet.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import path from "path";

// --- Load your local wallet keypair ---
// The Solana keypair lives in WSL. We resolve the WSL home path.
const walletPath = process.env.SOLANA_KEYPAIR_PATH || 
  path.join(os.homedir(), ".config", "solana", "id.json");
const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf8"));
const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

const PROGRAM_ID = new PublicKey("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");
const RPC = "https://api.devnet.solana.com";

async function main() {
  const connection = new Connection(RPC, "confirmed");

  console.log("Admin wallet:", adminKeypair.publicKey.toBase58());
  const balance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin SOL balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.1 * anchor.web3.LAMPORTS_PER_SOL) {
    console.error("❌ Insufficient SOL. Run: solana airdrop 2");
    process.exit(1);
  }

  const wallet = new anchor.Wallet(adminKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  // Load IDL
  const idlPath = path.join(__dirname, "../idl/vela_protocol.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new anchor.Program(idl, provider);

  // Derive PDAs
  const [aggregatorStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    PROGRAM_ID
  );
  const [yieldOraclePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("yield_oracle")],
    PROGRAM_ID
  );
  const [yusdcMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")],
    PROGRAM_ID
  );

  console.log("\n📍 PDAs:");
  console.log("  AggregatorState:", aggregatorStatePDA.toBase58());
  console.log("  YieldOracle:    ", yieldOraclePDA.toBase58());
  console.log("  yUSDC Mint:     ", yusdcMintPDA.toBase58());

  // Check if already initialized
  const existing = await connection.getAccountInfo(aggregatorStatePDA);
  if (existing) {
    console.log("\n✅ Program already initialized! Oracle PDA exists.");
    console.log("   You can now deposit from the frontend.");
    return;
  }

  console.log("\n🚀 Running initializeAggregator...");
  const tx = await (program.methods as any)
    .initializeAggregator()
    .accounts({ admin: adminKeypair.publicKey })
    .rpc();

  console.log("\n✅ Initialization successful!");
  console.log("   Transaction:", tx);
  console.log("   View on Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

  // Now push a first oracle update so APYs show real data
  console.log("\n📡 Pushing initial oracle APY data (Ondo=5.2%, Kamino=3.8%)...");
  const oracleTx = await (program.methods as any)
    .updateOracle(520, 380) // 5.20% and 3.80% in basis points
    .accounts({ keeper: adminKeypair.publicKey })
    .rpc();

  console.log("✅ Oracle updated!");
  console.log("   Transaction:", oracleTx);
  console.log("\n🎉 Vela Protocol is live on Devnet. Open the dashboard and try a deposit!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
