const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync } = require('@solana/spl-token');
const conn = new Connection('https://api.devnet.solana.com');

async function check() {
  const wallet = new PublicKey('FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ');
  const balance = await conn.getBalance(wallet);
  console.log('✅ Devnet SOL:', balance / 1e9);

  const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  const PROGRAM_ID = new PublicKey('6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN');
  const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  const TOKEN_2022 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
  const ASSOC_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bQ');

  const [aggState] = PublicKey.findProgramAddressSync([Buffer.from('aggregator_state')], PROGRAM_ID);
  const [yusdcMint] = PublicKey.findProgramAddressSync([Buffer.from('yusdc_mint')], PROGRAM_ID);
  const [userPos] = PublicKey.findProgramAddressSync([Buffer.from('user_position'), wallet.toBuffer()], PROGRAM_ID);
  
  const vaultUsdc = getAssociatedTokenAddressSync(USDC_MINT, aggState, true, TOKEN_PROGRAM);
  
  const userUsdc = getAssociatedTokenAddressSync(USDC_MINT, wallet, false, TOKEN_PROGRAM);

  console.log('\n📍 PDAs:');
  console.log('  AggregatorState:', aggState.toBase58());
  console.log('  yUSDC Mint:     ', yusdcMint.toBase58());
  console.log('  Vault USDC ATA: ', vaultUsdc.toBase58());
  console.log('  User Position:  ', userPos.toBase58());
  console.log('  User USDC ATA:  ', userUsdc.toBase58());

  console.log('\n📊 Account States:');
  const aggInfo = await conn.getAccountInfo(aggState);
  console.log('  AggregatorState exists:', !!aggInfo, aggInfo ? `(${aggInfo.lamports / 1e9} SOL)` : '');

  const yusdcInfo = await conn.getAccountInfo(yusdcMint);
  console.log('  yUSDC Mint exists:     ', !!yusdcInfo);

  const vaultInfo = await conn.getAccountInfo(vaultUsdc);
  console.log('  Vault USDC ATA exists: ', !!vaultInfo, '← needs creating on first deposit');

  const userPosInfo = await conn.getAccountInfo(userPos);
  console.log('  User Position exists:  ', !!userPosInfo, '← needs creating on first deposit');

  const userUsdcInfo = await conn.getTokenAccountBalance(userUsdc).catch(() => null);
  console.log('  User USDC Balance:     ', userUsdcInfo ? `${userUsdcInfo.value.uiAmount} USDC` : 'No USDC ATA found');
}

check().catch(console.error);
