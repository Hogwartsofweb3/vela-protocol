const { Connection, PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");
const anchor = require("@coral-xyz/anchor");

const pubkey = new PublicKey("FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ");
const mint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

const ata1 = getAssociatedTokenAddressSync(mint, pubkey);
const ata2 = anchor.utils.token.associatedAddress({ mint, owner: pubkey });

console.log("spl-token:", ata1.toBase58());
console.log("anchor:", ata2.toBase58());

const devnet = new Connection("https://api.devnet.solana.com");
devnet.getParsedTokenAccountsByOwner(pubkey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") })
  .then(res => {
      res.value.forEach(t => console.log("actual token account:", t.pubkey.toBase58(), t.account.data.parsed.info.mint));
  });
