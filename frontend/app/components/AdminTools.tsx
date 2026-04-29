"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "../lib/idl.json";
import { PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "../lib/constants";

export function AdminTools() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const ADMIN_WALLET = "FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ";

  if (!publicKey || publicKey.toBase58() !== ADMIN_WALLET) {
    return null; // Only show for the admin wallet
  }

  const handleSetMetadata = async () => {
    setLoading(true);
    setMsg("Initializing yUSDC metadata...");
    try {
      const provider = new AnchorProvider(connection, {
        publicKey: publicKey,
        signTransaction: signTransaction as any,
        signAllTransactions: async (txs) => txs,
      }, { commitment: "confirmed" });

      const program = new Program(idl as any, provider);
      
      const programIdObj = new PublicKey(PROGRAM_ID);
      const [aggregatorStatePda] = PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], programIdObj);
      const [yusdcMintPda] = PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], programIdObj);

      const tx = await program.methods
        .createTokenMetadata(
          "Vela Yield USD",
          "yUSDC",
          "https://raw.githubusercontent.com/Hogwartsofweb3/vela-protocol/main/assets/yusdc-metadata.json"
        )
        .accounts({
          admin: publicKey,
          aggregatorState: aggregatorStatePda,
          yusdcMint: yusdcMintPda,
          token2022Program: new PublicKey(TOKEN_2022_PROGRAM_ID),
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      setMsg(`✅ Success! Phantom will now show yUSDC. (Tx: ${signature.slice(0,8)}...)`);
    } catch (e: any) {
      console.error(e);
      setMsg(`❌ Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-red-900/20 border border-red-500/50 rounded-xl p-4 text-center">
      <h3 className="text-red-400 font-bold mb-2">Admin Tools</h3>
      <p className="text-xs text-red-300 mb-4">Set the token metadata for Phantom.</p>
      <button
        onClick={handleSetMetadata}
        disabled={loading}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold disabled:opacity-50 transition-all"
      >
        {loading ? "Writing Metadata..." : "Initialize yUSDC Metadata"}
      </button>
      {msg && <p className="text-xs text-red-200 mt-3">{msg}</p>}
    </div>
  );
}
