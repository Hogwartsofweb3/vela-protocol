use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct YieldOracle {
    pub ondo_apy_bps: u16,        // Ondo USDY yield in basis points
    pub kamino_apy_bps: u16,      // Kamino USDC yield in basis points
    pub last_update: i64,         // Unix timestamp of the last ping
    pub bump: u8,
}
