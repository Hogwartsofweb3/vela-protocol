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

use anchor_spl::token_interface::{mint_to, MintTo, transfer_checked, TransferChecked};

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

    // Transfer USDC from User to Vault
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.user_usdc_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        to: ctx.accounts.vault_usdc_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
    let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);
    transfer_checked(transfer_cpi_ctx, amount, 6)?;

    // Mint yUSDC to User (1:1 with USDC deposited)
    let seeds = &[b"aggregator_state", &[ctx.accounts.aggregator_state.bump]];
    let signer = &[&seeds[..]];

    let mint_cpi_accounts = MintTo {
        mint: ctx.accounts.yusdc_mint.to_account_info(),
        to: ctx.accounts.user_yusdc_account.to_account_info(),
        authority: ctx.accounts.aggregator_state.to_account_info(),
    };
    let mint_cpi_program = ctx.accounts.token_2022_program.to_account_info();
    let mint_cpi_ctx = CpiContext::new_with_signer(mint_cpi_program, mint_cpi_accounts, signer);
    mint_to(mint_cpi_ctx, amount)?;

    // Update State
    let user_position = &mut ctx.accounts.user_position;
    user_position.active_deposit = user_position.active_deposit.checked_add(amount).ok_or(VelaError::MathOverflow)?;

    let aggregator = &mut ctx.accounts.aggregator_state;
    aggregator.total_deposited = aggregator.total_deposited.checked_add(amount).ok_or(VelaError::MathOverflow)?;

    msg!("Deposit successful: {} USDC deposited and yUSDC minted.", amount);

    Ok(())
}
