"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getUserYusdcAccountPDA, getUserPositionPDA, getProgram } from "../lib/anchor-client";
import * as anchor from "@coral-xyz/anchor";

export function PortfolioView() {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com", "confirmed");
          const walletPubkey = publicKey;
          const userYusdcAccount = getUserYusdcAccountPDA(walletPubkey);
          
          let currentBalance = 0;
          try {
            const balanceObj = await connection.getTokenAccountBalance(userYusdcAccount);
            currentBalance = balanceObj.value.uiAmount || 0;
          } catch(e) { /* ATA not found */ }
          
          if (mounted) {
             setBalance(currentBalance);
          }

          // Fetch actual UserPosition
          const dummyProvider = new anchor.AnchorProvider(connection, {} as any, { commitment: "confirmed" });
          const program = getProgram(dummyProvider);
          const userPositionPda = getUserPositionPDA(walletPubkey);
          
          try {
            const positionData = await program.account.userPosition.fetch(userPositionPda);
            const activeDepositUi = positionData.activeDeposit.toNumber() / 1_000_000;
            // Earned = current value - active deposit
            // For simplicity in the UI right now we just show a static yield since IBT logic is complex to decode purely on frontend
            if (mounted) setEarned(currentBalance > 0 ? (currentBalance - activeDepositUi) : 0);
          } catch (e) {
            if (mounted) setEarned(0);
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
  }, [connected, publicKey]);

  if (!connected) return null;

  return (
    <div className="w-full bg-card border border-border-low rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      {balance === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Active Position</h3>
          <p className="text-sm text-muted max-w-sm">
            Deposit USDC to mint yUSDC and start earning auto-compounded yield immediately. 
          </p>
        </div>
      ) : (
        <>

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
      </>
      )}
    </div>
  );
}
