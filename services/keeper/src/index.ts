import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import { getOndoApy } from "./fetchers/ondo";
import { getKaminoApy } from "./fetchers/kamino";
import { updateOracle } from "./transactions/updateOracle";
import { triggerRebalance } from "./transactions/rebalance";

dotenv.config();

// KEEPER AUTHORITY
// Use the secret key from the local Solana CLI that deployed the contract
const KEEPER_SECRET = process.env.KEEPER_SECRET_KEY;
if (!KEEPER_SECRET) {
    console.error("CRITICAL ERROR: KEEPER_SECRET_KEY not found in .env");
    process.exit(1);
}

// Parse the JSON array from solana CLI id.json
const secretArray = new Uint8Array(JSON.parse(KEEPER_SECRET));
const keeperKeypair = Keypair.fromSecretKey(secretArray);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(keeperKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

// You will need to copy the IDL here or load it dynamically
// For now, we will mock the program invocation logic
const VELA_PROGRAM_ID = new PublicKey("22jxKPxpHpHPA1aXjczuyVwVj3GPS5CBKz98dQNPAGjP");

async function runKeeperCycle() {
    console.log(`\n[${new Date().toISOString()}] Starting Keeper Cycle...`);
    console.log(`Keeper Authority: ${keeperKeypair.publicKey.toBase58()}`);

    try {
        // 1. Fetch real-world APYs
        console.log("Fetching yields...");
        const kaminoApy = await getKaminoApy();
        const ondoApy = await getOndoApy();
        console.log(`Kamino USDC APY: ${(kaminoApy / 100).toFixed(2)}%`);
        console.log(`Ondo USDY APY: ${(ondoApy / 100).toFixed(2)}%`);

        // 2. Update On-Chain Oracle
        console.log("Pushing yields to on-chain YieldOracle...");
        await updateOracle(provider, VELA_PROGRAM_ID, kaminoApy, ondoApy);

        // 3. Trigger Rebalance Evaluation
        console.log("Evaluating strategy and triggering rebalance...");
        await triggerRebalance(provider, VELA_PROGRAM_ID);

        console.log("Keeper Cycle Complete. Sleeping for 1 minute...");
    } catch (err) {
        console.error("Keeper Cycle Failed:", err);
    }
}

// Run immediately, then every 60 seconds
runKeeperCycle();
setInterval(runKeeperCycle, 60 * 1000);
