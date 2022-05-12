import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { expect } from "chai";
import { SolTicTacToe } from "../target/types/sol_tic_tac_toe";

async function play(
  program: Program<SolTicTacToe>,
  game,
  player,
  tile,
  expectedTurn,
  expectedGameState,
  expectedBoard
) {
  await program.methods
    .play(tile)
    .accounts({ game: game.publicKey, player: player.publicKey })
    .signers(player instanceof anchor.Wallet ? [] : [player])
    .rpc();

  const gameState = await program.account.game.fetch(game.publicKey);
  expect(gameState.turn).to.equal(expectedTurn);
  expect(gameState.state).to.eql(expectedGameState);
  expect(gameState.board).to.eql(expectedBoard);
}

describe("sol-tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolTicTacToe as Program<SolTicTacToe>;

  it("setup game!", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    let gameState = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players).to.eql([
      playerOne.publicKey,
      playerTwo.publicKey,
    ]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board).to.eql([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  });

  it("player one wins", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    // Player1 on (0, 0).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 0 },
      2,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [null, null, null],
        [null, null, null],
      ]
    );

    // Player2 on (1, 0).
    await play(
      program,
      gameKeypair,
      playerTwo,
      { row: 1, col: 0 },
      3,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    // Player1 on (0, 1).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 1 },
      4,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    // Player2 on (1, 1).
    await play(
      program,
      gameKeypair,
      playerTwo,
      { row: 1, col: 1 },
      5,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );

    // Player1 on (0, 2).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 2 },
      6,
      { won: { winner: playerOne.publicKey } },
      [
        [{ x: {} }, { x: {} }, { x: {} }],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );
  });

  it("tile bounds error", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();
    try {
      // Player1 on (4, 5).
      await play(
        program,
        gameKeypair,
        playerOne,
        { row: 4, col: 5 },
        2,
        { active: {} },
        [
          [{ x: {} }, null, null],
          [null, null, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      const anchorError: AnchorError = err;
      expect(anchorError.error.errorCode.number).to.equal(6002);
      expect(anchorError.error.errorCode.code).to.equal("TileOutOfBounds");
    }
  });

  it("game already over error", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    // Player1 on (0, 0).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 0 },
      2,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [null, null, null],
        [null, null, null],
      ]
    );

    // Player2 on (1, 0).
    await play(
      program,
      gameKeypair,
      playerTwo,
      { row: 1, col: 0 },
      3,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    // Player1 on (0, 1).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 1 },
      4,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    // Player2 on (1, 1).
    await play(
      program,
      gameKeypair,
      playerTwo,
      { row: 1, col: 1 },
      5,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );

    // Player1 on (0, 2).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 2 },
      6,
      { won: { winner: playerOne.publicKey } },
      [
        [{ x: {} }, { x: {} }, { x: {} }],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );

    try {
      // Player2 on (1, 2).
      await play(
        program,
        gameKeypair,
        playerTwo,
        { row: 1, col: 2 },
        7,
        { won: { winner: playerOne.publicKey } },
        [
          [{ x: {} }, { x: {} }, { x: {} }],
          [{ o: {} }, { o: {} }, { o: {} }],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      const anchorError: AnchorError = err;
      expect(anchorError.error.errorCode.number).to.equal(6001);
      expect(anchorError.error.errorCode.code).to.equal("GameAlreadyOver");
    }
  });

  it("tile already set error", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    // Player1 on (0, 0).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 0 },
      2,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [null, null, null],
        [null, null, null],
      ]
    );

    try {
      // Player2 on (0, 0).
      await play(
        program,
        gameKeypair,
        playerTwo,
        { row: 0, col: 0 },
        3,
        { active: {} },
        [
          [{ x: {} }, null, null],
          [{ o: {} }, null, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      const anchorError: AnchorError = err;
      expect(anchorError.error.errorCode.number).to.equal(6003);
      expect(anchorError.error.errorCode.code).to.equal("TileAlreadySet");
    }
  });

  it("not player turn error", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeypair])
      .rpc();

    // Player1 on (0, 0).
    await play(
      program,
      gameKeypair,
      playerOne,
      { row: 0, col: 0 },
      2,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [null, null, null],
        [null, null, null],
      ]
    );

    try {
      // Player1 on (0, 1).
      await play(
        program,
        gameKeypair,
        playerOne,
        { row: 0, col: 1 },
        3,
        { active: {} },
        [
          [{ x: {} }, { x: {} }, null],
          [null, null, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      const anchorError: AnchorError = err;
      expect(anchorError.error.errorCode.number).to.equal(6004);
      expect(anchorError.error.errorCode.code).to.equal("NotPlayerTurn");
    }
  });
});
