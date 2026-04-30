/**
 * Simulate a deposit transaction and print EXACT error logs.
 * Run: node test_deposit_sim.js
 */
const { Connection, PublicKey, Transaction, SystemProgram, Keypair } = require('@solana/web3.js');
const { createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

const RPC_URL = "https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023";
const PROGRAM_ID = new PublicKey("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");
const WALLET_PUBKEY = new PublicKey("FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bQ");
const DEPOSIT_AMOUNT = 50; // $50 USDC

async function main() {
  const conn = new Connection(RPC_URL, "confirmed");
  const idl = JSON.parse(fs.readFileSync(path.join(__dirname, 'idl', 'vela_protocol.json'), 'utf8'));

  // Derive PDAs
  const [aggregatorState] = PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], PROGRAM_ID);
  const [userPosition] = PublicKey.findProgramAddressSync([Buffer.from("user_position"), WALLET_PUBKEY.toBuffer()], PROGRAM_ID);
  const [yusdcMint] = PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], PROGRAM_ID);
  const [yieldOracle] = PublicKey.findProgramAddressSync([Buffer.from("yield_oracle")], PROGRAM_ID);

  const vaultUsdcAccount = getAssociatedTokenAddressSync(DEVNET_USDC_MINT, aggregatorState, true, TOKEN_PROGRAM_ID);
  const userUsdcAccount  = getAssociatedTokenAddressSync(DEVNET_USDC_MINT, WALLET_PUBKEY, false, TOKEN_PROGRAM_ID);
  const userYusdcAccount = getAssociatedTokenAddressSync(yusdcMint, WALLET_PUBKEY, false, TOKEN_2022);

  console.log("📍 Addresses:");
  console.log("  AggregatorState:", aggregatorState.toBase58());
  console.log("  YieldOracle:    ", yieldOracle.toBase58());
  console.log("  yUSDC Mint:     ", yusdcMint.toBase58());
  console.log("  Vault USDC ATA: ", vaultUsdcAccount.toBase58());
  console.log("  User USDC ATA:  ", userUsdcAccount.toBase58());
  console.log("  User yUSDC ATA: ", userYusdcAccount.toBase58());
  console.log("  User Position:  ", userPosition.toBase58());

  console.log("\n📊 Account States:");
  const [aggInfo, oracleInfo, yusdcInfo, vaultInfo, userPosInfo, userUsdcInfo, userYusdcInfo] = await Promise.all([
    conn.getAccountInfo(aggregatorState),
    conn.getAccountInfo(yieldOracle),
    conn.getAccountInfo(yusdcMint),
    conn.getAccountInfo(vaultUsdcAccount),
    conn.getAccountInfo(userPosition),
    conn.getAccountInfo(userUsdcAccount),
    conn.getAccountInfo(userYusdcAccount),
  ]);
  console.log("  AggregatorState:", !!aggInfo, aggInfo?.owner?.toBase58());
  console.log("  YieldOracle:    ", !!oracleInfo, oracleInfo?.owner?.toBase58());
  console.log("  yUSDC Mint:     ", !!yusdcInfo, yusdcInfo?.owner?.toBase58());
  console.log("  Vault USDC ATA: ", !!vaultInfo, "← needs creating:", !vaultInfo);
  console.log("  User USDC ATA:  ", !!userUsdcInfo);
  console.log("  User yUSDC ATA: ", !!userYusdcInfo, "← needs creating:", !userYusdcInfo);
  console.log("  User Position:  ", !!userPosInfo, "← needs creating:", !userPosInfo);

  // Build the transaction
  const dummyWallet = { publicKey: WALLET_PUBKEY, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs };
  const provider = new anchor.AnchorProvider(conn, dummyWallet, { commitment: "confirmed" });
  const program = new anchor.Program(idl, provider);

  const tx = new Transaction();
  tx.feePayer = WALLET_PUBKEY;

  // Idempotent ATA creations
  tx.add(createAssociatedTokenAccountIdempotentInstruction(WALLET_PUBKEY, vaultUsdcAccount, aggregatorState, DEVNET_USDC_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM));
  tx.add(createAssociatedTokenAccountIdempotentInstruction(WALLET_PUBKEY, userYusdcAccount, WALLET_PUBKEY, yusdcMint, TOKEN_2022, ASSOCIATED_TOKEN_PROGRAM));

  if (!userPosInfo) {
    const createPosIx = await program.methods.createPosition().accounts({
      user: WALLET_PUBKEY, userPosition, systemProgram: SystemProgram.programId,
    }).instruction();
    tx.add(createPosIx);
    console.log("\n✅ createPosition instruction added");
  }

  // Check IDL for deposit accounts
  const depositAccounts = {
    user: WALLET_PUBKEY,
    aggregatorState,
    userPosition,
    usdcMint: DEVNET_USDC_MINT,
    vaultUsdcAccount,
    userUsdcAccount,
    yusdcMint,
    userYusdcAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    token2022Program: TOKEN_2022,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM,
  };

  console.log("\n🔍 Deposit accounts:", JSON.stringify(Object.fromEntries(Object.entries(depositAccounts).map(([k,v]) => [k, v.toBase58()])), null, 2));

  const amountBn = new anchor.BN(DEPOSIT_AMOUNT * 1_000_000);
  try {
    const depositIx = await program.methods.deposit(amountBn).accounts(depositAccounts).instruction();
    tx.add(depositIx);
  } catch(e) {
    console.error("\n❌ Error building deposit instruction:", e.message);
    return;
  }

  // Simulate with sigVerify: false (no wallet needed)
  const { blockhash } = await conn.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash;

  console.log("\n🔁 Simulating transaction (sigVerify: false)...");
  let simResult;
  try {
    simResult = await conn.simulateTransaction(tx, { sigVerify: false });
  } catch(e) {
    console.error("\n❌ simulateTransaction threw:", e.message);
    // Try legacy API
    simResult = await conn.simulateTransaction(tx, undefined);
  }
  
  console.log("\n📋 Simulation Result:");
  console.log("  Error:", JSON.stringify(simResult.value.err));
  console.log("  UnitsConsumed:", simResult.value.unitsConsumed);
  console.log("  Logs:");
  (simResult.value.logs || []).forEach(log => console.log("   ", log));
  if (!simResult.value.err) console.log("\n✅ SIMULATION PASSED!");
}

main().catch(console.error);
