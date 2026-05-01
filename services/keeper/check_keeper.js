const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const RPC_URL = "https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023";
const PROGRAM_ID = new PublicKey("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");

async function main() {
    const conn = new Connection(RPC_URL, "confirmed");

    // Load keeper keypair
    const keeperSecret = JSON.parse(fs.readFileSync(path.join(__dirname, "keeper.json"), "utf8"));
    const keeper = Keypair.fromSecretKey(Uint8Array.from(keeperSecret));
    console.log("=== KEEPER WALLET ===");
    console.log("Public Key:", keeper.publicKey.toBase58());
    const keeperBal = await conn.getBalance(keeper.publicKey);
    console.log("SOL Balance:", keeperBal / 1e9, "SOL");

    // Derive and check PDAs
    const [aggregatorPDA] = PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], PROGRAM_ID);
    const [oraclePDA] = PublicKey.findProgramAddressSync([Buffer.from("yield_oracle")], PROGRAM_ID);
    const [yusdcPDA] = PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], PROGRAM_ID);

    console.log("\n=== ON-CHAIN PDAs ===");

    const aggInfo = await conn.getAccountInfo(aggregatorPDA);
    console.log(`AggregatorState (${aggregatorPDA.toBase58()}):`, aggInfo ? `✅ EXISTS (${aggInfo.data.length} bytes)` : "❌ NOT FOUND");

    const oracleInfo = await conn.getAccountInfo(oraclePDA);
    console.log(`YieldOracle     (${oraclePDA.toBase58()}):`, oracleInfo ? `✅ EXISTS (${oracleInfo.data.length} bytes)` : "❌ NOT FOUND");

    const yusdcInfo = await conn.getAccountInfo(yusdcPDA);
    console.log(`yUSDC Mint      (${yusdcPDA.toBase58()}):`, yusdcInfo ? `✅ EXISTS (${yusdcInfo.data.length} bytes)` : "❌ NOT FOUND");

    // Read keeper stored in AggregatorState (bytes 8+32 = the 'admin' field, then 'keeper' field)
    if (aggInfo) {
        // AggregatorConfig layout: discriminator(8) + admin pubkey(32) + keeper pubkey(32) ...
        const admin  = new PublicKey(aggInfo.data.slice(8, 40));
        const storedKeeper = new PublicKey(aggInfo.data.slice(40, 72));
        console.log("\n=== AGGREGATOR STATE ===");
        console.log("Admin (stored):", admin.toBase58());
        console.log("Keeper (stored on-chain):", storedKeeper.toBase58());
        console.log("Keeper wallet matches:", storedKeeper.toBase58() === keeper.publicKey.toBase58() ? "✅ YES" : "❌ NO — MISMATCH!");
    }
}

main().catch(console.error);
