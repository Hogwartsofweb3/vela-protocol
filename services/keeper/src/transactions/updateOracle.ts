import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { createHash } from "crypto";

export async function updateOracle(
    provider: anchor.AnchorProvider,
    programId: PublicKey,
    kaminoApy: number,
    ondoApy: number
) {
    // Derive PDAs
    const [yieldOraclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("yield_oracle")],
        programId
    );
    const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("aggregator_state")],
        programId
    );

    // Discriminator: sha256("global:update_oracle")[..8]
    const sighash = createHash("sha256")
        .update("global:update_oracle")
        .digest()
        .subarray(0, 8);

    // On-chain signature: update_oracle(ondo_apy_bps: u16, kamino_apy_bps: u16)
    // NOTE: ondo is FIRST — must match handle_update_oracle in oracle.rs exactly
    const data = Buffer.alloc(8 + 2 + 2);
    sighash.copy(data, 0);
    data.writeUInt16LE(ondoApy,   8);  // arg 0: ondo_apy_bps
    data.writeUInt16LE(kaminoApy, 10); // arg 1: kamino_apy_bps

    // Account order must match UpdateOracle struct in oracle.rs:
    //   0. keeper            (signer, writable)
    //   1. aggregator_state  (NOT writable — read-only constraint check)
    //   2. yield_oracle      (writable)
    const ix = new anchor.web3.TransactionInstruction({
        programId,
        keys: [
            { pubkey: provider.wallet.publicKey, isSigner: true,  isWritable: true  }, // keeper
            { pubkey: aggregatorStatePda,         isSigner: false, isWritable: false }, // aggregator_state
            { pubkey: yieldOraclePda,             isSigner: false, isWritable: true  }, // yield_oracle
        ],
        data,
    });

    const tx = new anchor.web3.Transaction().add(ix);
    const signature = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    console.log(`✅ Oracle Updated! Ondo: ${ondoApy} bps | Kamino: ${kaminoApy} bps`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Solscan: https://solscan.io/tx/${signature}?cluster=devnet`);
}
