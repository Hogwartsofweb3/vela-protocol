use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Burn, Token, TokenAccount, Transfer};

declare_id!("MoCKKamino111111111111111111111111111111111");

#[program]
pub mod mock_kamino {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.global_state;
        state.admin = ctx.accounts.admin.key();
        state.bump = ctx.bumps.global_state;
        Ok(())
    }

    pub fn deposit_and_mint(ctx: Context<DepositAndMint>, amount: u64) -> Result<()> {
        // Transfer USDC from user to vault
        let transfer_cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_usdc_account.to_account_info(),
                to: ctx.accounts.vault_usdc_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_cpi, amount)?;

        // Mint mkUSDC to user
        let bump = ctx.accounts.global_state.bump;
        let seeds = &[b"global_state".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let mint_cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mkusdc_mint.to_account_info(),
                to: ctx.accounts.user_mkusdc_account.to_account_info(),
                authority: ctx.accounts.global_state.to_account_info(),
            },
            signer,
        );
        token::mint_to(mint_cpi, amount)?;

        Ok(())
    }

    pub fn burn_and_withdraw(ctx: Context<BurnAndWithdraw>, amount: u64) -> Result<()> {
        // Burn mkUSDC from user
        let burn_cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mkusdc_mint.to_account_info(),
                from: ctx.accounts.user_mkusdc_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_cpi, amount)?;

        // Transfer USDC from vault back to user
        let bump = ctx.accounts.global_state.bump;
        let seeds = &[b"global_state".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let transfer_cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_usdc_account.to_account_info(),
                to: ctx.accounts.user_usdc_account.to_account_info(),
                authority: ctx.accounts.global_state.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_cpi, amount)?;

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub admin: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositAndMint<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"global_state"], bump = global_state.bump)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub mkusdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_mkusdc_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnAndWithdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"global_state"], bump = global_state.bump)]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub usdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub mkusdc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_mkusdc_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
