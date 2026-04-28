use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction;
use anchor_spl::token_interface::TokenInterface;
use spl_token_2022::{
    extension::{metadata_pointer::instruction::initialize as mp_init_ix, ExtensionType},
    instruction::initialize_mint2,
    state::Mint,
};
use crate::state::*;
use crate::errors::VelaError;
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

    /// CHECK: Initialised manually below (3-step Token-2022 extension flow).
    /// Anchor's `init` + `mint::*` cannot be used because Token-2022 extension
    /// initialisers MUST run before `InitializeMint2`, but Anchor's constraint
    /// calls `InitializeMint2` automatically as the last step of `init`.
    #[account(
        mut,
        seeds = [b"yusdc_mint"],
        bump
    )]
    pub yusdc_mint: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: Must be the SPL Token-2022 program.
    pub token_2022_program: Interface<'info, TokenInterface>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handle_initialize_aggregator(ctx: Context<InitializeAggregator>) -> Result<()> {
    // ── 1. AggregatorState ──────────────────────────────────────────────────
    let agg        = &mut ctx.accounts.aggregator_state;
    agg.admin            = ctx.accounts.admin.key();
    agg.keeper           = KEEPER_AUTHORITY;
    agg.yusdc_mint       = ctx.accounts.yusdc_mint.key();
    agg.total_deposited  = 0;
    agg.current_strategy = 0;
    agg.bump             = ctx.bumps.aggregator_state;

    // ── 2. YieldOracle ──────────────────────────────────────────────────────
    let oracle         = &mut ctx.accounts.yield_oracle;
    oracle.ondo_apy_bps   = 0;
    oracle.kamino_apy_bps = 0;
    oracle.last_update    = 0;
    oracle.bump           = ctx.bumps.yield_oracle;

    // ── 3. yUSDC mint — manual Token-2022 extension init ───────────────────
    //
    // Correct order for a Token-2022 mint with extensions:
    //   a) system::create_account   (allocate + assign to Token-2022 program)
    //   b) extension initialiser(s) (MetadataPointer — BEFORE InitializeMint2)
    //   c) initialize_mint2         (finalise the mint)
    //
    // MetadataPointer points the mint at itself so wallets know the
    // TokenMetadata extension is embedded in the mint account directly.

    let mint_bump       = ctx.bumps.yusdc_mint;
    let mint_seeds: &[&[u8]]       = &[b"yusdc_mint", &[mint_bump]];
    let signer_seeds: &[&[&[u8]]]  = &[mint_seeds];

    // Space = Mint base + MetadataPointer extension header
    let space = ExtensionType::try_calculate_account_len::<Mint>(
        &[ExtensionType::MetadataPointer],
    )
    .map_err(|_| error!(VelaError::MathOverflow))?;

    let lamports = ctx.accounts.rent.minimum_balance(space);

    // a) Allocate account
    let create_ix = system_instruction::create_account(
        &ctx.accounts.admin.key(),
        &ctx.accounts.yusdc_mint.key(),
        lamports,
        space as u64,
        &ctx.accounts.token_2022_program.key(),
    );
    invoke_signed(
        &create_ix,
        &[
            ctx.accounts.admin.to_account_info(),
            ctx.accounts.yusdc_mint.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        signer_seeds,
    )?;

    // b) Initialize MetadataPointer (metadata address = mint itself)
    let mp_ix = mp_init_ix(
        &ctx.accounts.token_2022_program.key(),
        &ctx.accounts.yusdc_mint.key(),
        Some(ctx.accounts.aggregator_state.key()), // update authority = our PDA
        Some(ctx.accounts.yusdc_mint.key()),       // metadata lives in the mint
    )
    .map_err(|_| error!(VelaError::MathOverflow))?;

    invoke_signed(
        &mp_ix,
        &[ctx.accounts.yusdc_mint.to_account_info()],
        signer_seeds,
    )?;

    // c) Finalize the mint
    let mint_ix = initialize_mint2(
        &ctx.accounts.token_2022_program.key(),
        &ctx.accounts.yusdc_mint.key(),
        &ctx.accounts.aggregator_state.key(), // mint authority = aggregator PDA
        None,                                  // no freeze authority
        6,                                     // 6 decimals (same as USDC)
    )
    .map_err(|_| error!(VelaError::MathOverflow))?;

    invoke_signed(
        &mint_ix,
        &[ctx.accounts.yusdc_mint.to_account_info()],
        signer_seeds,
    )?;

    msg!("Vela Aggregator initialized.");
    msg!("yUSDC Token-2022 mint created with MetadataPointer extension.");
    Ok(())
}
