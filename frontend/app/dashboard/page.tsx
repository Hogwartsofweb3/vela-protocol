"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { MetricsBox } from "../components/MetricsBox";
import { PortfolioView } from "../components/PortfolioView";
import { ActionModule } from "../components/ActionModule";
import { AdminTools } from "../components/AdminTools";
import { MarketsTab } from "../components/MarketsTab";
import { HistoryTab } from "../components/HistoryTab";
import { SettingsTab } from "../components/SettingsTab";
import { useEffect, useState } from "react";
import { LayoutDashboard, TrendingUp, Clock, Settings } from "lucide-react";

type Tab = "dashboard" | "markets" | "history" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "markets",   label: "Markets",   icon: <TrendingUp className="w-4 h-4" /> },
  { id: "history",   label: "History",   icon: <Clock className="w-4 h-4" /> },
  { id: "settings",  label: "Settings",  icon: <Settings className="w-4 h-4" /> },
];

export default function Home() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  useEffect(() => { setMounted(true); }, []);

  const address = publicKey?.toBase58();
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg1 text-foreground flex flex-col items-center">

      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-border-low">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 4 L6 20 L24 28 Z" fill="#ffffff" />
              <path d="M24 10 L24 28 L16 16 Z" fill="#06B6D4" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground font-sans">VELA</span>
        </div>

        {/* Desktop Tab Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-card border border-border-low rounded-full px-1.5 py-1.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-primary text-bg1 shadow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Wallet */}
        <div>
          {!mounted ? null : !connected ? (
            <button
              id="connect-wallet-btn"
              onClick={() => setVisible(true)}
              className="rounded-full bg-primary/10 border border-primary/30 px-6 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 active:scale-95"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-border-low bg-card px-4 py-2 font-mono text-sm text-primary shadow-sm">
                {shortAddress}
              </div>
              <button
                onClick={() => disconnect()}
                className="rounded-full bg-card border border-border-low px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground hover:border-primary/30"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Tab Nav */}
      <nav className="md:hidden w-full flex items-center gap-1 px-4 py-3 border-b border-border-low bg-card overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-primary text-bg1"
                : "text-muted bg-bg1 border border-border-low"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground font-sans mb-4">
                Yield, <span className="text-primary">Auto-Compounded</span>
              </h1>
              <p className="max-w-xl mx-auto text-base text-muted">
                One token. Every RWA yield on Solana.
              </p>
            </div>
            <MetricsBox />
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
            {connected && <AdminTools />}
          </div>
        )}

        {/* Markets Tab */}
        {activeTab === "markets" && <MarketsTab />}

        {/* History Tab */}
        {activeTab === "history" && <HistoryTab />}

        {/* Settings Tab */}
        {activeTab === "settings" && <SettingsTab />}

        {/* Footer */}
        <div className="mt-20 pb-8 text-center text-sm text-muted">
          <p>© 2026 Vela Protocol. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
