"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Shield, Globe, Wallet, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

export function SettingsTab() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const address = publicKey?.toBase58() ?? "";

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted mt-1">Manage your wallet connection and protocol preferences.</p>
      </div>

      {/* Wallet Section */}
      <section className="bg-card border border-border-low rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Wallet</h3>
        </div>

        {connected && publicKey ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Connected Address</label>
              <div className="flex items-center gap-2 bg-bg1 border border-border-low rounded-xl px-4 py-3">
                <span className="font-mono text-sm text-foreground flex-1 break-all">{address}</span>
                <button
                  onClick={copyAddress}
                  className="text-muted hover:text-primary transition flex-shrink-0"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://solscan.io/account/${address}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition flex-shrink-0"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="w-full rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 py-2.5 text-sm font-medium hover:bg-red-500/10 transition"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-4">No wallet connected.</p>
            <button
              onClick={() => setVisible(true)}
              className="rounded-full bg-primary/10 border border-primary/30 px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* Network Section */}
      <section className="bg-card border border-border-low rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Network</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Solana Devnet</p>
            <p className="text-xs text-muted mt-0.5">Mainnet will be enabled at launch.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        </div>
        <div className="mt-4 bg-bg1 border border-border-low rounded-xl px-4 py-3">
          <p className="text-xs text-muted">RPC Endpoint</p>
          <p className="text-xs font-mono text-foreground mt-0.5 truncate">
            https://devnet.helius-rpc.com
          </p>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-card border border-border-low rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Protocol Security</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "Non-Custodial Vaults", value: "Enabled", positive: true },
            { label: "Oracle Staleness Guard", value: "60 seconds", positive: true },
            { label: "APY Insanity Cap", value: "50% max", positive: true },
            { label: "Safety Floor", value: "3.5% APY", positive: true },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-border-low last:border-b-0">
              <span className="text-sm text-muted">{item.label}</span>
              <span className={`text-sm font-medium ${item.positive ? "text-green-400" : "text-red-400"}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
