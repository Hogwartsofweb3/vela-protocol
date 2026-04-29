"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { MetricsBox } from "./components/MetricsBox";
import { PortfolioView } from "./components/PortfolioView";
import { ActionModule } from "./components/ActionModule";
import { useEffect, useState } from "react";

export default function Home() {
  const { wallets, select, connect, disconnect, publicKey, connected, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const address = publicKey?.toBase58();
  const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg1 text-foreground flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border border-border-low">
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M48 20L48 80L80 80Z" fill="#ffffff" />
              <path d="M45 35L45 80L25 80Z" fill="#00B4D8" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground font-sans">
            VELA
          </span>
        </div>

        <div>
          {!mounted ? null : !connected ? (
            <div className="flex gap-2">
              {wallets.filter(w => w.readyState === 'Installed').slice(0, 3).map((w) => (
                <button
                  key={w.adapter.name}
                  onClick={async () => {
                    select(w.adapter.name);
                    try { await connect(); } catch(e){}
                  }}
                  disabled={connecting}
                  className="rounded-full bg-primary/10 border border-primary/20 px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  {connecting ? "Connecting…" : `Connect ${w.adapter.name}`}
                </button>
              ))}
              {wallets.filter(w => w.readyState === 'Installed').length === 0 && (
                <a href="https://phantom.app" target="_blank" rel="noreferrer"
                  className="rounded-full bg-primary/10 border border-primary/20 px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20">
                  Install Phantom
                </a>
              )}
            </div>
          ) : (
             <div className="flex items-center gap-4">
              <div className="rounded-full border border-border-low bg-card px-4 py-2 font-mono text-sm text-primary shadow-sm">
                {address ? formatAddress(address) : ""}
              </div>
              <button
                onClick={() => disconnect()}
                className="rounded-full bg-cream border border-border-low px-4 py-2 text-sm font-medium text-foreground transition hover:bg-cream/80"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground font-sans mb-4">
            Yield, <span className="text-primary">Auto-Compounded</span>
          </h1>
          <p className="max-w-xl mx-auto text-base text-muted">
            One token. Every RWA yield on Solana.
          </p>
        </div>

        {/* Global Metrics */}
        <MetricsBox />

        {/* Action & Portfolio Area */}
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-12 items-start justify-center">
          <div className="w-full lg:w-1/2 flex justify-center">
             <ActionModule />
          </div>
          {connected && (
            <div className="w-full lg:w-1/2 flex justify-center">
              <PortfolioView />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
