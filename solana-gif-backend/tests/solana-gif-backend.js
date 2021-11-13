const anchor = require('@project-serum/anchor');

const { SystemProgram } = anchor.web3; // Need the system program, will talk about this soon.

const main = async () => {
  console.log('Starting test...');
  const provider = anchor.Provider.env(); // gets this data from solana config get
  anchor.setProvider(provider); // Create and set the provider. We set it before but we needed to update it, so that it can communicate with our frontend!
  const program = anchor.workspace.SolanaGifBackend; // given to us by Anchor that will automatically compile our code in lib.rs and get it deployed locally on a local validator.
  // Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate(); // we are doing this because we need to create some credentials for the BaseAccount we're creating.
  // Call start_stuff_off, pass it the params it needs!
  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  }); // call our function we made by doing program.rpc.startStuffOff() and we await it which will wait for our local validator to "mine" the instruction.
  console.log('Your transaction signature', tx);
  // Fetch data from the account.
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString()); // Here we actually retrieve the account we created and then access totalGifs

  await program.rpc.addGif(
    'https://c.tenor.com/tk1XbNj4Y_wAAAAd/squid-game.gif',
    {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    }
  );
  // Get the account again to see what changed.
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString());

  // Access gif_list on the account!
  console.log('👀 GIF List', account.gifList);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
