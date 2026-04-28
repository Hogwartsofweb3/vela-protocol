import { Connection, Keypair } from "@solana/web3.js";
import { buildDepositTx } from "./app/lib/transaction-builder";

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    // Generate a fresh keypair so we simulate a brand new user
    const dummyUser = Keypair.generate();
    
    // We need to airdrop some SOL so simulation doesn't fail on "AccountNotFound" for fee payer
    console.log("Airdropping SOL to dummy user...");
    const sig = await connection.requestAirdrop(dummyUser.publicKey, 1_000_000_000);
    await connection.confirmTransaction(sig, "confirmed");

    console.log("Building deposit tx...");
    const tx = await buildDepositTx(dummyUser.publicKey, 50, connection);
    
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = dummyUser.publicKey;

    console.log("Simulating transaction...");
    const result = await connection.simulateTransaction(tx);
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
