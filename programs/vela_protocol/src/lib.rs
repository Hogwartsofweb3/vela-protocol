use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey;

declare_id!("6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN");

// Configured Keeper Authority (Dedicated keeper keypair — services/keeper/keeper.json)
pub const KEEPER_AUTHORITY: Pubkey = pubkey!("B4vpi92S581H6NtzM1cUs3vK3mvGd32XXqyd1w3M5n8X");

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

    pub fn create_position(ctx: Context<CreatePosition>) -> Result<()> {
        instructions::handle_create_position(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::handle_deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::handle_withdraw(ctx, amount)
    }

    pub fn update_oracle(ctx: Context<UpdateOracle>, ondo_apy_bps: u16, kamino_apy_bps: u16) -> Result<()> {
        instructions::handle_update_oracle(ctx, ondo_apy_bps, kamino_apy_bps)
    }

    pub fn rebalance(ctx: Context<Rebalance>) -> Result<()> {
        instructions::handle_rebalance(ctx)
    }

    pub fn create_token_metadata(
        ctx: Context<CreateTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::handle_create_token_metadata(ctx, name, symbol, uri)
    }
}
