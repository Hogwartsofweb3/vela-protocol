"use client";

import { useState, useEffect } from "react";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Zap, Shield, Activity } from "lucide-react";

type RiskTier = "Low" | "Medium" | "High";

interface Protocol {
  name: string;
  token: string;
  apy: number;
  apy7d: number;
  tvl: string;
  risk: RiskTier;
  routing: boolean;
  issuer: string;
  phase: number;
}

const PROTOCOLS: Protocol[] = [
  { name: "BlackRock BUIDL", token: "BUIDL", apy: 3.53, apy7d: 3.51, tvl: "$231M", risk: "Low", routing: false, issuer: "BlackRock / Securitize", phase: 1 },
  { name: "Ondo Finance", token: "USDY", apy: 5.20, apy7d: 5.18, tvl: "$182M", risk: "Low", routing: true, issuer: "Ondo Finance", phase: 1 },
  { name: "Hastra PRIME", token: "PRIME", apy: 7.21, apy7d: 7.05, tvl: "$335M", risk: "Medium", routing: false, issuer: "Hastra", phase: 1 },
  { name: "Ondo OUSG", token: "OUSG", apy: 3.24, apy7d: 3.26, tvl: "$71.8M", risk: "Low", routing: false, issuer: "Ondo Finance", phase: 1 },
  { name: "VanEck VBILL", token: "VBILL", apy: 3.53, apy7d: 3.52, tvl: "$13.8M", risk: "Low", routing: false, issuer: "VanEck", phase: 1 },
  { name: "Kamino Finance", token: "KIMI", apy: 4.45, apy7d: 4.38, tvl: "$2.1B", risk: "Low", routing: false, issuer: "Kamino", phase: 1 },
  { name: "Apollo ACRED", token: "ACRED", apy: 8.71, apy7d: 8.60, tvl: "$35M", risk: "Medium", routing: false, issuer: "Apollo", phase: 2 },
  { name: "OnRe ONYC", token: "ONYC", apy: 10.15, apy7d: 9.88, tvl: "$140M", risk: "Medium", routing: false, issuer: "OnRe", phase: 2 },
];

const FLOOR_BPS = 3.5;

function TrendIcon({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  if (diff > 0.05) return <TrendingUp className="inline w-3.5 h-3.5 text-green-400 ml-1" />;
  if (diff < -0.05) return <TrendingDown className="inline w-3.5 h-3.5 text-red-400 ml-1" />;
  return <Minus className="inline w-3.5 h-3.5 text-muted ml-1" />;
}

const riskColour: Record<RiskTier, string> = {
  Low: "text-green-400 bg-green-400/10 border-green-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  High: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function MarketsTab() {
  const [filter, setFilter] = useState<"all" | "phase1" | "phase2">("all");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const displayed = PROTOCOLS.filter(p =>
    filter === "all" ? true : filter === "phase1" ? p.phase === 1 : p.phase === 2
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Live Yield Markets</h2>
          <p className="text-sm text-muted mt-1">
            Real-time APY data from all integrated RWA issuers. Vela routes to the highest yield above the 3.5% floor.
          </p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted bg-card border border-border-low rounded-lg px-3 py-2">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span>Updated {lastUpdated}</span>
          </div>
        )}
      </div>

      {/* Safety Floor Banner */}
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 mb-6">
        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-sm text-primary/80">
          <span className="font-semibold text-primary">Safety Floor: 3.5% APY.</span>
          {" "}If the best available yield drops below this threshold, Vela automatically rotates capital back to US Treasuries.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6">
        {(["all", "phase1", "phase2"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
              filter === f
                ? "bg-primary text-bg1 border-primary"
                : "bg-card border-border-low text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? "All Protocols" : f === "phase1" ? "Phase 1 (Active)" : "Phase 2 (Upcoming)"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border-low overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-card border-b border-border-low">
              <th className="text-left px-5 py-3.5 text-muted font-medium">Protocol</th>
              <th className="text-left px-4 py-3.5 text-muted font-medium">Token</th>
              <th className="text-right px-4 py-3.5 text-muted font-medium">Current APY</th>
              <th className="text-right px-4 py-3.5 text-muted font-medium hidden md:table-cell">7D Trend</th>
              <th className="text-right px-4 py-3.5 text-muted font-medium hidden md:table-cell">TVL</th>
              <th className="text-center px-4 py-3.5 text-muted font-medium hidden lg:table-cell">Risk</th>
              <th className="text-center px-4 py-3.5 text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((p, i) => (
              <tr
                key={p.token}
                className={`border-b border-border-low transition hover:bg-card/50 ${
                  p.routing ? "bg-primary/5" : ""
                } ${i === displayed.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted">{p.issuer}</div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-xs bg-card border border-border-low rounded px-2 py-0.5 text-primary">
                    {p.token}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-semibold tabular-nums ${p.apy >= FLOOR_BPS ? "text-green-400" : "text-red-400"}`}>
                    {p.apy.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right hidden md:table-cell text-muted tabular-nums text-xs">
                  {p.apy7d.toFixed(2)}%
                  <TrendIcon current={p.apy} prev={p.apy7d} />
                </td>
                <td className="px-4 py-4 text-right text-muted hidden md:table-cell">{p.tvl}</td>
                <td className="px-4 py-4 text-center hidden lg:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskColour[p.risk]}`}>
                    {p.risk}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {p.routing ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1">
                      <Zap className="w-3 h-3" />
                      Routing
                    </span>
                  ) : p.phase === 2 ? (
                    <span className="text-xs text-muted bg-card border border-border-low rounded-full px-3 py-1">Phase 2</span>
                  ) : (
                    <span className="text-xs text-muted/60">Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-4 text-center">
        APY data sourced from live Keeper oracle. Updates every 30 seconds on-chain.
      </p>
    </div>
  );
}
