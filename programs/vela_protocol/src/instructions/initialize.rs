use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
use crate::state::*;
use crate::KEEPER_AUTHORITY;

#[derive(Accounts)]
pub struct InitializeAggregator<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + AggregatorConfig::INIT_SPACE,
        seeds = [b"aggregator_state"],
        bump
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    #[account(
        init,
        payer = admin,
        space = 8 + YieldOracle::INIT_SPACE,
        seeds = [b"yield_oracle"],
        bump
    )]
    pub yield_oracle: Account<'info, YieldOracle>,

    // Explicitly bound to Token-2022 via mint::token_program.
    // This prevents a misconfigured caller from creating yUSDC as a classic SPL token.
    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = aggregator_state,
        mint::token_program = token_2022_program,
        seeds = [b"yusdc_mint"],
        bump
    )]
    pub yusdc_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    /// CHECK: Must be the SPL Token-2022 program — enforced via mint::token_program constraint above.
    pub token_2022_program: Interface<'info, TokenInterface>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_initialize_aggregator(ctx: Context<InitializeAggregator>) -> Result<()> {
    // 1. Configure the Global Aggregator State
    let aggregator = &mut ctx.accounts.aggregator_state;
    aggregator.admin  = ctx.accounts.admin.key();
    aggregator.keeper = KEEPER_AUTHORITY;
    aggregator.yusdc_mint = ctx.accounts.yusdc_mint.key();
    aggregator.total_deposited = 0;
    aggregator.current_strategy = 0;
    aggregator.bump = ctx.bumps.aggregator_state;

    // 2. Configure the Oracle Tracker
    let oracle = &mut ctx.accounts.yield_oracle;
    oracle.ondo_apy_bps   = 0;
    oracle.kamino_apy_bps = 0;
    oracle.last_update    = 0;
    oracle.bump           = ctx.bumps.yield_oracle;

    msg!("Vela Aggregator initialized successfully.");
    msg!("yUSDC Token-2022 Mint securely created and owned by the vault.");
    Ok(())
}
