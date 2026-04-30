const { Connection, PublicKey } = require('@solana/web3.js');
const conn = new Connection('https://api.devnet.solana.com');
const wallet = new PublicKey('FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ');
conn.getBalance(wallet).then(b => console.log('Devnet SOL:', b / 1e9));
