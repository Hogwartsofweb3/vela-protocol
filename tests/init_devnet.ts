/**
 * Vela Protocol — Devnet Initialization Test
 *
 * Run this with: anchor test --skip-build --provider.cluster devnet
 *
 * This creates the yUSDC mint PDA, YieldOracle PDA, and AggregatorConfig PDA
 * on Devnet so that deposit transactions can succeed.
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VelaProtocol } from "../target/types/vela_protocol";

describe("Devnet: Initialize Vela Protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.VelaProtocol as Program<VelaProtocol>;
  const admin = provider.wallet;

  const [aggregatorStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    program.programId
  );
  const [yieldOraclePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("yield_oracle")],
    program.programId
  );

  it("Initializes the aggregator on Devnet (idempotent)", async () => {
    // Check if already initialized
    const existing = await provider.connection.getAccountInfo(aggregatorStatePDA);
    if (existing) {
      console.log("✅ Already initialized! AggregatorState exists at:", aggregatorStatePDA.toBase58());
      return;
    }

    console.log("Admin:", admin.publicKey.toBase58());
    console.log("🚀 Running initializeAggregator on Devnet...");

    const TOKEN_2022_PROGRAM_ID = new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

    const [yusdcMintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("yusdc_mint")],
      program.programId
    );

    const tx = await program.methods
      .initializeAggregator()
      .accounts({
        admin: admin.publicKey,
        yusdcMint: yusdcMintPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
        token2022Program: TOKEN_2022_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("✅ Initialized! Tx:", tx);
    console.log("   View: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
  });

  it("Seeds the YieldOracle with initial APY data (5.2% Ondo, 3.8% Kamino)", async () => {
    const oracle = await provider.connection.getAccountInfo(yieldOraclePDA);
    if (!oracle) {
      console.log("⚠️  Oracle PDA not found — initialization may have failed.");
      return;
    }

    // Load the keeper keypair — updateOracle requires the designated keeper authority
    const fs = require("fs");
    const path = require("path");
    const keeperPath = path.join(__dirname, "..", "services", "keeper", "keeper.json");
    const keeperSecret = JSON.parse(fs.readFileSync(keeperPath, "utf8"));
    const keeperKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keeperSecret));
    console.log("Keeper pubkey:", keeperKeypair.publicKey.toBase58());

    const tx = await program.methods
      .updateOracle(520, 380) // 5.20% and 3.80% in basis points
      .accounts({ keeper: keeperKeypair.publicKey })
      .signers([keeperKeypair])
      .rpc();

    console.log("✅ Oracle seeded with APY data! Tx:", tx);
    console.log("   Ondo APY: 5.20% | Kamino APY: 3.80%");
    console.log("   View: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
    console.log("\n🎉 Vela is live on Devnet. Open the dashboard and try a deposit!");
  });
});
