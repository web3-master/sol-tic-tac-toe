use anchor_lang::prelude::*;
use crate::state::game::*;

pub fn setup_game(ctx: Context<SetupGame>, player_two: Pubkey) -> Result<()> {
    ctx.accounts.game.start([ctx.accounts.player_one.key(), player_two])
}

#[derive(Accounts)]
pub struct SetupGame<'info> {
    #[account(init, payer = player_one, space = 8 + Game::MAXIMUM_SIZE)]
    game: Account<'info, Game>,
    #[account(mut)]
    player_one: Signer<'info>,
    system_program: Program<'info, System>
}