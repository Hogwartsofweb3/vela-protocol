import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";

/**
 * Standardized interface for all yield protocol adapters (Kamino, Ondo, BackedFi, etc.).
 * This ensures the Router can swap between protocols seamlessly without knowing their specific logic.
 */
export interface ProtocolAdapter {
  /**
   * The unique identifier for the protocol (e.g., "KAMINO", "ONDO")
   */
  protocolName: string;

  /**
   * Fetches the current APY for this protocol in Basis Points (bps).
   * @param connection Solana RPC Connection
   * @returns APY in bps (e.g., 530 for 5.3%)
   */
  getApyBps(connection: Connection): Promise<number>;

  /**
   * Constructs the Solana transaction instructions required to deposit USDC into the protocol.
   * @param amount The amount of USDC to deposit (in base units)
   * @param owner The wallet/PDA that will own the deposit
   * @returns Array of TransactionInstructions to be bundled into the rebalance transaction
   */
  buildDepositTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]>;

  /**
   * Constructs the Solana transaction instructions required to withdraw USDC from the protocol.
   * @param amount The amount of USDC to withdraw (in base units)
   * @param owner The wallet/PDA that owns the deposit
   * @returns Array of TransactionInstructions to be bundled into the rebalance transaction
   */
  buildWithdrawTx(amount: BN, owner: Keypair): Promise<TransactionInstruction[]>;
}
