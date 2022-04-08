import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { SimpleSolanaProgram } from '../target/types/simple_solana_program';
import { expect, assert } from 'chai';

describe('mySolanaProgram', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SimpleSolanaProgram as Program<SimpleSolanaProgram>;
  it('setup tweet platform!', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = program.provider.wallet;
    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [tweetKeypair]
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');
  });

  it('Write a tweet', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = program.provider.wallet;
    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [tweetKeypair]
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');

    await program.rpc.writeTweet('Hello World!', user.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);

    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('Hello World!');
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());
  });

  it('should like tweet up no more than 5 times', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = program.provider.wallet;
    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [tweetKeypair]
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');

    await program.rpc.writeTweet('Hello World!', user.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('Hello World!');
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());

    await program.rpc.likeTweet(user.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(1);
    expect(tweet.peopleWhoLiked[0].toString()).to.equal(user.publicKey.toString());

    const secondUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(secondUser.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(2);
    expect(tweet.peopleWhoLiked[1].toString()).to.equal(secondUser.publicKey.toString());


    const thirdUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(thirdUser.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(3);
    expect(tweet.peopleWhoLiked[2].toString()).to.equal(thirdUser.publicKey.toString());



    const fourthUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(fourthUser.publicKey, {
      accounts: {
        tweet: tweetKeypair.publicKey,
      },
      signers: []
    });

    tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(4);
    expect(tweet.peopleWhoLiked[3].toString()).to.equal(fourthUser.publicKey.toString());
  });

  it('should not allow writting an empty message', async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();
    const user = program.provider.wallet;
    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [tweetKeypair]
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal('');

    try {
      await program.rpc.writeTweet('', user.publicKey, {
        accounts: {
          tweet: tweetKeypair.publicKey,
        },
        signers: []
      });
    } catch (e) {
      expect(e.error.errorMessage).to.equal("Message cannot be empty");
    }
  });
});