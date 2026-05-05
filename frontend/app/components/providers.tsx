"use client";

import { SolanaProvider } from "@solana/react-hooks";
import { PropsWithChildren } from "react";

import { autoDiscover, createClient } from "@solana/client";

import { DEVNET_RPC } from "../lib/constants";
const rpcUrl = DEVNET_RPC;

const client = createClient({
  endpoint: rpcUrl,
  walletConnectors: autoDiscover(),
});

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapter } from "@solana-mobile/wallet-adapter-mobile";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo } from "react";

export function Providers({ children }: PropsWithChildren) {
  const wallets = useMemo(() => {
    const list = [
      new SolanaMobileWalletAdapter({
        appIdentity: { name: "Vela Protocol", uri: "https://vela-protocol.vercel.app", icon: "favicon.ico" },
      } as any),
      new WalletConnectWalletAdapter({
        network: "devnet" as any,
        options: { projectId: "e899c0d03fd9ea2bf4fb2639a032d8ed" },
      }),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
    ];

    // Force non-detected wallets to immediately redirect to their download URL
    // instead of showing the "Install Wallet" nested modal view.
    list.forEach((w: any) => {
      if (w.readyState === "NotDetected") {
        Object.defineProperty(w, "readyState", { value: "Loadable", writable: true });
        w.connect = async () => {
          window.open(w.url, "_blank");
          throw new Error("Redirecting to wallet download page...");
        };
      }
    });

    return list;
  }, []);

  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaProvider client={client}>{children}</SolanaProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
