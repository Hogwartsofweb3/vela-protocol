import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import { createHash } from "crypto";

export async function triggerRebalance(
    provider: anchor.AnchorProvider, 
    programId: PublicKey
) {
    // Find YieldOracle PDA
    const [yieldOraclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("yield_oracle")],
        programId
    );

    // Find AggregatorState PDA
    const [aggregatorStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("aggregator_state")],
        programId
    );

    const sighash = createHash("sha256").update("global:rebalance").digest().subarray(0, 8);

    const ix = new anchor.web3.TransactionInstruction({
        programId,
        keys: [
            { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: aggregatorStatePda, isSigner: false, isWritable: true },
            { pubkey: yieldOraclePda, isSigner: false, isWritable: false }
        ],
        data: sighash // no args
    });

    const tx = new anchor.web3.Transaction().add(ix);
    const signature = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    console.log(`✅ Rebalance Evaluated! Signature: ${signature}`);
}
