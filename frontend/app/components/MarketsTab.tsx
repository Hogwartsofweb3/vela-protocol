"use client";

import { useState, useEffect } from "react";
import { Circle } from "lucide-react";

type SortOption = "APY" | "TVL" | "NAME";
type StatusType = "Allocated" | "Monitoring" | "Currently Routing";

interface MarketData {
  id: string;
  issuer: string;
  subtitle: string;
  token: string;
  apy: number;
  trend: number;
  tvl: number; // in millions
  risk: string;
  status: StatusType;
}

const MARKETS: MarketData[] = [
  { id: "BR", issuer: "BlackRock", subtitle: "Solana • Money Market", token: "BUIDL", apy: 5.10, trend: -0.04, tvl: 350.0, risk: "Low", status: "Allocated" },
  { id: "CS", issuer: "Credix", subtitle: "Solana • Private Credit", token: "CREDIX", apy: 4.20, trend: 0.07, tvl: 37.5, risk: "Medium", status: "Monitoring" },
  { id: "FR", issuer: "Franklin Templeton", subtitle: "Solana • Money Market", token: "FOBXX", apy: 4.90, trend: 0.05, tvl: 187.5, risk: "Low", status: "Allocated" },
  { id: "MP", issuer: "Maple Finance", subtitle: "Solana • Corporate Debt", token: "MPL", apy: 3.50, trend: -0.15, tvl: 50.0, risk: "Medium", status: "Monitoring" },
  { id: "OD", issuer: "Ondo Finance", subtitle: "Solana • US Treasuries", token: "USDY", apy: 6.10, trend: 0.12, tvl: 425.0, risk: "Low", status: "Currently Routing" },
  { id: "OE", issuer: "OpenEden", subtitle: "Solana • T-Bills", token: "TBILL", apy: 5.20, trend: 0.09, tvl: 62.5, risk: "Low", status: "Monitoring" },
  { id: "WT", issuer: "WisdomTree", subtitle: "Solana • US Treasuries", token: "WTSY", apy: 5.00, trend: 0.08, tvl: 125.0, risk: "Low", status: "Monitoring" },
];

function Sparkline({ isPositive }: { isPositive: boolean }) {
  // A simplified aesthetic sparkline
  const strokeColor = isPositive ? "#4ade80" : "#f87171";
  const pathData = isPositive 
    ? "M 0 15 Q 5 10, 15 12 T 30 5" 
    : "M 0 5 Q 5 10, 15 12 T 30 15";
    
  return (
    <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={pathData} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MarketsTab() {
  const [sortBy, setSortBy] = useState<SortOption>("APY");
  const [time, setTime] = useState<string>("14:22:07");

  useEffect(() => {
    // Just a visual clock update
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedMarkets = [...MARKETS].sort((a, b) => {
    if (sortBy === "APY") return b.apy - a.apy;
    if (sortBy === "TVL") return b.tvl - a.tvl;
    return a.issuer.localeCompare(b.issuer);
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
          <h2 className="text-3xl md:text-4xl font-semibold font-display text-white mb-1">RWA Market Intelligence</h2>
          <p className="text-sm text-muted font-body">Live yield feed across all 7 integrated RWA issuers on Solana</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,194,255,0.8)] animate-pulse"></div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live</span>
          </div>
          <p className="text-[11px] font-mono text-muted tracking-wider">
            Last updated {time} · YieldOracle PDA
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Avg Market APY</span>
          <span className="text-3xl font-mono text-primary mt-1">5.24%</span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Floor APY</span>
          <span className="text-3xl font-mono text-white mt-1">3.5%</span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Best Available</span>
          <span className="text-3xl font-mono text-green-400 mt-1">6.1%</span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Market TVL</span>
          <span className="text-3xl font-mono text-white mt-1">$1.25B</span>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="mt-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted/60 uppercase tracking-wider">Sort by :</span>
            <div className="flex gap-2">
              {(["APY", "TVL", "NAME"] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all ${
                    sortBy === option
                      ? "border border-primary/50 text-primary bg-primary/5"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs font-mono text-muted/60 tracking-wider">
            7 transactions
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border-low">
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Issuer</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Token</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Current APY</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">7D Trend</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">TVL on Solana</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4">Risk</th>
                <th className="text-[10px] font-bold text-muted uppercase tracking-widest px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-low">
              {sortedMarkets.map((market) => (
                <tr key={market.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded border border-border-low bg-bg1 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-primary">{market.id}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white mb-0.5">{market.issuer}</div>
                        <div className="text-xs text-muted/60">{market.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-white">{market.token}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex px-3 py-1 rounded-full border border-border-low bg-bg1 font-mono text-sm
                      ${market.apy >= 5.0 ? "text-green-400 border-green-400/30" : "text-secondary border-secondary/30"}
                    `}>
                      {market.apy.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Sparkline isPositive={market.trend >= 0} />
                      <span className={`font-mono text-sm ${market.trend >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {market.trend > 0 ? "+" : ""}{market.trend.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-white">${market.tvl.toFixed(1)}M</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted">{market.risk}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {market.status === "Currently Routing" ? (
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-primary/50 bg-primary/10">
                        <Circle className="w-2 h-2 fill-primary text-primary" />
                        <span className="text-xs font-semibold text-primary">{market.status}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border-low bg-bg1">
                        <span className="text-xs font-medium text-muted/80">{market.status}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center justify-between w-full md:w-auto">
          <span className="text-xs text-muted/80">Data sourced from YieldOracle PDA — updates every block</span>
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Live</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <span className="text-xs font-bold text-muted uppercase tracking-widest hidden md:block">APY Colour Legend:</span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              <span className="text-xs text-muted">≥ 5.0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <span className="text-xs text-muted">3.5–5.0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <span className="text-xs text-muted">Below floor</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
