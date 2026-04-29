"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MetricsBox } from "./components/MetricsBox";
import { PortfolioView } from "./components/PortfolioView";
import { ActionModule } from "./components/ActionModule";
import { useEffect, useState } from "react";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);



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
          {!mounted ? null : (
            <WalletMultiButton
              style={{
                background: connected ? 'rgba(0,180,216,0.1)' : 'rgba(0,180,216,0.12)',
                border: '1px solid rgba(0,180,216,0.3)',
                borderRadius: '9999px',
                color: '#00B4D8',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 24px',
                height: 'auto',
                lineHeight: '1.5',
              }}
            />
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
