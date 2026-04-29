import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import { getProgram, getAggregatorStatePDA, getUserPositionPDA, getYieldOraclePDA, getYusdcMintPDA, getVaultUsdcAccountPDA, getUserYusdcAccountPDA, SPL_TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "./anchor-client";
import { DEVNET_RPC, DEVNET_USDC_MINT, TOKEN_2022_PROGRAM_ID } from "./constants";
import * as anchor from "@coral-xyz/anchor";

export async function buildDepositTx(
  walletPubkey: PublicKey,
  amount: number,
  connection: Connection
): Promise<Transaction> {
  // Use a dummy wallet for the provider just to get the instructions
  const dummyProvider = new anchor.AnchorProvider(connection, {} as any, {});
  const program = getProgram(dummyProvider);

  const amountBn = new anchor.BN(amount * 1_000_000); // 6 decimals

  const usdcMint = new PublicKey(DEVNET_USDC_MINT);
  const aggregatorState = getAggregatorStatePDA();
  const userPosition = getUserPositionPDA(walletPubkey);
  const vaultUsdcAccount = getVaultUsdcAccountPDA(usdcMint);
  const yusdcMint = getYusdcMintPDA();
  const userUsdcAccount = anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: walletPubkey
  });
  const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);

  const tx = new Transaction();

  const yusdcAccountInfoPromise = connection.getAccountInfo(userYusdcAccount);
  const userPositionInfoPromise = connection.getAccountInfo(userPosition);
  const vaultUsdcAccountInfoPromise = connection.getAccountInfo(vaultUsdcAccount);
  
  const [yusdcAccountInfo, userPositionInfo, vaultUsdcAccountInfo] = await Promise.all([
    yusdcAccountInfoPromise, 
    userPositionInfoPromise,
    vaultUsdcAccountInfoPromise
  ]);

  // Inject create Vault ATA if it doesn't exist (happens on very first deposit to protocol)
  if (!vaultUsdcAccountInfo) {
    tx.add(
      new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: walletPubkey, isSigner: true, isWritable: true },
          { pubkey: vaultUsdcAccount, isSigner: false, isWritable: true },
          { pubkey: aggregatorState, isSigner: false, isWritable: false },
          { pubkey: usdcMint, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
      })
    );
  }

  if (!yusdcAccountInfo) {
    // Instruction to create ATA for Token-2022
    tx.add(
      new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: walletPubkey, isSigner: true, isWritable: true },
          { pubkey: userYusdcAccount, isSigner: false, isWritable: true },
          { pubkey: walletPubkey, isSigner: false, isWritable: false },
          { pubkey: yusdcMint, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: new PublicKey(TOKEN_2022_PROGRAM_ID), isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]), // 0 byte instruction means create
      })
    );
  }

  // Inject create_position instruction if the user position doesn't exist yet
  if (!userPositionInfo) {
    const createPosIx = await program.methods
      .createPosition()
      .accounts({
        user: walletPubkey,
        userPosition: userPosition,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    tx.add(createPosIx);
  }

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
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
      token2022Program: new PublicKey(TOKEN_2022_PROGRAM_ID),
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  tx.add(ix);
  return tx;
}

export async function buildWithdrawTx(
  walletPubkey: PublicKey,
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
      owner: walletPubkey
  });
  const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);

  const tx = new Transaction();

  const ix = await program.methods
    .withdraw()
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
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
      token2022Program: new PublicKey(TOKEN_2022_PROGRAM_ID),
    })
    .instruction();

  tx.add(ix);
  return tx;
}
