use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserPosition {
    pub owner: Pubkey,            // Wallet address of the depositor
    pub active_deposit: u64,      // Amount currently earning yield
    pub pending_withdrawal: u64,  // Amount requested for withdrawal
    pub unlock_timestamp: i64,    // Epoch timestamp when withdrawal is ready
    pub bump: u8,
}
