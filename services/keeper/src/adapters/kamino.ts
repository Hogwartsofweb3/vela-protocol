import { Connection, Keypair, TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { ProtocolAdapter } from "./interface";
import { fetchKaminoApyBps } from "../fetchers/kamino";
import { KaminoMarket, PROGRAM_ID, KaminoAction } from "@kamino-finance/klend-sdk";

const KAMINO_MAIN_MARKET = new PublicKey("7u3HeHxYDLhnCoErrtycNFNbF3323D42fF3iH2913o36");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export class KaminoAdapter implements ProtocolAdapter {
  protocolName = "KAMINO_KLEND";

  async getApyBps(connection: Connection): Promise<number> {
    // Utilize the fetcher we built in Session 8
    return await fetchKaminoApyBps(connection);
  }

  async buildDepositTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    console.log(`[Kamino Adapter] Building deposit transaction for ${amount.toString()} USDC...`);
    // Note: In production, the "owner" is usually the Vault PDA, not the Keeper wallet.
    // The keeper constructs the transaction and the Anchor program signs it via CPI.
    // Here we outline the instruction construction.
    try {
      /*
      // Real implementation snippet:
      const action = await KaminoAction.buildDepositReserveTx(
        market,
        amount.toString(),
        USDC_MINT,
        owner.publicKey,
        [],
        undefined,
        1_000_000 // Compute budget
      );
      return action.setupIxs.concat(action.lendingIxs).concat(action.cleanupIxs);
      */
      return [];
    } catch (e) {
      console.error("Failed to build Kamino deposit Tx", e);
      return [];
    }
  }

  async buildWithdrawTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]> {
    console.log(`[Kamino Adapter] Building withdraw transaction for ${amount.toString()} USDC...`);
    // Similar to deposit, we would use KaminoAction.buildWithdrawReserveTx
    return [];
  }
}
