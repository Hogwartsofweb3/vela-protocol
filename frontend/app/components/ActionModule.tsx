"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { MIN_DEPOSIT_USDC, DEVNET_USDC_MINT } from "../lib/constants";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { buildDepositTx, buildWithdrawTx } from "../lib/transaction-builder";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export function ActionModule() {
  const { publicKey, connected, sendTransaction, connect, select, wallets } = useWallet();
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numAmount = parseFloat(amount || "0");
  const isDepositError = activeTab === "deposit" && numAmount > 0 && numAmount < MIN_DEPOSIT_USDC;

  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setUsdcBalance(0);
      return;
    }
    
    const fetchBalance = async () => {
      try {
        const walletPubkey = publicKey;
        const usdcMint = new PublicKey(DEVNET_USDC_MINT);
        const ata = getAssociatedTokenAddressSync(usdcMint, walletPubkey);
        const info = await connection.getTokenAccountBalance(ata);
        setUsdcBalance(info.value.uiAmount);
      } catch (e) {
        // ATA doesn't exist yet
        setUsdcBalance(0);
      }
    };
    fetchBalance();
  }, [connected, publicKey, connection]);

  const handleAction = async () => {
    if (!connected || !publicKey) {
      const installed = wallets.filter(w => w.readyState === 'Installed');
      if (installed.length > 0) {
        select(installed[0].adapter.name);
        connect();
      }
      return;
    }

    if (activeTab === "deposit" && isDepositError) return;
    if (activeTab === "deposit" && numAmount > (usdcBalance || 0)) {
        setErrorMsg("Insufficient USDC balance");
        return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const walletPubkey = publicKey;

      let tx;
      if (activeTab === "deposit") {
        tx = await buildDepositTx(walletPubkey, numAmount, connection);
      } else {
        tx = await buildWithdrawTx(walletPubkey, connection);
      }

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = walletPubkey;

      console.log("Simulating transaction for debugging...");
      const simRes = await connection.simulateTransaction(tx);
      console.log("Simulation Result:", simRes.value);
      if (simRes.value.err) {
        console.error("Simulation Error Logs:", simRes.value.logs);
        throw new Error("Simulation failed. Check console for logs.");
      }

      const signature = await sendTransaction(tx, connection);
      console.log("Transaction Sent:", signature);
      
      setAmount("");
      setIsDepositSuccess(true);
      setTimeout(() => setIsDepositSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      let humanError = err.message || "Transaction failed.";
      if (humanError.includes("User rejected")) humanError = "You cancelled the transaction.";
      if (humanError.includes("Insufficient")) humanError = "Insufficient funds for this transaction.";
      if (humanError.includes("blockhash")) humanError = "Network timeout. Please try again.";
      setErrorMsg(humanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border-low rounded-3xl p-6 shadow-2xl mt-8 relative overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex bg-background rounded-full p-1 mb-8 border border-border-low">
        <button
          onClick={() => { setActiveTab("deposit"); setErrorMsg(null); }}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "deposit" ? "bg-card text-primary shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "withdraw" ? "bg-card text-primary shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-background rounded-2xl p-4 mb-4 border border-border-low focus-within:border-primary/50 transition-colors">
        <div className="flex justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            {activeTab === "deposit" ? "You Pay" : "You Withdraw"}
          </label>
          <span className="text-xs text-muted">
            Balance: {usdcBalance !== null ? `${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC` : "0.00 USDC"}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-4xl font-mono text-foreground focus:outline-none placeholder:text-muted/30"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAmount(activeTab === "deposit" ? "10000" : "5042.1")}
              className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition"
            >
              MAX
            </button>
            <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border-low">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "deposit" ? "bg-blue-500" : "bg-primary"}`}>
                <span className="text-[10px] font-bold text-white">{activeTab === "deposit" ? "$" : "Y"}</span>
              </div>
              <span className="font-semibold text-sm">{activeTab === "deposit" ? "USDC" : "yUSDC"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints & Estimates */}
      <div className="px-2 mb-6">
        {activeTab === "deposit" ? (
          <div className="flex justify-between items-center text-sm">
            <span className={`${isDepositError ? "text-red-400 font-medium" : "text-muted"}`}>
              {isDepositError ? `Minimum deposit is $${MIN_DEPOSIT_USDC}` : `Min deposit: $${MIN_DEPOSIT_USDC}`}
            </span>
            <span className="text-foreground">
              Receive: <span className="font-mono">{amount || "0.00"}</span> yUSDC
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-sm text-muted">
            <span>Instant withdrawal. No lockup.</span>
            <span className="text-foreground">
              Receive: <span className="font-mono">{amount || "0.00"}</span> USDC
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 break-all">
          {errorMsg}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={!connected || (activeTab === "deposit" && isDepositError) || !amount || numAmount <= 0 || loading}
        className="w-full group relative flex items-center justify-center gap-2 bg-primary text-background font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
        
        {loading ? (
            <Loader2 size={20} className="relative z-10 animate-spin" />
        ) : (
            activeTab === "deposit" ? <ArrowDownCircle size={20} className="relative z-10" /> : <ArrowUpCircle size={20} className="relative z-10" />
        )}
        
        <span className="relative z-10 uppercase tracking-widest">
          {!connected 
            ? "Connect Wallet" 
            : loading 
              ? "Confirming..." 
              : activeTab === "deposit" 
                ? "Deposit & Earn" 
                : "Withdraw USDC"}
        </span>
      </button>

      {/* Faucet Link (Testnet only) */}
      <div className="mt-4 text-center">
        <a 
          href="https://faucet.circle.com/" 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Need Devnet USDC? Get it here →
        </a>
      </div>
    </div>
  );
}
