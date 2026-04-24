import { Connection, Keypair } from "@solana/web3.js";
import BN from "bn.js";
import { ProtocolAdapter } from "./adapters/interface";
import { OndoAdapter } from "./adapters/ondo";
import { KaminoAdapter } from "./adapters/kamino";

// A constant threshold to prevent constant flipping. 
// If the difference is less than 20 bps (0.2%), do not rebalance.
const REBALANCE_THRESHOLD_BPS = 20;

export class ProtocolRouter {
  private adapters: Map<string, ProtocolAdapter>;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.adapters = new Map();
    
    // Register available adapters
    this.adapters.set("ONDO", new OndoAdapter());
    this.adapters.set("KAMINO", new KaminoAdapter());
  }

  /**
   * Determines the best protocol based on current APYs and triggers a rebalance if necessary.
   * @param currentProtocol The string name of the currently active protocol
   * @param currentAmount The amount of USDC currently deployed
   * @param owner The keeper wallet or PDA
   */
  async routeRebalance(currentProtocol: string, currentAmount: BN, owner: Keypair) {
    console.log("\n[Router] Evaluating Strategy Rebalance...");
    
    const ondoApy = await this.adapters.get("ONDO")!.getApyBps(this.connection);
    const kaminoApy = await this.adapters.get("KAMINO")!.getApyBps(this.connection);

    let bestProtocol = "";
    let bestApy = 0;

    // Simple selection logic
    if (ondoApy > kaminoApy) {
      bestProtocol = "ONDO";
      bestApy = ondoApy;
    } else {
      bestProtocol = "KAMINO";
      bestApy = kaminoApy;
    }

    // Check if the current protocol is already the best
    if (bestProtocol === currentProtocol) {
      console.log(`[Router] No rebalance needed. ${currentProtocol} is still the best (${bestApy} bps).`);
      return;
    }

    // Check threshold
    const currentApy = currentProtocol === "ONDO" ? ondoApy : kaminoApy;
    if (bestApy - currentApy < REBALANCE_THRESHOLD_BPS) {
      console.log(`[Router] APY difference too small to justify gas costs. Skipping rebalance.`);
      return;
    }

    console.log(`[Router] Rebalance Triggered! Moving from ${currentProtocol} to ${bestProtocol}.`);
    
    const currentAdapter = this.adapters.get(currentProtocol);
    const newAdapter = this.adapters.get(bestProtocol);

    if (currentAdapter && newAdapter) {
      // Step 1: Withdraw from current
      await currentAdapter.buildWithdrawTx(currentAmount, owner);
      
      // Step 2: Deposit to new
      await newAdapter.buildDepositTx(currentAmount, owner);

      console.log(`[Router] Successfully generated routing instructions for Anchor CPI.`);
    }
  }
}
