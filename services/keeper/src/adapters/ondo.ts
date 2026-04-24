import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { ProtocolAdapter } from "./interface";
import { fetchOndoApyBps } from "../fetchers/ondo";

export class OndoAdapter implements ProtocolAdapter {
  protocolName = "ONDO_USDY";

  async getApyBps(connection: Connection): Promise<number> {
    // Utilize the fetcher we built in Session 8
    return await fetchOndoApyBps();
  }

  async buildDepositTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    console.log(`[Ondo Adapter] Building deposit transaction for ${amount.toString()} USDC...`);
    // In a full production implementation, this would interact with the Ondo Smart Contracts
    // (e.g., swapping USDC for USDY via their gateway).
    // For the MVP, we mock the instruction builder.
    return [];
  }

  async buildWithdrawTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    console.log(`[Ondo Adapter] Building withdraw transaction for ${amount.toString()} USDY...`);
    // In production: Swap USDY back to USDC.
    return [];
  }
}
