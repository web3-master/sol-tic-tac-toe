mod errors;
mod state;

use anchor_lang::prelude::*;
use errors::TicTacToeError;
use state::game::*;


declare_id!("EPrJwhiyKRits37fRmPhnpCSduZ4XKJDZXnBQs87J5Fu");

#[program]
pub mod sol_tic_tac_toe {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
