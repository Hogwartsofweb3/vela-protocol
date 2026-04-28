import { Program, Idl, Provider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
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

// We will use standard SPL Token and Token-2022 constants
export const SPL_TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

export function getAssociatedTokenAddressSync(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = SPL_TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId
    )[0];
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
