"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Download, ExternalLink, Check, Circle } from "lucide-react";

type TxType = "Deposit" | "Withdraw" | "Rebalance";
type FilterType = "All" | "Deposits" | "Withdrawals" | "Rebalances";

interface Transaction {
  id: string;
  date: string;
  type: TxType;
  amount: number | null;
  velaAmount: number | null;
  signature: string;
  status: "Confirmed" | "Pending";
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "Nov 12, 14:32", type: "Deposit", amount: 1250.00, velaAmount: 1250.00, signature: "5xGj3mPq...", status: "Confirmed" },
  { id: "2", date: "Nov 10, 09:15", type: "Rebalance", amount: null, velaAmount: null, signature: "BJnLFNEV...", status: "Confirmed" },
  { id: "3", date: "Nov 08, 16:45", type: "Withdraw", amount: -500.00, velaAmount: -500.00, signature: "3DP9M5kT...", status: "Confirmed" },
  { id: "4", date: "Nov 05, 11:20", type: "Deposit", amount: 5450.00, velaAmount: 5450.00, signature: "9aKm7vNx...", status: "Confirmed" },
  { id: "5", date: "Nov 03, 10:00", type: "Rebalance", amount: null, velaAmount: null, signature: "2cRq8wKs...", status: "Confirmed" },
  { id: "6", date: "Oct 28, 18:30", type: "Withdraw", amount: -250.00, velaAmount: -250.00, signature: "7mPx9qRv...", status: "Confirmed" },
  { id: "7", date: "Oct 25, 08:45", type: "Rebalance", amount: null, velaAmount: null, signature: "1kLm3nOp...", status: "Confirmed" },
];

export function HistoryTab() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [filter, setFilter] = useState<FilterType>("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl border border-border-low bg-card flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-semibold font-display text-white mb-3">Transaction History</h3>
        <p className="text-sm md:text-base text-muted font-body mb-8">Connect your wallet to see your on-chain transaction log.</p>
        <button
          onClick={() => setVisible(true)}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-bg1 transition hover:bg-primary/90 active:scale-95 shadow-[0_0_20px_rgba(0,194,255,0.3)] hover:shadow-[0_0_25px_rgba(0,194,255,0.4)]"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const address = publicKey?.toBase58() || "";
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  const displayed = MOCK_TRANSACTIONS.filter(tx => {
    if (filter === "All") return true;
    if (filter === "Deposits") return tx.type === "Deposit";
    if (filter === "Withdrawals") return tx.type === "Withdraw";
    if (filter === "Rebalances") return tx.type === "Rebalance";
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in-up">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Vela Protocol</span>
            <span className="text-[10px] text-muted">•</span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Devnet</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold font-display text-white mb-1">Transaction History</h2>
          <p className="text-sm text-muted font-body">Full on-chain log for {shortAddress}</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-low bg-card text-xs font-semibold text-white transition hover:bg-white/5">
          <Download className="w-3.5 h-3.5 text-primary" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Deposit</span>
          <span className="text-3xl font-mono text-green-400 mt-1">$6,700</span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Withdrawn</span>
          <span className="text-3xl font-mono text-red-400 mt-1">$750</span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Earned</span>
          <span className="text-3xl font-mono text-primary mt-1">$42.10</span>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="mt-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex gap-2 bg-card border border-border-low rounded-full p-1">
            {(["All", "Deposits", "Withdrawals", "Rebalances"] as FilterType[]).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`text-xs font-semibold px-5 py-1.5 rounded-full transition-all ${
                  filter === option
                    ? "bg-primary text-bg1 shadow-[0_0_10px_rgba(0,194,255,0.2)]"
                    : "text-muted hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono text-muted/60 tracking-wider">
            {MOCK_TRANSACTIONS.length} transactions
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-low bg-card/30">
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Date</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Type</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4 text-right">Amount (USDC)</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4 text-right">velaUSD</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4 text-center">Solscan</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-low">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">
                    No {filter.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                displayed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-muted">{tx.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "Deposit" && <Circle className="w-2 h-2 fill-green-400 text-green-400" />}
                        {tx.type === "Withdraw" && <Circle className="w-2 h-2 fill-red-400 text-red-400" />}
                        {tx.type === "Rebalance" && <Circle className="w-2 h-2 fill-secondary text-secondary" />}
                        <span className="text-sm font-medium text-white">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.amount !== null ? (
                        <span className={`font-mono text-sm ${tx.type === "Deposit" ? "text-green-400" : "text-red-400"}`}>
                          {tx.type === "Deposit" ? "$" : "-$"}{Math.abs(tx.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.velaAmount !== null ? (
                        <span className="font-mono text-sm text-white">
                          {tx.type === "Deposit" ? "" : "-"}{Math.abs(tx.velaAmount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <a 
                          href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-border-low bg-card flex items-center justify-center transition hover:border-primary/50 group/link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted group-hover/link:text-primary transition-colors" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === "Confirmed" && (
                        <div className="inline-flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Confirmed</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
