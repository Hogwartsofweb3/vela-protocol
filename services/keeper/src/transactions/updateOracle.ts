import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

export async function updateOracle(
    provider: anchor.AnchorProvider,
    programId: PublicKey,
    kaminoApy: number,
    ondoApy: number
) {
    // Load IDL directly so Anchor can compute the discriminator correctly
    const idlPath = path.join(__dirname, "../../../../frontend/app/lib/idl.json");
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
    const program = new anchor.Program(idl, provider);

    // Derive PDAs
    const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("aggregator_state")],
        programId
    );
    const [yieldOraclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("yield_oracle")],
        programId
    );

    // Use Anchor's program.methods — it computes the discriminator correctly from the IDL
    // NOTE: ondo_apy_bps is arg 0, kamino_apy_bps is arg 1 (must match oracle.rs)
    const tx = await program.methods
        .updateOracle(ondoApy, kaminoApy)
        .accounts({
            keeper: provider.wallet.publicKey,
            aggregatorState: aggregatorStatePda,
            yieldOracle: yieldOraclePda,
        })
        .rpc({ commitment: "confirmed" });

    console.log(`✅ Oracle Updated! Ondo: ${ondoApy} bps | Kamino: ${kaminoApy} bps`);
    console.log(`   Signature: ${tx}`);
    console.log(`   Solscan: https://solscan.io/tx/${tx}?cluster=devnet`);
}
