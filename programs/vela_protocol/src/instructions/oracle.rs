use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::VelaError;

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(mut)]
    pub keeper: Signer<'info>,

    #[account(
        seeds = [b"aggregator_state"],
        bump = aggregator_state.bump,
        has_one = keeper @ VelaError::UnauthorizedKeeper
    )]
    pub aggregator_state: Account<'info, AggregatorConfig>,

    #[account(
        mut,
        seeds = [b"yield_oracle"],
        bump = yield_oracle.bump
    )]
    pub yield_oracle: Account<'info, YieldOracle>,
}

pub fn handle_update_oracle(ctx: Context<UpdateOracle>, ondo_apy_bps: u16, kamino_apy_bps: u16) -> Result<()> {
    // ── Security: Hard insanity cap ───────────────────────────────────────────
    // A compromised keeper cannot set APY above 50% (5000 bps = 50%).
    // This prevents catastrophic over-minting of yUSDC regardless of keeper key exposure.
    const APY_CAP_BPS: u16 = 5_000;
    require!(ondo_apy_bps   <= APY_CAP_BPS, VelaError::OracleApyTooHigh);
    require!(kamino_apy_bps <= APY_CAP_BPS, VelaError::OracleApyTooHigh);

    let oracle = &mut ctx.accounts.yield_oracle;

    oracle.ondo_apy_bps   = ondo_apy_bps;
    oracle.kamino_apy_bps = kamino_apy_bps;

    let clock = Clock::get()?;
    oracle.last_update = clock.unix_timestamp;

    msg!("Oracle updated. Ondo APY: {} bps, Kamino APY: {} bps", ondo_apy_bps, kamino_apy_bps);

    // ── Safety floor: warn if primary yield drops below 3.5% target ──────────
    if ondo_apy_bps < 350 {
        msg!("WARNING: Ondo Yield has dropped below the 3.5% safe floor. Rotation trigger evaluated.");
    }

    Ok(())
}
