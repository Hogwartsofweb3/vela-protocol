use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AggregatorConfig {
    pub admin: Pubkey,            // Protocol admin
    pub keeper: Pubkey,           // Keeper authority for rebalancing (Michael's wallet)
    pub yusdc_mint: Pubkey,       // The Token-2022 receipt token mint
    pub total_deposited: u64,     // Total USDC inside the aggregated vault
    pub current_strategy: u8,     // 0 = Safe (Treasury/Kamino), 1 = High Yield (Ondo)
    pub bump: u8,                 // PDA bump for routing
}
