"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsTab() {
  const { publicKey, connected, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "SOL">("USD");
  const [slippage, setSlippage] = useState<"0.1%" | "0.5%" | "1.0%">("0.5%");
  const [notifications, setNotifications] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // The settings tab shouldn't be accessed without a wallet normally, 
  // but if navigated to directly, show an empty state.
  if (!connected) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-32 animate-fade-in-up">
        <h3 className="text-2xl font-semibold font-display text-white mb-2">Settings</h3>
        <p className="text-sm text-muted font-body mb-8">Please connect your wallet to view and manage settings.</p>
        <button
          onClick={() => {
            const connectBtn = document.getElementById("connect-wallet-btn");
            if (connectBtn) connectBtn.click();
          }}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-bg1 transition hover:bg-primary/90"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const address = publicKey?.toBase58() ?? "";

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in-up pb-10">
      <div className="mb-2">
        <h2 className="text-3xl md:text-4xl font-semibold font-display text-white mb-1">Settings</h2>
        <p className="text-sm text-muted font-body">Manage your wallet connection and protocol preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Wallet Section */}
        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Wallet</h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Connected Address</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="font-mono text-base text-white">{address}</span>
                <button 
                  onClick={copyAddress}
                  className="p-1.5 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={disconnect}
              className="px-6 py-2.5 rounded-full border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </section>

        {/* Network Section */}
        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Network</h3>
          
          <div className="flex flex-col gap-4">
            <span className="text-sm text-muted">Select Environment</span>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-primary/50 bg-primary/10 text-primary font-semibold text-sm transition-all flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,194,255,0.8)]"></div>
                Devnet
              </button>
              <button className="flex-1 py-3 rounded-xl border border-border-low bg-bg1 text-muted font-medium text-sm cursor-not-allowed opacity-50 relative group">
                Mainnet
                <div className="absolute -top-2 -right-2 bg-card border border-border-low text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  Coming Soon
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Display Section */}
        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Display & Trading</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-sm text-muted">Preferred Currency</span>
              <div className="flex bg-bg1 border border-border-low rounded-xl p-1">
                {(["USD", "SOL"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setCurrency(opt)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      currency === opt 
                        ? "bg-card text-white shadow-sm border border-border-low" 
                        : "text-muted hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Slippage Tolerance</span>
                <Info className="w-4 h-4 text-muted/50" />
              </div>
              <div className="flex bg-bg1 border border-border-low rounded-xl p-1">
                {(["0.1%", "0.5%", "1.0%"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSlippage(opt)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      slippage === opt 
                        ? "bg-card text-white shadow-sm border border-border-low" 
                        : "text-muted hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Notifications</h3>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted">Webhook URL (Optional)</span>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="https://..." 
                  className="flex-1 bg-bg1 border border-border-low rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-xl font-semibold text-sm hover:bg-primary/20 transition-colors">
                  Save
                </button>
              </div>
              <p className="text-xs text-muted/60 mt-1">Receive alerts for completed rebalances and yield payouts.</p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Protocol Updates</span>
                <span className="text-xs text-muted mt-0.5">Critical security and governance alerts</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-border-low'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest mb-1">Vela Protocol v0.1.0-beta</span>
        <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Colosseum 2026</span>
      </div>
    </div>
  );
}
