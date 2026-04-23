use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::errors::VelaError;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"aggregator_state"],
        bump = aggregator_state.bump
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [b"user_position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdc_mint,
        associated_token::authority = aggregator_state,
        associated_token::token_program = token_program
    )]
    pub vault_usdc_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program
    )]
    pub user_usdc_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"yusdc_mint"],
        bump,
        mint::authority = aggregator_state,
        mint::token_program = token_2022_program
    )]
    pub yusdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = yusdc_mint,
        associated_token::authority = user,
        associated_token::token_program = token_2022_program
    )]
    pub user_yusdc_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_2022_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle_deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // Enforce $50 minimum deposit (50,000,000 micro-USDC assuming 6 decimals)
    require!(amount >= 50_000_000, VelaError::MinimumDepositNotMet);

    // Initialize UserPosition fields if this is a new account
    if ctx.accounts.user_position.owner == Pubkey::default() {
        let user_position = &mut ctx.accounts.user_position;
        user_position.owner = ctx.accounts.user.key();
        user_position.active_deposit = 0;
        user_position.pending_withdrawal = 0;
        user_position.unlock_timestamp = 0;
        user_position.bump = ctx.bumps.user_position;
    }

    msg!("Deposit validated: Amount {} meets minimum requirement.", amount);
    // TODO: Transfer USDC and Mint yUSDC (to be implemented in Part 2)

    Ok(())
}
