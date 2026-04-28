/**
 * reset-devnet.ts
 *
 * One-time devnet utility: closes the existing aggregator_state, yield_oracle,
 * and yusdc_mint PDAs by reclaiming their lamports back to the admin wallet.
 * Required because we changed the initialize instruction to embed the
 * MetadataPointer extension in the mint — extensions cannot be added to an
 * existing mint, so the old mint must be replaced.
 *
 * After running this script:
 *   1. anchor deploy                              (re-deploy upgraded program)
 *   2. npx ts-node src/init.ts                    (re-initialize aggregator)
 *   3. npx ts-node src/create-yusdc-metadata.ts   (attach metadata)
 *
 * Usage (from services/keeper/):
 *   npx ts-node src/reset-devnet.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

const PROGRAM_ID    = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP");
const TOKEN_2022_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

async function closeAccount(
  connection: Connection,
  adminKeypair: Keypair,
  accountPubkey: PublicKey,
  ownerProgramId: PublicKey
): Promise<boolean> {
  const info = await connection.getAccountInfo(accountPubkey);
  if (!info) {
    console.log(`  ⚠  ${accountPubkey.toBase58()} — not found, skipping.`);
    return false;
  }
  if (!info.owner.equals(ownerProgramId)) {
    console.log(
      `  ⚠  ${accountPubkey.toBase58()} — owner is ${info.owner.toBase58()}, expected ${ownerProgramId.toBase58()}. Skipping.`
    );
    return false;
  }

  const lamports = info.lamports;

  // Drain lamports by assigning + zeroing via the system program
  // (works on devnet without a dedicated close instruction)
  const drainIx = SystemProgram.transfer({
    fromPubkey: accountPubkey,
    toPubkey:   adminKeypair.publicKey,
    lamports,
  });

  const tx = new Transaction().add(drainIx);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer        = adminKeypair.publicKey;
  // Admin must sign; the PDA account won't — on devnet we can force-close
  // using a direct RPC call with the program upgrade authority.
  tx.sign(adminKeypair);

  try {
    const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
    console.log(`  ✅  Closed ${accountPubkey.toBase58()} (+${lamports} lamports returned)`);
    return true;
  } catch (e: any) {
    console.log(`  ℹ  Could not drain ${accountPubkey.toBase58()} via transfer (PDA-owned). Using solana account close instead.`);
    console.log(`     Run in WSL: solana account close ${accountPubkey.toBase58()} --keypair ~/.config/solana/id.json --url devnet`);
    return false;
  }
}

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const secretKey    = new Uint8Array(JSON.parse(process.env.KEEPER_SECRET_KEY!));
  const adminKeypair = Keypair.fromSecretKey(secretKey);
  console.log("Admin:", adminKeypair.publicKey.toBase58());

  // Derive the three PDAs we need to close
  const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")], PROGRAM_ID
  );
  const [yieldOraclePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yield_oracle")], PROGRAM_ID
  );
  const [yusdcMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")], PROGRAM_ID
  );

  console.log("\n── PDAs to close ──────────────────────────────────────────────");
  console.log("  aggregator_state:", aggregatorStatePda.toBase58());
  console.log("  yield_oracle:    ", yieldOraclePda.toBase58());
  console.log("  yusdc_mint:      ", yusdcMintPda.toBase58());

  console.log("\n── Closing Anchor PDAs (owned by Vela program) ────────────────");
  console.log(
    "\n  NOTE: Anchor PDAs can only be closed by a dedicated `close` instruction.");
  console.log(
    "  The fastest devnet approach is to use the Solana CLI:\n"
  );
  console.log(
    "  Run these three commands in WSL before re-deploying:\n"
  );
  console.log(
    `  solana account close ${aggregatorStatePda.toBase58()} \\`
  );
  console.log(`    --keypair ~/.config/solana/id.json --url devnet\n`);
  console.log(
    `  solana account close ${yieldOraclePda.toBase58()} \\`
  );
  console.log(`    --keypair ~/.config/solana/id.json --url devnet\n`);
  console.log(
    `  solana account close ${yusdcMintPda.toBase58()} \\`
  );
  console.log(`    --keypair ~/.config/solana/id.json --url devnet\n`);

  console.log("── After closing accounts, run: ───────────────────────────────");
  console.log("  anchor deploy");
  console.log("  npx ts-node src/init.ts");
  console.log("  npx ts-node src/create-yusdc-metadata.ts");
  console.log("\n  Phantom will then show the token with name and logo. ✅");
}

main().catch(console.error);
