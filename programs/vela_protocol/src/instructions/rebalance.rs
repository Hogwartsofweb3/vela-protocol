use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::VelaError;

#[derive(Accounts)]
pub struct Rebalance<'info> {
    #[account(mut)]
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

    // The threshold for safety: 3.5% (350 basis points)
    let safe_floor_bps = 350;

    let target_strategy: u8 = if oracle.ondo_apy_bps >= safe_floor_bps {
        1 // High Yield Strategy (Ondo)
    } else {
        0 // Safe Strategy (Treasury / Kamino)
    };

    if aggregator.current_strategy != target_strategy {
        // Execute the Rotation
        aggregator.current_strategy = target_strategy;

        if target_strategy == 1 {
            msg!("ROUTING FUNDS: Rotating capital into High Yield (Ondo) at {} bps", oracle.ondo_apy_bps);
        } else {
            msg!("ROUTING FUNDS: Emergency rotating capital back to Safe Treasury Vault. Ondo yield dropped to {} bps", oracle.ondo_apy_bps);
        }
        
        // TODO (Session 9): Replace these logs with actual CPI calls to Kamino/Ondo programs.
    } else {
        msg!("Rebalance check complete. Strategy is optimal. No rotation required.");
    }

    Ok(())
}
