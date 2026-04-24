import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VelaProtocol } from "../target/types/vela_protocol";
import { assert } from "chai";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

describe("vela-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VelaProtocol as Program<VelaProtocol>;
  
  const admin = provider.wallet;
  const user = anchor.web3.Keypair.generate();
  
  let usdcMint: anchor.web3.PublicKey;
  let userUsdcAccount: anchor.web3.PublicKey;

  // PDAs
  const [aggregatorStatePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("aggregator_state")],
    program.programId
  );
  
  const [yieldOraclePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("yield_oracle")],
    program.programId
  );

  const [yusdcMintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("yusdc_mint")],
    program.programId
  );

  before(async () => {
    // Airdrop SOL to user
    const sig = await provider.connection.requestAirdrop(user.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig,
    });

    // Create Mock USDC Mint (6 decimals)
    usdcMint = await createMint(
      provider.connection,
      user, // payer
      admin.publicKey, // authority
      null,
      6,
      anchor.web3.Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID
    );

    // Create User USDC Account
    userUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      user, // payer
      usdcMint,
      user.publicKey,
      undefined,
      TOKEN_PROGRAM_ID
    );

    // Mint 500 USDC to User
    await mintTo(
      provider.connection,
      user, // payer
      usdcMint,
      userUsdcAccount,
      admin.publicKey, // mint authority
      500_000_000, // 500 USDC
      [provider.wallet.payer],
      undefined,
      TOKEN_PROGRAM_ID
    );
  });

  it("1. Initializes the Aggregator and Oracle", async () => {
    await program.methods
      .initializeAggregator()
      .accounts({
        admin: admin.publicKey,
        // aggregatorState, yieldOracle, yusdcMint resolved automatically by Anchor
      })
      .rpc();

    const state = await program.account.aggregatorConfig.fetch(aggregatorStatePDA);
    assert.strictEqual(state.admin.toBase58(), admin.publicKey.toBase58());
    assert.strictEqual(state.totalDeposited.toNumber(), 0);
    assert.strictEqual(state.currentStrategy, 0); // Safe mode default
  });

  it("2. User deposits 100 USDC", async () => {
    const depositAmount = new anchor.BN(100_000_000); // 100 USDC

    // Resolving vault accounts
    const vaultUsdcAccount = getAssociatedTokenAddressSync(
      usdcMint,
      aggregatorStatePDA,
      true,
      TOKEN_PROGRAM_ID
    );

    const userYusdcAccount = getAssociatedTokenAddressSync(
      yusdcMintPDA,
      user.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    await program.methods
      .deposit(depositAmount)
      .accounts({
        user: user.publicKey,
        usdcMint,
        vaultUsdcAccount,
        userUsdcAccount,
        yusdcMint: yusdcMintPDA,
        userYusdcAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const [userPositionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), user.publicKey.toBuffer()],
      program.programId
    );

    const position = await program.account.userPosition.fetch(userPositionPDA);
    assert.strictEqual(position.activeDeposit.toNumber(), 100_000_000);

    const state = await program.account.aggregatorConfig.fetch(aggregatorStatePDA);
    assert.strictEqual(state.totalDeposited.toNumber(), 100_000_000);
  });

  it("3. Keeper updates the Oracle", async () => {
    await program.methods
      .updateOracle(500, 300) // Ondo = 5%, Kamino = 3%
      .accounts({
        keeper: admin.publicKey, // admin is set as keeper in initialize
      })
      .rpc();

    const oracle = await program.account.yieldOracle.fetch(yieldOraclePDA);
    assert.strictEqual(oracle.ondoApyBps, 500);
    assert.strictEqual(oracle.kaminoApyBps, 300);
  });

  it("4. Keeper rebalances capital to High Yield", async () => {
    await program.methods
      .rebalance()
      .accounts({
        keeper: admin.publicKey,
      })
      .rpc();

    const state = await program.account.aggregatorConfig.fetch(aggregatorStatePDA);
    assert.strictEqual(state.currentStrategy, 1); // Rotated to 1 because Ondo is 5% (>3.5%)
  });

  it("5. Keeper rebalances capital back to Safe Treasury when yield collapses", async () => {
    // Drop yield to 2%
    await program.methods
      .updateOracle(200, 300)
      .accounts({ keeper: admin.publicKey })
      .rpc();

    await program.methods
      .rebalance()
      .accounts({ keeper: admin.publicKey })
      .rpc();

    const state = await program.account.aggregatorConfig.fetch(aggregatorStatePDA);
    assert.strictEqual(state.currentStrategy, 0); // Emergency rotation to 0
  });

  it("6. User instantly withdraws 50 USDC", async () => {
    const withdrawAmount = new anchor.BN(50_000_000); // 50 USDC

    const vaultUsdcAccount = getAssociatedTokenAddressSync(
      usdcMint,
      aggregatorStatePDA,
      true,
      TOKEN_PROGRAM_ID
    );

    const userYusdcAccount = getAssociatedTokenAddressSync(
      yusdcMintPDA,
      user.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        user: user.publicKey,
        usdcMint,
        vaultUsdcAccount,
        userUsdcAccount,
        yusdcMint: yusdcMintPDA,
        userYusdcAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const [userPositionPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), user.publicKey.toBuffer()],
      program.programId
    );

    const position = await program.account.userPosition.fetch(userPositionPDA);
    assert.strictEqual(position.activeDeposit.toNumber(), 50_000_000); // 100 - 50

    const state = await program.account.aggregatorConfig.fetch(aggregatorStatePDA);
    assert.strictEqual(state.totalDeposited.toNumber(), 50_000_000);
  });
});
