const { Connection, PublicKey } = require("@solana/web3.js");

async function checkWallet(address) {
    const pubkey = new PublicKey(address);
    const devnet = new Connection("https://api.devnet.solana.com");
    const testnet = new Connection("https://api.testnet.solana.com");

    console.log("=== DEVNET ===");
    const devnetTokens = await devnet.getParsedTokenAccountsByOwner(pubkey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });
    devnetTokens.value.forEach(t => console.log(t.account.data.parsed.info.mint, t.account.data.parsed.info.tokenAmount.uiAmount));

    console.log("=== TESTNET ===");
    const testnetTokens = await testnet.getParsedTokenAccountsByOwner(pubkey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });
    testnetTokens.value.forEach(t => console.log(t.account.data.parsed.info.mint, t.account.data.parsed.info.tokenAmount.uiAmount));
}

checkWallet("FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ").catch(console.error);
