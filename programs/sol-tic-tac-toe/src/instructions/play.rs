use anchor_lang::prelude::*;
use crate::state::game::Game;
use crate::errors::TicTacToeError;
use crate::state::game::Tile;

pub fn play(ctx: Context<Play>, tile: Tile) -> Result<()> {
    let game = &mut ctx.accounts.game;

    require_keys_eq!(
        game.current_player(),
        ctx.accounts.player.key(),
        TicTacToeError::NotPlayerTurn
    );

    game.play(&tile)
}

#[derive(Accounts)]
pub struct Play<'info> {
    #[account(mut)]
    game: Account<'info, Game>,
    player: Signer<'info>,
}