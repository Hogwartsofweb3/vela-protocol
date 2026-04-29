"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { DEVNET_RPC } from "../lib/constants";
import { getAggregatorStatePDA, getYieldOraclePDA, getProgram } from "../lib/anchor-client";
import * as anchor from "@coral-xyz/anchor";
import { ShieldCheck, Zap } from "lucide-react";

export function MetricsBox() {
  const [tvl, setTvl] = useState<number>(1250000);
  const [apy, setApy] = useState<number>(5.2);
  const [strategy, setStrategy] = useState<number>(1); // 0 = safe, 1 = yield

  useEffect(() => {
    // In a full implementation we would fetch the AggregatorConfig PDA
    // and decode it. For the UI skeleton, we will mock these temporarily
    // until we wire up the full Anchor Program data fetch.
    const fetchMetrics = async () => {
      try {
        const connection = new Connection(DEVNET_RPC, "confirmed");
        const dummyProvider = new anchor.AnchorProvider(connection, {} as any, { commitment: "confirmed" });
        const program = getProgram(dummyProvider);
        const oraclePda = getYieldOraclePDA();

        const oracleData = await program.account.yieldOracle.fetch(oraclePda);

        const ondoApy = oracleData.ondoApyBps / 100;
        const kaminoApy = oracleData.kaminoApyBps / 100;

        setApy(Math.max(ondoApy, kaminoApy));
        setStrategy(ondoApy > kaminoApy ? 1 : 0);
      } catch (err: any) {
        // Oracle PDA doesn't exist yet (program not initialized on devnet).
        // Silently keep the default mock values — no red errors in console.
        if (!err?.message?.includes("Account does not exist")) {
          console.error("Error fetching oracle metrics:", err);
        }
      }
    };

    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(fetchMetrics, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <div className="bg-card border border-border-low rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-2">Protocol TVL</p>
        <p className="text-4xl font-mono text-foreground font-bold">
          ${tvl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>

      <div className="bg-card border border-border-low rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-2">Current APY</p>
        <p className="text-4xl font-mono text-success font-bold">
          {apy.toFixed(1)}%
        </p>
      </div>

      <div className="bg-card border border-border-low rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted mb-2">Strategy Indicator</p>
        {strategy === 1 ? (
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Zap size={16} /> High Yield Mode
            </span>
            <span className="text-xs text-muted">Capital deployed to Ondo USDY</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
              <ShieldCheck size={16} /> Kamino K-Lend
            </span>
            <span className="text-xs text-muted">Capital deployed to Solana DeFi</span>
          </div>
        )}
      </div>
    </div>
  );
}
