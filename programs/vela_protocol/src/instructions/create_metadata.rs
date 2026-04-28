use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token_interface::TokenInterface;
use spl_token_metadata_interface::instruction::initialize as token_metadata_initialize_ix;
use crate::state::*;
use crate::errors::VelaError;

/// Writes name / symbol / uri into the yUSDC mint's TokenMetadata extension.
///
/// Run this ONCE after `initialize_aggregator`. The mint must have been
/// created with the MetadataPointer extension pointing to itself (see
/// initialize.rs). After this call Phantom (and any wallet that supports
/// Token-2022 native metadata) will display the token correctly.
#[derive(Accounts)]
pub struct CreateTokenMetadata<'info> {
    /// Must match aggregator_state.admin
    #[account(
        mut,
        constraint = admin.key() == aggregator_state.admin @ VelaError::UnauthorizedKeeper
    )]
    pub admin: Signer<'info>,

    /// The update-authority stored in the MetadataPointer is aggregator_state
    #[account(
        mut,
        seeds = [b"aggregator_state"],
        bump = aggregator_state.bump,
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    /// CHECK: The yUSDC Token-2022 mint PDA. Passed as UncheckedAccount so we
    /// can realloc it via CPI without Anchor interfering.
    #[account(
        mut,
        seeds = [b"yusdc_mint"],
        bump,
    )]
    pub yusdc_mint: UncheckedAccount<'info>,

    /// The SPL Token-2022 program
    pub token_2022_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_token_metadata(
    ctx: Context<CreateTokenMetadata>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let agg_bump = ctx.accounts.aggregator_state.bump;

    // aggregator_state signs as the mint's update-authority
    let agg_seeds: &[&[u8]] = &[b"aggregator_state", &[agg_bump]];
    let signer_seeds: &[&[&[u8]]] = &[agg_seeds];

    // `token_metadata_initialize_ix` builds the instruction that calls into
    // the Token-2022 program's TokenMetadata extension handler.
    // It reallocates the mint account to fit the metadata and writes the fields.
    let ix = token_metadata_initialize_ix(
        &ctx.accounts.token_2022_program.key(), // token program (Token-2022)
        &ctx.accounts.yusdc_mint.key(),         // mint (= metadata account)
        &ctx.accounts.aggregator_state.key(),   // update authority (our PDA)
        &ctx.accounts.yusdc_mint.key(),         // mint authority (same PDA, signed via signer_seeds)
        &ctx.accounts.admin.key(),              // payer for realloc lamports
        name.clone(),
        symbol.clone(),
        uri.clone(),
    );

    invoke_signed(
        &ix,
        &[
            ctx.accounts.yusdc_mint.to_account_info(),        // mint / metadata account
            ctx.accounts.aggregator_state.to_account_info(),  // update authority (signer via PDA)
            ctx.accounts.admin.to_account_info(),             // payer
            ctx.accounts.system_program.to_account_info(),    // system program (for realloc)
        ],
        signer_seeds,
    )?;

    msg!(
        "yUSDC Token-2022 metadata set: \"{}\" ({}) → {}",
        name,
        symbol,
        uri
    );

    Ok(())
}
