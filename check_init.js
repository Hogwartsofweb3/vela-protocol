const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://api.devnet.solana.com');
const [pda] = PublicKey.findProgramAddressSync([Buffer.from('aggregator_state')], new PublicKey('6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN'));
conn.getAccountInfo(pda).then(info => console.log(info ? 'INITIALIZED' : 'NOT INITIALIZED'));
