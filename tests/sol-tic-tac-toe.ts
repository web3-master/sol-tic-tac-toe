import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolTicTacToe } from "../target/types/sol_tic_tac_toe";

describe("sol-tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolTicTacToe as Program<SolTicTacToe>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
