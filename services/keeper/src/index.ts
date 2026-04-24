import { Connection, Keypair } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { fetchOndoApyBps } from "./fetchers/ondo";
import { fetchKaminoApyBps } from "./fetchers/kamino";
import { writeOracleData } from "./writer";
import * as fs from "fs";

// Load environment variables
dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
const KEEPER_KEYPAIR_PATH = process.env.KEEPER_KEYPAIR_PATH || "./keeper.json";

// The core loop interval (30 seconds)
const UPDATE_INTERVAL_MS = 30 * 1000;

async function startKeeper() {
  console.log("🌊 Vela Protocol Keeper Service Started");
  console.log(`Connecting to RPC: ${RPC_URL}`);

  const connection = new Connection(RPC_URL, "confirmed");

  // Load the keeper keypair
  let keeperKeypair: Keypair;
  try {
    const keypairFile = fs.readFileSync(KEEPER_KEYPAIR_PATH, "utf-8");
    const secretKey = Uint8Array.from(JSON.parse(keypairFile));
    keeperKeypair = Keypair.fromSecretKey(secretKey);
    console.log(`Keeper wallet loaded: ${keeperKeypair.publicKey.toBase58()}`);
  } catch (error) {
    console.error(`Failed to load keypair at ${KEEPER_KEYPAIR_PATH}.`);
    console.error("Please generate a keypair using 'solana-keygen new -o keeper.json'");
    process.exit(1);
  }

  // Define the core execution loop
  const executeRound = async () => {
    console.log("\n--- Starting Keeper Round ---");
    const timestamp = new Date().toISOString();
    console.log(`Time: ${timestamp}`);

    try {
      // 1. Fetch Rates Concurrently
      const [ondoApyBps, kaminoApyBps] = await Promise.all([
        fetchOndoApyBps(),
        fetchKaminoApyBps(connection)
      ]);

      // 2. Write to Oracle
      await writeOracleData(connection, keeperKeypair, ondoApyBps, kaminoApyBps);
      
    } catch (error) {
      console.error("Error during keeper round execution:", error);
    }
  };

  // Run the first round immediately
  await executeRound();

  // Schedule the loop
  setInterval(executeRound, UPDATE_INTERVAL_MS);
}

// Start the engine
startKeeper().catch(console.error);
