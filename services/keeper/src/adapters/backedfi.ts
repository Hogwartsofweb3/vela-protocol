import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { ProtocolAdapter } from "./interface";

export class BackedFiAdapter implements ProtocolAdapter {
  protocolName = "BACKED_FI_BIB01";

  async getApyBps(connection: Connection): Promise<number> {
    // BackedFi's bIB01 is an ETF tracker. The APY would be fetched from 
    // the official treasury rates or Backed's Oracle.
    // As a stub for Phase 4, we return 0.
    return 0;
  }

  async buildDepositTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    throw new Error(`[BackedFi Adapter] Deposit Not Implemented. Target: Phase 4 (Post-Hackathon).`);
  }

  async buildWithdrawTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    throw new Error(`[BackedFi Adapter] Withdraw Not Implemented. Target: Phase 4 (Post-Hackathon).`);
  }
}
