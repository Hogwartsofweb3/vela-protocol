"use client";

import { SolanaProvider } from "@solana/react-hooks";
import { PropsWithChildren } from "react";

import { autoDiscover, createClient } from "@solana/client";

import { MAINNET_RPC } from "../lib/constants";
const rpcUrl = MAINNET_RPC;

const client = createClient({
  endpoint: rpcUrl,
  walletConnectors: autoDiscover(),
});

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export function Providers({ children }: PropsWithChildren) {
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <SolanaProvider client={client}>{children}</SolanaProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
