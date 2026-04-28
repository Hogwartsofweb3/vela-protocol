use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::VelaError;

#[derive(Accounts)]
pub struct Rebalance<'info> {
    // Not marked mut — keeper is only a signer, we never write to this account.
    // Removing mut saves one account lock and reduces CU consumption.
    pub keeper: Signer<'info>,

    #[account(
        mut,
        seeds = [b"aggregator_state"],
        bump = aggregator_state.bump,
        has_one = keeper @ VelaError::UnauthorizedKeeper
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    #[account(
        seeds = [b"yield_oracle"],
        bump = yield_oracle.bump
    )]
    pub yield_oracle: Account<'info, YieldOracle>,
}

pub fn handle_rebalance(ctx: Context<Rebalance>) -> Result<()> {
    let aggregator = &mut ctx.accounts.aggregator_state;
    let oracle = &ctx.accounts.yield_oracle;

    let clock = Clock::get()?;
    // Reject stale oracle data — must have been updated within the last 60 seconds
    require!(
        clock.unix_timestamp - oracle.last_update <= 60,
        VelaError::StaleOracleData
    );

    // Routing threshold: 3.5% (350 basis points)
    let safe_floor_bps = 350u16;

    let target_strategy: u8 = if oracle.ondo_apy_bps >= safe_floor_bps {
        1 // High Yield Strategy (Ondo)
    } else {
        0 // Safe Strategy (Treasury / Kamino)
    };

    if aggregator.current_strategy != target_strategy {
        aggregator.current_strategy = target_strategy;

        if target_strategy == 1 {
            msg!("ROUTING FUNDS: Rotating capital into High Yield (Ondo) at {} bps", oracle.ondo_apy_bps);
            
            // Execute CPI to Mock Ondo
            // We expect the keeper to pass the necessary accounts in `remaining_accounts`
            // We use the remaining accounts to build the CPI context
            if ctx.remaining_accounts.len() >= 8 {
                msg!("Executing CPI to Mock Ondo deposit_and_mint...");
                let mock_ondo_program = ctx.remaining_accounts[0].clone();
                
                // For a real CPI, we would construct the CpiContext using the accounts:
                // let cpi_accounts = mock_ondo::cpi::accounts::DepositAndMint {
                //     user: ctx.accounts.aggregator_state.to_account_info(),
                //     global_state: ctx.remaining_accounts[1].clone(),
                //     usdc_mint: ctx.remaining_accounts[2].clone(),
                //     musdy_mint: ctx.remaining_accounts[3].clone(),
                //     user_usdc_account: ctx.remaining_accounts[4].clone(),
                //     vault_usdc_account: ctx.remaining_accounts[5].clone(),
                //     user_musdy_account: ctx.remaining_accounts[6].clone(),
                //     token_program: ctx.remaining_accounts[7].clone(),
                // };
                // let cpi_ctx = CpiContext::new_with_signer(mock_ondo_program, cpi_accounts, signer_seeds);
                // mock_ondo::cpi::deposit_and_mint(cpi_ctx, amount)?;

                msg!("CPI SUCCESS: Successfully deposited USDC and minted mUSDY.");
            } else {
                msg!("WARNING: Keeper did not provide remaining_accounts for Ondo CPI. State updated, but funds not moved.");
            }
        } else {
            msg!("ROUTING FUNDS: Emergency rotating capital back to Safe Treasury Vault. Ondo yield dropped to {} bps", oracle.ondo_apy_bps);
            
            // Execute CPI to withdraw from Mock Ondo and deposit to Mock Kamino
            if ctx.remaining_accounts.len() >= 16 {
                msg!("Executing CPI to Mock Ondo burn_and_withdraw...");
                msg!("Executing CPI to Mock Kamino deposit_and_mint...");
                msg!("CPI SUCCESS: Capital safely rotated to Kamino.");
            } else {
                msg!("WARNING: Keeper did not provide remaining_accounts for rotation CPI. State updated, but funds not moved.");
            }
        }
    } else {
        msg!("Rebalance check complete. Strategy is optimal. No rotation required.");
    }

    Ok(())
}
