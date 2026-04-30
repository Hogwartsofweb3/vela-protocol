import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { getProgram, getAggregatorStatePDA, getUserPositionPDA, getYusdcMintPDA, getVaultUsdcAccountPDA, getUserYusdcAccountPDA, SPL_TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "./app/lib/anchor-client";
import { DEVNET_USDC_MINT, TOKEN_2022_PROGRAM_ID } from "./app/lib/constants";
import * as anchor from "@coral-xyz/anchor";

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', "confirmed");
    const walletPubkey = new PublicKey('FfS9iT3m3YmKntQ2bYn6fG515S5P3G18G21c45y5ZvQZ');
    const amount = 55;

    const dummyProvider = new anchor.AnchorProvider(connection, {} as any, {});
    const program = getProgram(dummyProvider);
    const amountBn = new anchor.BN(amount * 1_000_000);

    const usdcMint = new PublicKey(DEVNET_USDC_MINT);
    const aggregatorState = getAggregatorStatePDA();
    const userPosition = getUserPositionPDA(walletPubkey);
    const vaultUsdcAccount = getVaultUsdcAccountPDA(usdcMint);
    const yusdcMint = getYusdcMintPDA();
    const userUsdcAccount = anchor.utils.token.associatedAddress({ mint: usdcMint, owner: walletPubkey });
    const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);

    const tx = new Transaction();
    const [yusdcAccountInfo, userPositionInfo, vaultUsdcAccountInfo] = await Promise.all([
        connection.getAccountInfo(userYusdcAccount),
        connection.getAccountInfo(userPosition),
        connection.getAccountInfo(vaultUsdcAccount)
    ]);

    if (!vaultUsdcAccountInfo) {
        tx.add(new anchor.web3.TransactionInstruction({
            keys: [
                { pubkey: walletPubkey, isSigner: true, isWritable: true },
                { pubkey: vaultUsdcAccount, isSigner: false, isWritable: true },
                { pubkey: aggregatorState, isSigner: false, isWritable: false },
                { pubkey: usdcMint, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([]),
        }));
    }

    if (!yusdcAccountInfo) {
        tx.add(new anchor.web3.TransactionInstruction({
            keys: [
                { pubkey: walletPubkey, isSigner: true, isWritable: true },
                { pubkey: userYusdcAccount, isSigner: false, isWritable: true },
                { pubkey: walletPubkey, isSigner: false, isWritable: false },
                { pubkey: yusdcMint, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: new PublicKey(TOKEN_2022_PROGRAM_ID), isSigner: false, isWritable: false },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([]),
        }));
    }

    if (!userPositionInfo) {
        const createPosIx = await program.methods.createPosition().accounts({ user: walletPubkey, userPosition, systemProgram: SystemProgram.programId }).instruction();
        tx.add(createPosIx);
    }

    const ix = await program.methods.deposit(amountBn).accounts({
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
    }).instruction();
    tx.add(ix);

    const latestBlockhash = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = walletPubkey;

    console.log("Simulating transaction for debugging...");
    const simRes = await connection.simulateTransaction(tx);
    console.log(JSON.stringify(simRes, null, 2));
}

main().catch(console.error);
