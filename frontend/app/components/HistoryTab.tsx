"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, ExternalLink, Filter } from "lucide-react";

type TxType = "deposit" | "withdrawal" | "rebalance";
type FilterType = "all" | TxType;

interface Transaction {
  id: string;
  type: TxType;
  amount?: number;
  signature: string;
  timestamp: Date;
  status: "confirmed" | "pending";
  routedTo?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", type: "deposit", amount: 1000, signature: "5xGj3mPq...", timestamp: new Date(Date.now() - 1000 * 60 * 5), status: "confirmed", routedTo: "Ondo USDY" },
  { id: "2", type: "rebalance", signature: "BJnLFNEVkrsnjF2DXPAtejFMKGz4p6qi7wgXk2ZA5Bx", timestamp: new Date(Date.now() - 1000 * 60 * 12), status: "confirmed", routedTo: "Ondo USDY → Hastra PRIME" },
  { id: "3", type: "deposit", amount: 500, signature: "9aKm7vNx...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: "confirmed", routedTo: "Ondo USDY" },
  { id: "4", type: "withdrawal", amount: 250, signature: "3DP9M5kTu73dUjuVYQqRvU1mga8BB4eH1jCvzaD", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: "confirmed" },
  { id: "5", type: "rebalance", signature: "2cRq8wKs...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: "confirmed", routedTo: "Kamino → Ondo USDY" },
];

const typeConfig = {
  deposit:    { icon: <ArrowDownToLine className="w-4 h-4" />, label: "Deposit",    colour: "text-green-400 bg-green-400/10 border-green-400/20" },
  withdrawal: { icon: <ArrowUpFromLine className="w-4 h-4" />, label: "Withdrawal", colour: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  rebalance:  { icon: <RefreshCw className="w-4 h-4" />,       label: "Rebalance",  colour: "text-primary bg-primary/10 border-primary/20" },
};

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function HistoryTab() {
  const { connected } = useWallet();
  const [filter, setFilter] = useState<FilterType>("all");

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-card border border-border-low flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Connect your wallet</h3>
        <p className="text-sm text-muted max-w-xs">Connect a wallet to view your deposit, withdrawal, and rebalance history.</p>
      </div>
    );
  }

  const displayed = MOCK_TRANSACTIONS.filter(tx => filter === "all" || tx.type === filter);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Transaction History</h2>
          <p className="text-sm text-muted mt-1">All deposits, withdrawals, and keeper-triggered rebalances for your wallet.</p>
        </div>
        <button className="flex items-center gap-2 text-xs text-muted bg-card border border-border-low rounded-lg px-3 py-2 hover:text-foreground transition">
          <Filter className="w-3 h-3" /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "deposit", "withdrawal", "rebalance"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${filter === f ? "bg-primary text-bg1 border-primary" : "bg-card border-border-low text-muted hover:text-foreground"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">No transactions found.</div>
        ) : displayed.map(tx => {
          const cfg = typeConfig[tx.type];
          return (
            <div key={tx.id} className="flex items-center justify-between gap-4 bg-card border border-border-low rounded-2xl px-5 py-4 hover:border-primary/20 transition">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${cfg.colour}`}>{cfg.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">{cfg.label}</span>
                    {tx.amount && <span className="text-sm font-semibold text-foreground">${tx.amount.toLocaleString()} USDC</span>}
                  </div>
                  {tx.routedTo && <div className="text-xs text-muted mt-0.5">Route: <span className="text-primary">{tx.routedTo}</span></div>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-xs text-muted">{timeAgo(tx.timestamp)}</div>
                  <div className={`text-xs mt-0.5 ${tx.status === "confirmed" ? "text-green-400" : "text-yellow-400"}`}>{tx.status}</div>
                </div>
                <a href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-6 text-center">Showing Devnet transactions. Mainnet history available at launch.</p>
    </div>
  );
}
