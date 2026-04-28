import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// Removed type import since we are bypassing IDL generation for now

/**
 * Pushes updated APY rates to the YieldOracle PDA on-chain.
 * 
 * @param connection The Solana RPC connection
 * @param keeperKeypair The authorized keeper wallet keypair
 * @param ondoApyBps Current Ondo APY in basis points
 * @param kaminoApyBps Current Kamino APY in basis points
 */
export async function writeOracleData(
  connection: Connection,
  keeperKeypair: Keypair,
  ondoApyBps: number,
  kaminoApyBps: number
) {
  try {
    const wallet = new anchor.Wallet(keeperKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    // Load the IDL dynamically if the types aren't fully resolving in the dev environment
    // or use the workspace if running within Anchor context.
    // For this standalone Node.js service, we load the program ID directly.
    const programId = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP"); // Deployed Devnet ID
    const idl = require("../../../target/idl/vela_protocol.json");
    const program = new anchor.Program(idl, provider) as anchor.Program<any>;

    // Derive PDAs
    const [aggregatorStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("aggregator_state")],
      programId
    );

    const [yieldOraclePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("yield_oracle")],
      programId
    );

    console.log(`[Oracle Writer] Pushing rates to YieldOracle PDA: ${yieldOraclePDA.toBase58()}`);
    console.log(`[Oracle Writer] Rates - Ondo: ${ondoApyBps} bps | Kamino: ${kaminoApyBps} bps`);

    // Call update_oracle instruction
    const tx = await program.methods
      .updateOracle(ondoApyBps, kaminoApyBps)
      .accounts({
        keeper: keeperKeypair.publicKey,
        aggregatorState: aggregatorStatePDA,
        yieldOracle: yieldOraclePDA,
      })
      .signers([keeperKeypair])
      .rpc();

    console.log(`[Oracle Writer] Success! Transaction signature: ${tx}`);
  } catch (error) {
    console.error("[Oracle Writer] Failed to write to oracle:", error);
  }
}
