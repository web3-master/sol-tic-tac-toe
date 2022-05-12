use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;
use crate::errors::TicTacToeError;

#[account]
pub struct Game {
    players: [Pubkey; 2],
    turn: u8,
    board: [[Option<Sign>; 3]; 3],
    state: GameState,
}

impl Game {
    pub const MAXIMUM_SIZE: usize = (32 * 2) + 1 + ((1 + 1) * 3) * 3 + (32 + 1);

    pub fn start(&mut self, players: [Pubkey; 2]) -> Result<()> {
        require_eq!(self.turn, 0, TicTacToeError::GameAlreadyStarted);
        self.players = players;
        self.turn = 1;
        return Ok(());
    }

    pub fn play(&mut self, tile: &Tile) -> Result<()> {
        // Check game is active state.
        require!(self.is_active(), TicTacToeError::GameAlreadyOver);

        // Write sign to tile.
        match tile {
            tile @ Tile {
                row: 0..=2,
                col: 0..=2
            } => 
                match self.board[tile.row as usize][tile.col as usize] {
                    Some(_) => return Err(TicTacToeError::TileAlreadySet.into()),
                    None => self.board[tile.row as usize][tile.col as usize] = Sign::from_usize(self.current_player_index()),
                }
            ,
            _ => return Err(TicTacToeError::TileOutOfBounds.into()),
        }

        // Update game state.
        self.update_state();

        // Change turn.
        self.turn += 1;

        return Ok(());
    }

    fn is_active(&self) -> bool {
        return self.state == GameState::Active;
    }

    fn current_player_index(&self) -> usize {
        return ((self.turn - 1) % 2) as usize;
    }

    fn update_state(&mut self) {
        // Check if winner is decided.
        for i in 0..=2 {
            if self.is_winning_trio([(i, 0), (i, 1), (i, 2)]) {
                self.state = GameState::Won {
                    winner: self.current_player() 
                };
                return;
            }
            if self.is_winning_trio([(0, i), (1, i), (2, i)]) {
                self.state = GameState::Won {
                    winner: self.current_player()
                };
                return;
            }
        }

        // Check not been won.
        for row in 0..=2 {
            for col in 0..=2 {
                if self.board[row][col].is_none() {
                    return;
                }
            }
        }

        // Tie.
        self.state = GameState::Tie;
    }

    fn is_winning_trio(&self, trio: [(usize, usize); 3]) -> bool {
        let [first, second, third] = trio;
        return self.board[first.0][first.1].is_some() &&
            self.board[first.0][first.1] == self.board[second.0][second.1] &&
            self.board[first.0][first.1] == self.board[third.0][third.1];
    }

    pub fn current_player(&self) -> Pubkey {
        return self.players[self.current_player_index()];
    }
}

#[derive(
    AnchorSerialize, AnchorDeserialize, 
    FromPrimitive, ToPrimitive,
    Copy,
    Clone,
    PartialEq)]
pub enum Sign {
    X, O
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GameState {
    Active,
    Tie,
    Won { winner: Pubkey },
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Tile {
    row: u8,
    col: u8
}