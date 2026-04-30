const { Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');

const RPC_URL = "https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023";
const PROGRAM_ID = new PublicKey("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");
const WALLET_PUBKEY = new PublicKey("FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const TOKEN_2022 = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const DEPOSIT_AMOUNT = 50; // $50 USDC

async function main() {
  const conn = new Connection(RPC_URL, "confirmed");
  const idl = JSON.parse(fs.readFileSync('./frontend/app/lib/idl.json', 'utf8'));

  const [aggregatorState] = PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], PROGRAM_ID);
  const [userPosition] = PublicKey.findProgramAddressSync([Buffer.from("user_position"), WALLET_PUBKEY.toBuffer()], PROGRAM_ID);
  const [yusdcMint] = PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], PROGRAM_ID);
  
  const vaultUsdcAccount = getAssociatedTokenAddressSync(DEVNET_USDC_MINT, aggregatorState, true, TOKEN_PROGRAM_ID);
  const userUsdcAccount  = getAssociatedTokenAddressSync(DEVNET_USDC_MINT, WALLET_PUBKEY, false, TOKEN_PROGRAM_ID);
  const userYusdcAccount = getAssociatedTokenAddressSync(yusdcMint, WALLET_PUBKEY, false, TOKEN_2022);

  const dummyWallet = { publicKey: WALLET_PUBKEY, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs };
  const provider = new anchor.AnchorProvider(conn, dummyWallet, { commitment: "confirmed" });
  const program = new anchor.Program(idl, provider);

  const tx = new Transaction();
  tx.feePayer = WALLET_PUBKEY;
  const { blockhash } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  tx.add(createAssociatedTokenAccountIdempotentInstruction(WALLET_PUBKEY, vaultUsdcAccount, aggregatorState, DEVNET_USDC_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM));
  tx.add(createAssociatedTokenAccountIdempotentInstruction(WALLET_PUBKEY, userYusdcAccount, WALLET_PUBKEY, yusdcMint, TOKEN_2022, ASSOCIATED_TOKEN_PROGRAM));

  const createPosIx = await program.methods.createPosition().accounts({
    user: WALLET_PUBKEY, userPosition, systemProgram: SystemProgram.programId,
  }).instruction();
  tx.add(createPosIx);

  const amountBn = new anchor.BN(DEPOSIT_AMOUNT * 1_000_000);
  const depositIx = await program.methods.deposit(amountBn).accounts({
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
  }).instruction();
  tx.add(depositIx);

  const message = tx.compileMessage();
  console.log("\nInstruction Program IDs:");
  message.instructions.forEach((ix, i) => {
    const pId = message.accountKeys[ix.programIdIndex];
    console.log(` ix ${i}: ${pId.toBase58()}`);
  });


  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'simulateTransaction',
      params: [
        tx.serialize({ requireAllSignatures: false }).toString('base64'),
        { encoding: 'base64', replaceRecentBlockhash: true, sigVerify: false }
      ]
    })
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
