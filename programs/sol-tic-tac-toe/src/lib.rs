mod errors;
mod state;
mod instructions;

use anchor_lang::prelude::*;
use errors::TicTacToeError;
use state::game::*;
use instructions::setup_game::*;


declare_id!("EPrJwhiyKRits37fRmPhnpCSduZ4XKJDZXnBQs87J5Fu");

#[program]
pub mod sol_tic_tac_toe {
    use super::*;

    pub fn setup_game(ctx: Context<SetupGame>, player_two: Pubkey) -> Result<()> {
        instructions::setup_game::setup_game(ctx, player_two)
    }
}