const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
require('cross-fetch/polyfill');

async function main() {
  const c = new Connection('https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023', 'confirmed');
  const idl = JSON.parse(fs.readFileSync('./frontend/app/lib/idl.json'));
  
  const pubkey = new PublicKey('FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ');
  const programIdObj = new PublicKey('6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN');
  const [aggregatorStatePda] = PublicKey.findProgramAddressSync([Buffer.from('aggregator_state')], programIdObj);
  const [yusdcMintPda] = PublicKey.findProgramAddressSync([Buffer.from('yusdc_mint')], programIdObj);
  
  const dummyWallet = { publicKey: pubkey, signTransaction: async (tx) => tx, signAllTransactions: async (txs) => txs };
  const provider = new anchor.AnchorProvider(c, dummyWallet, { commitment: 'confirmed' });
  const p = new anchor.Program(idl, provider);
  
  const tx = await p.methods.createTokenMetadata(
    'Vela Yield USD', 'yUSDC', 'https://raw.githubusercontent.com/Hogwartsofweb3/vela-protocol/main/assets/yusdc-metadata.json'
  ).accounts({
    admin: pubkey,
    aggregatorState: aggregatorStatePda,
    yusdcMint: yusdcMintPda,
    token2022Program: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
    systemProgram: SystemProgram.programId
  }).transaction();
  
  tx.feePayer = pubkey;
  const blockhash = await c.getLatestBlockhash();
  tx.recentBlockhash = blockhash.blockhash;
  
  const res = await fetch('https://devnet.helius-rpc.com/?api-key=8f797566-4b17-4c2c-b87c-82d376b4d023', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'simulateTransaction',
      params: [
        tx.serialize({ requireAllSignatures: false }).toString('base64'),
        { encoding: 'base64', replaceRecentBlockhash: true, sigVerify: false }
      ]
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.result.value.err));
  console.log(data.result.value.logs);
}

main().catch(console.error);
