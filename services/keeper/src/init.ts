import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

dotenv.config();

// Token-2022 program ID (hardcoded — no spl-token dep needed)
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP");

async function main() {
  console.log("🌊 Vela Protocol - Initializer");
  
  const connection = new Connection(RPC_URL, "confirmed");

  // Load the admin keypair (default Solana CLI wallet)
  const adminKeypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  if (!fs.existsSync(adminKeypairPath)) {
    throw new Error(`Admin keypair not found at ${adminKeypairPath}. Please run 'solana-keygen new' first.`);
  }
  
  const adminSecret = Uint8Array.from(JSON.parse(fs.readFileSync(adminKeypairPath, "utf-8")));
  const adminKeypair = Keypair.fromSecretKey(adminSecret);
  
  const wallet = new anchor.Wallet(adminKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const idl = require("../../../target/idl/vela_protocol.json");
  const program = new anchor.Program(idl, provider) as anchor.Program<any>;

  console.log(`Admin Wallet: ${adminKeypair.publicKey.toBase58()}`);

  // Derive PDAs
  const [aggregatorStatePDA] = PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], PROGRAM_ID);
  const [yieldOraclePDA] = PublicKey.findProgramAddressSync([Buffer.from("yield_oracle")], PROGRAM_ID);
  const [yusdcMintPDA] = PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], PROGRAM_ID);

  console.log("Initializing protocol state...");
  
  try {
    const tx = await program.methods
      .initializeAggregator()
      .accounts({
        admin: adminKeypair.publicKey,
        aggregatorState: aggregatorStatePDA,
        yieldOracle: yieldOraclePDA,
        yusdcMint: yusdcMintPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID, // Ensure we use Token-2022
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([adminKeypair])
      .rpc();

    console.log(`✅ Success! Protocol initialized.`);
    console.log(`Transaction Signature: ${tx}`);
    console.log(`Aggregator State: ${aggregatorStatePDA.toBase58()}`);
    console.log(`Yield Oracle: ${yieldOraclePDA.toBase58()}`);
    console.log(`yUSDC Mint: ${yusdcMintPDA.toBase58()}`);
  } catch (error) {
    console.error("❌ Initialization failed:");
    console.error(error);
  }
}

main().catch(console.error);
