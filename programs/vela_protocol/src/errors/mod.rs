use anchor_lang::prelude::*;

#[error_code]
pub enum VelaError {
    #[msg("Minimum deposit of $50 USDC (50,000,000 micro-USDC) is required.")]
    MinimumDepositNotMet,
    #[msg("Insufficient balance for withdrawal.")]
    InsufficientBalance,
    #[msg("Unauthorized: Only the designated keeper can call this instruction.")]
    UnauthorizedKeeper,
    #[msg("Math operation overflowed.")]
    MathOverflow,
    #[msg("Oracle data is stale. Please update oracle before rebalancing.")]
    StaleOracleData,
}
