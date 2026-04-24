import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// Note: This import requires `anchor build` to have been run in the WSL environment
import { VelaProtocol } from "../../target/types/vela_protocol";

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
    const programId = new PublicKey("vELaP4bE8YfS2PqNXZj5m3tEwP6dZk3P"); // From Anchor.toml
    
    // We cast to any here to avoid compilation errors before `anchor build` generates the types
    const idl = require("../../target/idl/vela_protocol.json");
    const program = new anchor.Program(idl, programId, provider) as anchor.Program<any>;

    // Derive the YieldOracle PDA
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
        yieldOracle: yieldOraclePDA,
        keeper: keeperKeypair.publicKey,
      })
      .signers([keeperKeypair])
      .rpc();

    console.log(`[Oracle Writer] Success! Transaction signature: ${tx}`);
  } catch (error) {
    console.error("[Oracle Writer] Failed to write to oracle:", error);
  }
}
