use anchor_lang::prelude::*;
use anchor_spl::token_interface::{burn, Burn, transfer_checked, TransferChecked, Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::*;
use crate::errors::VelaError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"aggregator_state"],
        bump = aggregator_state.bump
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    #[account(
        mut,
        seeds = [b"user_position", user.key().as_ref()],
        bump = user_position.bump,
        has_one = owner
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = aggregator_state,
        associated_token::token_program = token_program
    )]
    pub vault_usdc_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
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
        mut,
        associated_token::mint = yusdc_mint,
        associated_token::authority = user,
        associated_token::token_program = token_2022_program
    )]
    pub user_yusdc_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Validated inside constraint
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_2022_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Verify user has sufficient balance
    require!(ctx.accounts.user_position.active_deposit >= amount, VelaError::InsufficientBalance);

    // 1. Burn yUSDC tokens from the User
    let burn_cpi_accounts = Burn {
        mint: ctx.accounts.yusdc_mint.to_account_info(),
        from: ctx.accounts.user_yusdc_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let burn_cpi_program = ctx.accounts.token_2022_program.to_account_info();
    let burn_cpi_ctx = CpiContext::new(burn_cpi_program, burn_cpi_accounts);
    burn(burn_cpi_ctx, amount)?;

    // 2. Transfer USDC from Vault to User
    let seeds = &[b"aggregator_state", &[ctx.accounts.aggregator_state.bump]];
    let signer = &[&seeds[..]];

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.vault_usdc_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        to: ctx.accounts.user_usdc_account.to_account_info(),
        authority: ctx.accounts.aggregator_state.to_account_info(),
    };
    let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
    let transfer_cpi_ctx = CpiContext::new_with_signer(transfer_cpi_program, transfer_cpi_accounts, signer);
    transfer_checked(transfer_cpi_ctx, amount, 6)?;

    // 3. Update State
    let user_position = &mut ctx.accounts.user_position;
    user_position.active_deposit = user_position.active_deposit.checked_sub(amount).unwrap();

    let aggregator = &mut ctx.accounts.aggregator_state;
    aggregator.total_deposited = aggregator.total_deposited.checked_sub(amount).unwrap();

    msg!("Withdrawal successful: {} USDC returned, yUSDC burned.", amount);

    Ok(())
}
