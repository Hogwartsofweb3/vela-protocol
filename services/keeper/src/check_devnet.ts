import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN');

async function main() {
  const accountInfo = await connection.getAccountInfo(programId);
  if (accountInfo) {
    console.log(`\n✅ Program is successfully deployed on Devnet!`);
    console.log(`Program ID: ${programId.toBase58()}`);
    console.log(`Executable: ${accountInfo.executable}`);
    console.log(`Owner: ${accountInfo.owner.toBase58()}`);
    console.log(`Data Size: ${accountInfo.data.length} bytes\n`);
  } else {
    console.log(`\n❌ Program not found on Devnet at ${programId.toBase58()}\n`);
  }
}

main().catch(console.error);
