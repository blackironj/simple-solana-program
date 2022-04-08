const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("simple-solana-program", () => {
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  let _myAccount = null;

  it("Creates and initializes an account in a single atomic transaction (simplified)", async () => {
    // #region code-simplified
    // The program to execute.
    const program = anchor.workspace.SimpleSolanaProgram;

    // The Account to create.
    const myAccount = anchor.web3.Keypair.generate();

    // Create the new account and initialize it with the program.
    // #region code-simplified
    await program.rpc.initialize({
      accounts: {
        myAccount: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [myAccount],
    });
    // #endregion code-simplified

    // Fetch the newly created account from the cluster.
    const account = await program.account.myAccount.fetch(myAccount.publicKey);

    // Check it's state was initialized.
    assert.equal(account.data, 0);

    // Store the account for the next test.
    _myAccount = myAccount;
  });

  it("Updates a previously created account", async () => {
    const myAccount = _myAccount;

    // #region update-test

    // The program to execute.
    const program = anchor.workspace.SimpleSolanaProgram;

    // Invoke the update rpc.
    await program.rpc.update(new anchor.BN(100), {
      accounts: {
        myAccount: myAccount.publicKey,
      },
    });

    // Fetch the newly updated account.
    const account = await program.account.myAccount.fetch(myAccount.publicKey);

    // Check it's state was mutated.
    assert.equal(account.data, 100);

    // #endregion update-test
  });


  it("Increment", async () => {
    const myAccount = _myAccount;

    // #region update-test

    // The program to execute.
    const program = anchor.workspace.SimpleSolanaProgram;

    // Invoke the update rpc.
    await program.rpc.increment({
      accounts: {
        myAccount: myAccount.publicKey,
      },
    });

    // Fetch the newly updated account.
    const account = await program.account.myAccount.fetch(myAccount.publicKey);

    // Check it's state was mutated.
    assert.equal(account.data, 101);

    // #endregion update-test
  });


  it("Decrement", async () => {
    const myAccount = _myAccount;

    // #region update-test

    // The program to execute.
    const program = anchor.workspace.SimpleSolanaProgram;

    // Invoke the update rpc.
    await program.rpc.decrement({
      accounts: {
        myAccount: myAccount.publicKey,
      },
    });

    // Fetch the newly updated account.
    const account = await program.account.myAccount.fetch(myAccount.publicKey);

    // Check it's state was mutated.
    assert.equal(account.data, 100);

    // #endregion update-test
  });
});
