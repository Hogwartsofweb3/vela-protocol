/**
 * create-yusdc-metadata.ts
 *
 * One-time script: attaches Token-2022 NATIVE metadata to the yUSDC mint.
 * Run AFTER deploying the updated program AND re-initialising the aggregator
 * (the new initialize instruction creates the mint with MetadataPointer).
 *
 * Usage (from services/keeper/):
 *   npx ts-node src/create-yusdc-metadata.ts
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
import { createHash } from "crypto";

dotenv.config();

// ── Constants ──────────────────────────────────────────────────────────────────
const PROGRAM_ID    = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP");
const TOKEN_2022_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

// Metadata values — these are what Phantom shows
const TOKEN_NAME   = "Vela Yield USD";
const TOKEN_SYMBOL = "yUSDC";
const TOKEN_URI    =
  "https://raw.githubusercontent.com/Hogwartsofweb3/vela-protocol/main/assets/yusdc-metadata.json";

// ── Borsh string encoder ───────────────────────────────────────────────────────
function encodeString(s: string): Buffer {
  const bytes = Buffer.from(s, "utf-8");
  const len   = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}

// ── Anchor discriminator builder ───────────────────────────────────────────────
function discriminator(name: string): Buffer {
  return createHash("sha256")
    .update(`global:${name}`)
    .digest()
    .subarray(0, 8);
}

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const secretKey    = new Uint8Array(JSON.parse(process.env.KEEPER_SECRET_KEY!));
  const adminKeypair = Keypair.fromSecretKey(secretKey);
  console.log("Admin:", adminKeypair.publicKey.toBase58());

  // ── Derive PDAs ──────────────────────────────────────────────────────────────
  const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    PROGRAM_ID
  );
  const [yusdcMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")],
    PROGRAM_ID
  );

  console.log("aggregator_state:", aggregatorStatePda.toBase58());
  console.log("yusdc_mint:      ", yusdcMintPda.toBase58());

  // ── Verify the mint exists and has MetadataPointer extension ────────────────
  const mintInfo = await connection.getAccountInfo(yusdcMintPda);
  if (!mintInfo) {
    console.error(
      "\n❌  yUSDC mint does not exist on devnet.\n" +
      "   Run the reset + re-initialize flow first:\n" +
      "   npx ts-node src/reset-devnet.ts\n"
    );
    process.exit(1);
  }

  // ── Build the create_token_metadata instruction ──────────────────────────────
  // Account order mirrors CreateTokenMetadata in create_metadata.rs:
  //   0. admin             (signer, writable)
  //   1. aggregator_state  (writable — PDA signer in the program)
  //   2. yusdc_mint        (writable)
  //   3. token_2022_program
  //   4. system_program
  const disc = discriminator("create_token_metadata");
  const data = Buffer.concat([
    disc,
    encodeString(TOKEN_NAME),
    encodeString(TOKEN_SYMBOL),
    encodeString(TOKEN_URI),
  ]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: adminKeypair.publicKey, isSigner: true,  isWritable: true  }, // admin
      { pubkey: aggregatorStatePda,     isSigner: false, isWritable: true  }, // aggregator_state
      { pubkey: yusdcMintPda,           isSigner: false, isWritable: true  }, // yusdc_mint
      { pubkey: TOKEN_2022_ID,          isSigner: false, isWritable: false }, // token_2022_program
      { pubkey: SystemProgram.programId,isSigner: false, isWritable: false }, // system_program
    ],
    data,
  });

  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer        = adminKeypair.publicKey;
  tx.sign(adminKeypair);

  console.log("\nSending create_token_metadata transaction…");
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
  });
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

  console.log("\n✅  yUSDC Token-2022 metadata created!");
  console.log("   Signature:", sig);
  console.log(
    "   Solscan:  ",
    `https://solscan.io/tx/${sig}?cluster=devnet`
  );
  console.log(
    "\n   Phantom will now show \"Vela Yield USD (yUSDC)\" with the Vela logo."
  );
}

main().catch(console.error);
