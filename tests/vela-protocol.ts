import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

describe("vela-protocol", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Is initialized!", async () => {
    console.log("Initialized");
  });
});
