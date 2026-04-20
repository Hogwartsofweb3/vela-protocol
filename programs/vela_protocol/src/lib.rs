use anchor_lang::prelude::*;

declare_id!("vELaP4bE8YfS2PqNXZj5m3tEwP6dZk3P");

// Configured Keeper Authority (Michael's Devnet Wallet)
pub const KEEPER_AUTHORITY: &str = "FfS9UHyxbRjtKTRpskov8oYu6xtx2m9Pe1BccLJeZvQZ";

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

#[program]
pub mod vela_protocol {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {}", program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
