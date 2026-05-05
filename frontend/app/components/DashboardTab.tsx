"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { DEVNET_USDC_MINT } from "../lib/constants";
import { getUserYusdcAccountPDA } from "../lib/anchor-client";
import { buildDepositTx, buildWithdrawTx } from "../lib/transaction-builder";
import * as anchor from "@coral-xyz/anchor";

export default function DashboardTab() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const [activeActionTab, setActiveActionTab] = useState<"Deposit" | "Withdraw">("Deposit");
  const [amount, setAmount] = useState<string>("");
  const [isStrategyExpanded, setIsStrategyExpanded] = useState<boolean>(true);

  // Live state
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [yusdcBalance, setYusdcBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!connected || !publicKey) return;

    try {
      // Fetch USDC
      const usdcMint = new PublicKey(DEVNET_USDC_MINT);
      const usdcAta = anchor.utils.token.associatedAddress({
        mint: usdcMint,
        owner: publicKey,
      });
      const usdcAcc = await connection.getTokenAccountBalance(usdcAta);
      setUsdcBalance(usdcAcc.value.uiAmount || 0);
    } catch (e) {
      setUsdcBalance(0);
    }

    try {
      // Fetch yUSDC (Token-2022)
      const yusdcAta = getUserYusdcAccountPDA(publicKey);
      const yusdcAcc = await connection.getTokenAccountBalance(yusdcAta);
      setYusdcBalance(yusdcAcc.value.uiAmount || 0);
    } catch (e) {
      setYusdcBalance(0);
    }
  }, [connected, publicKey, connection]);

  useEffect(() => {
    fetchBalances();
    // Poll every 10 seconds
    const id = setInterval(fetchBalances, 10000);
    return () => clearInterval(id);
  }, [fetchBalances]);

  const handleTransaction = async () => {
    if (!connected || !publicKey) {
        setVisible(true);
        return;
    }
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    setIsProcessing(true);
    try {
      const tx = activeActionTab === "Deposit" 
        ? await buildDepositTx(publicKey, amountNum, connection)
        : await buildWithdrawTx(publicKey, amountNum, connection);
      
      const sig = await sendTransaction(tx, connection);
      
      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: sig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');
      
      setAmount("");
      fetchBalances();
    } catch (err) {
      console.error("Transaction failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Derived states
  const hasBalance = yusdcBalance > 0;
  const portfolioBalance = yusdcBalance; 
  const portfolioEarned = hasBalance ? portfolioBalance * 0.052 / 12 : 0; // Mock 1 month yield for demo if balance exists
  const walletBalance = usdcBalance;

  const amountNum = parseFloat(amount) || 0;
  const isBelowMinimum = activeActionTab === "Deposit" && amount !== "" && amountNum > 0 && amountNum < 50;
  const exchangeRate = 0.9917;
  const expectedReceive = (amountNum * exchangeRate).toFixed(2);

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs font-mono text-primary mb-2 uppercase tracking-widest opacity-80">
            Vela Protocol • Devnet
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm font-body max-w-2xl">
            Institutional RWA yield, routed across vetted issuers — transparent and on-chain.
          </p>
        </div>
        <div className="text-xs font-mono text-gray-500 hidden md:block">
          Epoch <span className="text-white">#1</span> <span className="mx-2">|</span> Slot <span className="text-white">312,448,201</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* LEFT COLUMN - Main Content (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border-low rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Current APY</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <div>
                <div className="text-4xl font-mono font-bold text-primary mb-1">5.2%</div>
                <div className="text-xs font-body text-gray-500">Net of all protocol fees</div>
              </div>
            </div>

            <div className="bg-card border border-border-low rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Protocol TVL</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              </div>
              <div>
                <div className="text-4xl font-mono font-bold text-white mb-1">$1250000</div>
                <div className="text-xs font-body text-green-400 font-medium flex items-center">
                  <span className="mr-1">▲</span> 2.4% <span className="text-gray-500 ml-1 font-normal">7d</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border-low rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Strategy Mode</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="flex flex-col items-start">
                <div className="border border-green-500/30 bg-green-500/10 rounded-full px-3 py-1 mb-2 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                  <span className="text-xs font-body text-green-400 font-medium">High Yield — Ondo USDY</span>
                </div>
                <div className="text-xs font-body text-gray-500">Routing optimized 4h ago</div>
              </div>
            </div>
          </div>

          {/* Portfolio Area */}
          <div className="bg-card border border-border-low rounded-xl flex flex-col overflow-hidden relative" style={{ minHeight: '360px' }}>
            {!connected ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-card">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-6"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                <h3 className="text-2xl font-display font-medium text-white mb-3">Connect to view your portfolio</h3>
                <p className="text-gray-500 text-sm font-body mb-8 max-w-sm mx-auto">
                  Your yUSDC balance, yield earnings and projection will appear here.
                </p>
                {/* Visual mock of a connect button - will be handled by WalletMultiButton generally but we replicate the design */}
                <button 
                  onClick={() => setVisible(true)}
                  className="bg-primary hover:bg-primary/90 text-black font-body font-medium rounded-full px-6 py-2.5 flex items-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col h-full">
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Portfolio Balance</div>
                    <div className="flex items-baseline mb-2">
                      <span className="text-5xl font-mono font-bold text-white mr-3">
                        {hasBalance ? `$${portfolioBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "0"}
                      </span>
                      <span className="text-gray-500 font-mono text-sm">yUSDC</span>
                    </div>
                    <div className="text-sm font-mono text-green-400 flex items-center">
                      +${portfolioEarned.toFixed(2)} <span className="text-gray-500 ml-2 font-body text-xs">earned · all-time</span>
                    </div>
                  </div>
                  
                  {/* Chart Timespan Toggles */}
                  <div className="flex bg-bg1 rounded-lg p-1 border border-border-low">
                    {['1M', '6M', '1Y'].map(span => (
                      <button key={span} className={`text-xs font-mono px-3 py-1 rounded-md transition-colors ${span === '6M' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}>
                        {span}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Earnings Projection</div>
                
                {/* Mock Chart Area */}
                <div className="relative flex-grow min-h-[160px] w-full mt-4 flex">
                  {/* Y-axis */}
                  <div className="flex flex-col justify-between text-[10px] font-mono text-gray-600 pr-4 w-12 pb-6">
                    <span>$6.1k</span>
                    <span>$5.6k</span>
                    <span>$5.3k</span>
                    <span>$5.0k</span>
                  </div>
                  
                  <div className="flex-grow relative border-b border-l border-gray-800/50">
                    {/* Grid lines */}
                    <div className="absolute top-0 w-full border-t border-gray-800/30"></div>
                    <div className="absolute top-[33%] w-full border-t border-gray-800/30"></div>
                    <div className="absolute top-[66%] w-full border-t border-gray-800/30"></div>
                    
                    {/* X-axis */}
                    <div className="absolute bottom-[-24px] left-0 w-full flex justify-between text-[10px] font-mono text-gray-600">
                      <span>W1</span>
                      <span>W6</span>
                      <span>W11</span>
                      <span>W16</span>
                      <span>W21</span>
                      <span>W26</span>
                    </div>
                    
                    {/* Chart Line (SVG) - only visible if balance > 0 */}
                    {hasBalance && (
                      <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M 0 100 Q 50 60 100 10" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" className="drop-shadow-[0_0_8px_rgba(0,194,255,0.4)]" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Chart Footer Values */}
                {hasBalance && (
                  <div className="mt-8 flex justify-between items-end border-t border-border-low pt-4">
                    <div>
                      <div className="text-xs font-body text-gray-500 mb-1">Projected at 5.2% APY</div>
                      <div className="text-sm font-mono text-primary">$5,063.69 by Jun 2</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-body text-gray-500 mb-1">Daily accrual</div>
                      <div className="text-sm font-mono text-green-400">+$0.7183</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Strategy Details Accordion */}
          <div className="bg-card border border-border-low rounded-xl overflow-hidden">
            <button 
              onClick={() => setIsStrategyExpanded(!isStrategyExpanded)}
              className="w-full p-5 flex justify-between items-center bg-card hover:bg-bg1/50 transition-colors"
            >
              <div className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <span className="font-display font-medium text-white">Strategy Details</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-500 transition-transform duration-200 ${isStrategyExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            
            {isStrategyExpanded && (
              <div className="p-5 border-t border-border-low bg-bg1/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border-low rounded-lg p-4">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Active Strategy</div>
                    <div className="text-sm font-body text-green-400 font-medium">Maximum Yield</div>
                  </div>
                  <div className="bg-card border border-border-low rounded-lg p-4">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Rebalance Freq</div>
                    <div className="text-sm font-mono text-white">Real-time / on-chain</div>
                  </div>
                  <div className="bg-card border border-border-low rounded-lg p-4">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Last Rebalance</div>
                    <div className="text-sm font-mono text-white">2h 14m ago</div>
                  </div>
                  <div className="bg-card border border-border-low rounded-lg p-4">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Next Trigger</div>
                    <div className="text-sm font-mono text-white">APY delta &gt; 25bps</div>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-xs font-body text-gray-400 leading-relaxed">
                    <span className="text-primary font-medium">Current route:</span> Capital deployed to Ondo USDY for maximum yield. Vela's routing engine monitors all 7 issuers every block and rebalances automatically when yield delta exceeds the threshold.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Issuer Allocation Table */}
          <div className="bg-card border border-border-low rounded-xl p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-display font-medium text-white mb-1">Issuer Allocation</h3>
                <p className="text-xs font-body text-gray-500">Capital routed across institutional RWA issuers</p>
              </div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center">
                Live <span className="mx-2">·</span> Updated 4m ago
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-low text-xs font-mono text-gray-500 uppercase tracking-widest">
                    <th className="pb-4 font-normal">Issuer</th>
                    <th className="pb-4 font-normal">Instrument</th>
                    <th className="pb-4 font-normal text-right">Allocation</th>
                    <th className="pb-4 font-normal text-right">APY</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-body">
                  <tr className="border-b border-border-low/50 hover:bg-bg1/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center text-white">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] mr-3">O</div>
                        Ondo Finance
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">USDY</td>
                    <td className="py-4 text-right font-mono text-primary">42%</td>
                    <td className="py-4 text-right font-mono text-green-400">5.35%</td>
                  </tr>
                  <tr className="border-b border-border-low/50 hover:bg-bg1/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center text-white">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-3"></div>
                        Maple Finance
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">USDC</td>
                    <td className="py-4 text-right font-mono text-primary">24%</td>
                    <td className="py-4 text-right font-mono text-green-400">4.95%</td>
                  </tr>
                  <tr className="border-b border-border-low/50 hover:bg-bg1/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center text-white">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] mr-3">K</div>
                        Kamino Finance
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">KMX</td>
                    <td className="py-4 text-right font-mono text-primary">16%</td>
                    <td className="py-4 text-right font-mono text-green-400">5.10%</td>
                  </tr>
                  <tr className="hover:bg-bg1/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center text-white">
                        <div className="w-6 h-6 rounded-full bg-gray-200 text-black flex items-center justify-center font-bold text-[10px] mr-3">E</div>
                        OpenEden
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">TBILL</td>
                    <td className="py-4 text-right font-mono text-primary">18%</td>
                    <td className="py-4 text-right font-mono text-green-400">5.05%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Action Widget (Deposit/Withdraw) */}
          <div className="bg-card border border-border-low rounded-xl p-5">
            {/* Tabs */}
            <div className="flex border-b border-border-low mb-6">
              <button 
                onClick={() => setActiveActionTab("Deposit")}
                className={`flex-1 pb-3 text-sm font-medium font-body flex items-center justify-center border-b-2 transition-colors ${activeActionTab === "Deposit" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                Deposit
              </button>
              <button 
                onClick={() => setActiveActionTab("Withdraw")}
                className={`flex-1 pb-3 text-sm font-medium font-body flex items-center justify-center border-b-2 transition-colors ${activeActionTab === "Withdraw" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                Withdraw
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Amount (USDC)</span>
                <span className="text-xs font-mono text-gray-500">
                  Balance: <span className="text-white">{connected ? walletBalance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : "Connect Wallet"}</span>
                </span>
              </div>
              
              <div className={`relative flex items-center bg-bg1 border rounded-lg p-3 transition-colors ${isBelowMinimum ? 'border-red-500/50 focus-within:border-red-500' : 'border-border-low focus-within:border-primary/50'}`}>
                <span className="text-gray-400 font-mono text-lg mr-2">$</span>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="bg-transparent border-none outline-none text-white font-mono text-xl w-full"
                />
                <button 
                  onClick={() => connected && setAmount(walletBalance.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-primary border border-primary/30 bg-primary/10 rounded px-2 py-1 hover:bg-primary/20 transition-colors"
                >
                  MAX
                </button>
              </div>
              
              {/* Error or Info row */}
              <div className="flex flex-col space-y-3">
                {isBelowMinimum && (
                  <div className="text-xs font-mono text-red-400">Minimum deposit is $50.00 USDC</div>
                )}
                
                {/* Receive Calculation Box */}
                <div className="bg-bg1 border border-border-low rounded-lg p-3 flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-body text-gray-400">You receive</span>
                    <span className="font-mono text-primary font-medium">~${expectedReceive} yUSDC</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-body text-gray-600">Exchange rate</span>
                    <span className="font-mono text-gray-500">1 USDC = 0.9917 yUSDC</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!connected ? (
                <button 
                  onClick={() => setVisible(true)}
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-black font-body font-medium rounded-full py-3 flex justify-center items-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                  Connect Wallet
                </button>
              ) : (
                <button 
                  disabled={isBelowMinimum || amountNum === 0 || isProcessing}
                  onClick={handleTransaction}
                  className={`w-full mt-4 font-body font-medium rounded-full py-3 flex justify-center items-center transition-colors ${
                    isBelowMinimum || amountNum === 0 || isProcessing
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-black shadow-[0_0_15px_rgba(0,194,255,0.3)]"
                  }`}
                >
                  {isProcessing ? "Processing..." : (activeActionTab === "Deposit" ? "Deposit & Earn" : "Withdraw Funds")}
                </button>
              )}
              
              <div className="text-center mt-3">
                <span className="text-[10px] font-body text-gray-500">Earning starts in the next epoch • ~4h</span>
              </div>
            </div>
          </div>

          {/* Live Yield Feed */}
          <div className="bg-card border border-border-low rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Live Yield Feed</h3>
              </div>
              <div className="text-[10px] font-mono text-gray-600">RPC • Solana</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-body text-gray-400">Ondo USDY</span>
                <div className="flex items-center font-mono">
                  <span className="text-white mr-4">5.20%</span>
                  <span className="text-green-400 text-[10px]">▲0.01</span>
                </div>
              </div>
              <div className="w-full border-t border-border-low/50"></div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-body text-gray-400">Kamino Finance KMX</span>
                <div className="flex items-center font-mono">
                  <span className="text-white mr-4">5.04%</span>
                  <span className="text-red-400 text-[10px]">▼0.01</span>
                </div>
              </div>
              <div className="w-full border-t border-border-low/50"></div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-body text-gray-400">Maple Finance USDC</span>
                <div className="flex items-center font-mono">
                  <span className="text-white mr-4">5.24%</span>
                  <span className="text-green-400 text-[10px]">▲0.00</span>
                </div>
              </div>
              <div className="w-full border-t border-border-low/50"></div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="font-body text-gray-400">Open Eden TBILL</span>
                <div className="flex items-center font-mono">
                  <span className="text-white mr-4">4.95%</span>
                  <span className="text-green-400 text-[10px]">▲0.02</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Earnings (Only visible if connected and has balance) */}
          {connected && hasBalance && (
            <div className="bg-card border border-border-low rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-body text-gray-400">Live Earnings</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="text-2xl font-mono text-green-400 font-bold">
                +$0.0012<span className="text-sm text-gray-500 font-normal">/min</span>
              </div>
            </div>
          )}

          {/* Audited By Footer */}
          <div className="bg-card border border-border-low rounded-xl p-5">
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Audited By</div>
            <div className="flex items-center justify-between text-xs font-body text-gray-400">
              <span>OtterSec</span>
              <span className="text-gray-700">·</span>
              <span>Halborn</span>
              <span className="text-gray-700">·</span>
              <span>Sec3</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
