import { Connection, Keypair } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { fetchOndoApyBps } from "./fetchers/ondo";
import { fetchKaminoApyBps } from "./fetchers/kamino";
import { writeOracleData } from "./writer";
import { ProtocolRouter } from "./router";
import * as fs from "fs";

// Load environment variables
dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
const KEEPER_KEYPAIR_PATH = process.env.KEEPER_KEYPAIR_PATH || "./keeper.json";

// The core loop interval (30 seconds)
const UPDATE_INTERVAL_MS = 30 * 1000;

// Simple wait helper
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Executes a function with exponential backoff retries.
 */
async function withRetries<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      console.error(`[Retry Logic] Operation failed (Attempt ${attempt}/${maxRetries}): ${error.message}`);
      if (attempt >= maxRetries) {
        throw new Error("Max retries reached. Operation failed permanently.");
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`[Retry Logic] Waiting ${delay}ms before retrying...`);
      await sleep(delay);
    }
  }
  throw new Error("Unreachable");
}

async function startKeeper() {
  console.log("🌊 Vela Protocol Keeper Service Started");
  console.log(`Connecting to RPC: ${RPC_URL}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const router = new ProtocolRouter(connection);

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
      // 1. Fetch Rates Concurrently (With Retries)
      const ondoApyBps = await withRetries(() => fetchOndoApyBps(), 3);
      const kaminoApyBps = await withRetries(() => fetchKaminoApyBps(connection), 3);

      // 2. Write to Oracle (With Retries)
      await withRetries(() => writeOracleData(connection, keeperKeypair, ondoApyBps, kaminoApyBps), 3);
      
      // 3. Optional: Trigger Router evaluation
      // (Assuming current protocol is ONDO and deploying 100 USDC)
      const mockAmount = new (require("bn.js"))(100_000_000); 
      await router.routeRebalance("ONDO", mockAmount, keeperKeypair);

    } catch (error) {
      console.error("[CRITICAL] Round execution completely failed:", error);
    }
  };

  // Run the first round immediately
  await executeRound();

  // Schedule the loop
  setInterval(executeRound, UPDATE_INTERVAL_MS);
}

// Start the engine
startKeeper().catch(console.error);
