import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  getProgram,
  getAggregatorStatePDA,
  getUserPositionPDA,
  getYusdcMintPDA,
  getVaultUsdcAccountPDA,
  getUserYusdcAccountPDA,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "./anchor-client";
import { DEVNET_USDC_MINT, TOKEN_2022_PROGRAM_ID } from "./constants";
import * as anchor from "@coral-xyz/anchor";

const TOKEN_2022_PROGRAM_PUBKEY = new PublicKey(TOKEN_2022_PROGRAM_ID);

export async function buildDepositTx(
  walletPubkey: PublicKey,
  amount: number,
  connection: Connection
): Promise<Transaction> {
  const dummyProvider = new anchor.AnchorProvider(connection, {} as any, {});
  const program = getProgram(dummyProvider);

  const amountBn = new anchor.BN(Math.floor(amount * 1_000_000)); // 6 decimals

  const usdcMint = new PublicKey(DEVNET_USDC_MINT);
  const aggregatorState = getAggregatorStatePDA();
  const userPosition = getUserPositionPDA(walletPubkey);
  const vaultUsdcAccount = getVaultUsdcAccountPDA(usdcMint);
  const yusdcMint = getYusdcMintPDA();
  const userUsdcAccount = anchor.utils.token.associatedAddress({
    mint: usdcMint,
    owner: walletPubkey,
  });
  const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);

  const tx = new Transaction();

  // ── 1. Idempotent: create Vault USDC ATA (no-op if already exists)
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      walletPubkey,       // payer
      vaultUsdcAccount,   // ATA address
      aggregatorState,    // owner (PDA, off-curve)
      usdcMint,           // mint
      TOKEN_PROGRAM_ID,   // token program
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  // ── 2. Idempotent: create User yUSDC ATA (Token-2022, no-op if already exists)
  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      walletPubkey,               // payer
      userYusdcAccount,           // ATA address
      walletPubkey,               // owner
      yusdcMint,                  // mint
      TOKEN_2022_PROGRAM_PUBKEY,  // token-2022 program
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  // ── 3. Idempotent: create user Position PDA (safe to re-include)
  try {
    const userPositionInfo = await connection.getAccountInfo(userPosition);
    if (!userPositionInfo) {
      const createPosIx = await program.methods
        .createPosition()
        .accounts({
          user: walletPubkey,
          userPosition,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      tx.add(createPosIx);
    }
  } catch {
    // If RPC fails, include the instruction anyway (program will no-op if already exists)
    try {
      const createPosIx = await program.methods
        .createPosition()
        .accounts({
          user: walletPubkey,
          userPosition,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      tx.add(createPosIx);
    } catch {}
  }

  // ── 4. The actual deposit instruction
  const ix = await program.methods
    .deposit(amountBn)
    .accounts({
      user: walletPubkey,
      aggregatorState,
      userPosition,
      usdcMint,
      vaultUsdcAccount,
      userUsdcAccount,
      yusdcMint,
      userYusdcAccount,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_PUBKEY,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  tx.add(ix);
  return tx;
}

export async function buildWithdrawTx(
  walletPubkey: PublicKey,
  amount: number,
  connection: Connection
): Promise<Transaction> {
  const dummyProvider = new anchor.AnchorProvider(connection, {} as any, {});
  const program = getProgram(dummyProvider);

  const usdcMint = new PublicKey(DEVNET_USDC_MINT);
  const aggregatorState = getAggregatorStatePDA();
  const userPosition = getUserPositionPDA(walletPubkey);
  const vaultUsdcAccount = getVaultUsdcAccountPDA(usdcMint);
  const yusdcMint = getYusdcMintPDA();
  const userUsdcAccount = anchor.utils.token.associatedAddress({
    mint: usdcMint,
    owner: walletPubkey,
  });
  const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);

  const tx = new Transaction();

  const ix = await program.methods
    .withdraw(new anchor.BN(amount * 1_000_000))
    .accounts({
      user: walletPubkey,
      aggregatorState,
      userPosition,
      usdcMint,
      vaultUsdcAccount,
      userUsdcAccount,
      yusdcMint,
      userYusdcAccount,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      token2022Program: TOKEN_2022_PROGRAM_PUBKEY,
    })
    .instruction();

  tx.add(ix);
  return tx;
}
