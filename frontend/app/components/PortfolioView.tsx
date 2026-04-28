"use client";

import { useWalletConnection } from "@solana/react-hooks";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getUserYusdcAccountPDA } from "../lib/anchor-client";

export function PortfolioView() {
  const { status, wallet } = useWalletConnection();
  const [balance, setBalance] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchBalance = async () => {
      if (status === "connected" && wallet) {
        try {
          const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com", "confirmed");
          const walletPubkey = new PublicKey(wallet.account.address);
          const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);
          
          const balanceObj = await connection.getTokenAccountBalance(userYusdcAccount);
          if (mounted && balanceObj.value.uiAmount !== null) {
            setBalance(balanceObj.value.uiAmount);
            // Simulated earned amount based on dummy tracked data (since UserPosition isn't fully decoded yet)
            setEarned(balanceObj.value.uiAmount * 0.005);
          }
        } catch (e) {
          // ATA likely doesn't exist yet
          if (mounted) {
            setBalance(0);
            setEarned(0);
          }
        }
      } else {
        if (mounted) {
          setBalance(0);
          setEarned(0);
        }
      }
    };

    fetchBalance();
    
    return () => { mounted = false; };
  }, [status, wallet]);

  if (status !== "connected") return null;

  return (
    <div className="w-full bg-card border border-border-low rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-1">Total Balance</p>
          <p className="text-4xl md:text-5xl font-mono text-foreground font-bold">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl text-primary font-sans">yUSDC</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-1">Total Earned</p>
          <p className="text-2xl md:text-3xl font-mono text-success font-bold flex items-center md:justify-end gap-2">
            <TrendingUp size={24} /> +${earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="border-t border-border-low pt-6 mt-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Earnings Projection (at 5.2% APY)</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background rounded-xl p-4 border border-border-low">
            <p className="text-xs text-muted mb-1">1 Month</p>
            <p className="font-mono text-foreground">${(balance * Math.pow(1.052, 1/12)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-background rounded-xl p-4 border border-border-low">
            <p className="text-xs text-muted mb-1">6 Months</p>
            <p className="font-mono text-foreground">${(balance * Math.pow(1.052, 6/12)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-background rounded-xl p-4 border border-border-low">
            <p className="text-xs text-muted mb-1">1 Year</p>
            <p className="font-mono text-success font-semibold">${(balance * 1.052).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
