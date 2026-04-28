import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import { createHash } from "crypto";

export async function updateOracle(
    provider: anchor.AnchorProvider, 
    programId: PublicKey, 
    kaminoApy: number, 
    ondoApy: number
) {
    // For the hackathon demo, we construct the raw instruction
    // In production, we'd use the IDL
    
    // Find YieldOracle PDA
    const [yieldOraclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("yield_oracle")],
        programId
    );

    // Find AggregatorState PDA to verify keeper authority
    const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("aggregator_state")],
        programId
    );

    // Manually construct the discriminator for `update_oracle`
    // Sha256("global:update_oracle")[..8]
    const sighash = createHash("sha256").update("global:update_oracle").digest().subarray(0, 8);

    // Serialize arguments (kamino_apy_bps: u16, ondo_apy_bps: u16)
    const data = Buffer.alloc(8 + 2 + 2);
    sighash.copy(data, 0);
    data.writeUInt16LE(kaminoApy, 8);
    data.writeUInt16LE(ondoApy, 10);

    const ix = new anchor.web3.TransactionInstruction({
        programId,
        keys: [
            { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: aggregatorStatePda, isSigner: false, isWritable: false },
            { pubkey: yieldOraclePda, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data
    });

    const tx = new anchor.web3.Transaction().add(ix);
    const signature = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    console.log(`✅ Oracle Updated! Signature: ${signature}`);
}
