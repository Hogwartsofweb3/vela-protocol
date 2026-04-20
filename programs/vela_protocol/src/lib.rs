use anchor_lang::prelude::*;

declare_id!("vELaP4bE8YfS2PqNXZj5m3tEwP6dZk3P");

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
