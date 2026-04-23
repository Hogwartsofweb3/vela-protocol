use anchor_lang::prelude::*;
use solana_program::pubkey;

declare_id!("vELaP4bE8YfS2PqNXZj5m3tEwP6dZk3P");

// Configured Keeper Authority (Michael's Devnet Wallet)
pub const KEEPER_AUTHORITY: Pubkey = pubkey!("FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ");

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

#[program]
pub mod vela_protocol {
    use super::*;

    pub fn initialize_aggregator(ctx: Context<InitializeAggregator>) -> Result<()> {
        instructions::handle_initialize_aggregator(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::handle_deposit(ctx, amount)
    }
}
