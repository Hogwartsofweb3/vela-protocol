"use client";
import { useWalletConnection } from "@solana/react-hooks";

export default function Home() {
  const { connectors, connect, disconnect, wallet, status } =
    useWalletConnection();

  const address = wallet?.account.address.toString();

  // Helper to format address
  const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg1 text-foreground flex flex-col items-center justify-center">
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-6 py-16 text-center">
        {/* Vela Logo & Branding */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-card shadow-2xl">
            {/* Minimalist Abstract Sailboat Shape (CSS implementation for placeholder) */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M48 20L48 80L80 80Z" fill="#ffffff" />
              <path d="M45 35L45 80L25 80Z" fill="#00E5FF" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground font-sans">
              VELA
            </h1>
            <p className="text-sm uppercase tracking-[0.25em] text-muted font-sans">
              Protocol
            </p>
          </div>

          <p className="max-w-md text-base leading-relaxed text-muted">
            One token. Every RWA yield on Solana, auto-compounded.
          </p>
        </div>

        {/* Wallet Connection Card */}
        <section className="w-full space-y-4 rounded-2xl border border-border-low bg-card p-6 shadow-2xl mt-4">
          <div className="flex items-center justify-between pb-4 border-b border-border-low">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Access Vault
            </p>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>

          {status !== "connected" ? (
            <div className="grid gap-3 pt-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect(connector.id)}
                  disabled={status === "connecting"}
                  className="group flex items-center justify-between rounded-xl border border-border-low bg-background px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{connector.name}</span>
                  <span className="text-xs text-muted group-hover:text-primary transition">
                    {status === "connecting" ? "Connecting…" : "Connect →"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="rounded-lg border border-border-low bg-background px-4 py-3 font-mono text-lg text-primary shadow-inner">
                {address ? formatAddress(address) : ""}
              </div>
              
              <button
                onClick={() => disconnect()}
                className="w-full rounded-xl bg-cream py-3 text-sm font-medium text-foreground transition hover:bg-cream/80"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
