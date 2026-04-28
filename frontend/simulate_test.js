const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require("@solana/web3.js");
const { Program, AnchorProvider, BN } = require("@coral-xyz/anchor");
const { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require('fs');

const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const PROGRAM_ID = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP");
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

function getAggregatorStatePDA() {
    return PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], PROGRAM_ID)[0];
}

function getUserPositionPDA(userPubkey) {
    return PublicKey.findProgramAddressSync([Buffer.from("user_position"), userPubkey.toBuffer()], PROGRAM_ID)[0];
}

function getYusdcMintPDA() {
    return PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], PROGRAM_ID)[0];
}

function getVaultUsdcAccountPDA(usdcMintPubkey) {
    return getAssociatedTokenAddressSync(usdcMintPubkey, getAggregatorStatePDA(), true);
}

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const wallet = Keypair.generate();
    
    // We will simulate using a dummy wallet. Simulation doesn't strictly need SOL if skipPreflight is used, 
    // but connection.simulateTransaction might check fee payer balance. Let's just catch the error output.

    const idl = JSON.parse(fs.readFileSync("./app/lib/idl.json", "utf8"));
    const provider = new AnchorProvider(connection, { publicKey: wallet.publicKey, signTransaction: async () => {}, signAllTransactions: async () => {} }, {});
    const program = new Program(idl, provider);

    const userPosition = getUserPositionPDA(wallet.publicKey);
    const vaultUsdcAccount = getVaultUsdcAccountPDA(DEVNET_USDC_MINT);
    const userUsdcAccount = getAssociatedTokenAddressSync(DEVNET_USDC_MINT, wallet.publicKey);
    const userYusdcAccount = getAssociatedTokenAddressSync(getYusdcMintPDA(), wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

    const tx = new Transaction();
    tx.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    await connection.requestAirdrop(wallet.publicKey, 1_000_000_000).then(sig => connection.confirmTransaction(sig, "confirmed"));

    tx.add(
      new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: vaultUsdcAccount, isSigner: false, isWritable: true },
          { pubkey: getAggregatorStatePDA(), isSigner: false, isWritable: false },
          { pubkey: DEVNET_USDC_MINT, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
      })
    );

    const createPosIx = await program.methods
        .createPosition()
        .accounts({
            user: wallet.publicKey,
            userPosition: userPosition,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
    tx.add(createPosIx);

    const ix = await program.methods
        .deposit(new BN(50_000_000))
        .accounts({
            user: wallet.publicKey,
            aggregatorState: getAggregatorStatePDA(),
            userPosition,
            usdcMint: DEVNET_USDC_MINT,
            vaultUsdcAccount,
            userUsdcAccount,
            yusdcMint: getYusdcMintPDA(),
            userYusdcAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            token2022Program: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction();
    tx.add(ix);

    console.log("Simulating...");
    const res = await connection.simulateTransaction(tx);
    console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
