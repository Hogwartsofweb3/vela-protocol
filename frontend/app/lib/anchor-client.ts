import { Program, Idl, Provider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync as splGetATA, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID as SPL_TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import idl from "./idl.json";
import { PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "./constants";

export const programId = new PublicKey(PROGRAM_ID);

export function getProgram(provider: Provider) {
  return new Program(idl as Idl, provider);
}

export function getAggregatorStatePDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    programId
  )[0];
}

export function getUserPositionPDA(userPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_position"), userPubkey.toBuffer()],
    programId
  )[0];
}

export function getYieldOraclePDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("yield_oracle")],
    programId
  )[0];
}

export function getYusdcMintPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")],
    programId
  )[0];
}

// Use official constants from @solana/spl-token — avoids typos
export const SPL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID;
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bQ");

export function getAssociatedTokenAddressSync(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    tokenProgramId = SPL_TOKEN_PROGRAM_ID,
): PublicKey {
    return splGetATA(mint, owner, allowOwnerOffCurve, tokenProgramId);
}

export function getVaultUsdcAccountPDA(usdcMint: PublicKey) {
  return getAssociatedTokenAddressSync(
    usdcMint,
    getAggregatorStatePDA(),
    true
  );
}

export function getUserYusdcAccountPDA(userPubkey: PublicKey) {
  return getAssociatedTokenAddressSync(
    getYusdcMintPDA(),
    userPubkey,
    false,
    new PublicKey(TOKEN_2022_PROGRAM_ID)
  );
}
