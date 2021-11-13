import twitterLogo from './assets/twitter-logo.svg';
import loader from './assets/loader.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Provider, Program, web3 } from '@project-serum/anchor';
import idl from './idl.json';
import kp from './keypair.json';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3; // SystemProgram is the a reference to the core program that runs Solana we already talked about. Keypair.generate() gives us some parameters we need to create the BaseAccount account that will hold the GIF data for our program.

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);
// console.log({programID});
// idl.metadata.address to get our program's id and then we specify that we want to make sure we connect to devnet by doing clusterApiUrl('devnet')
// Set our network to devent.
const network = clusterApiUrl('devnet');

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: 'processed', // This preflightCommitment: "processed" thing is interesting. You can read on it a little here. Basically, we can actually choose when to receive a confirmation for when our transaction has succeeded. Because the blockchain is fully decentralized, we can choose how long we want to wait for a transaction. Do we want to wait for just one node to acknowledge our transaction? Do we want to wait for the whole Solana chain to acknowledge our transaction?
  // In this case, we simply wait for our transaction to be confirmed by the node we're connected to. This is generally okay — but if you wanna be super super sure you may use something like "finalized" instead. For now, let's roll with "processed".
};
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_PERSONAL_HANDLE = 'saudev001';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log({ response });
          console.log(
            'Connected with public key: ',
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const signInWithWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with public key: ', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const connectWalletButton = () => {
    return (
      <button
        className="cta-button connect-wallet-button"
        onClick={signInWithWallet}
      >
        Sign In with Wallet
      </button>
    );
  };

  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletConnected();
      console.log('Done');
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
  }, [walletAddress]);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      // console.log({program})
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log('Got the account', account);
      setGifList(account.gifList);
    } catch (error) {
      console.log('Error in getGifs: ', error);
      setGifList(null);
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No gif link given!');
      return;
    }
    console.log('Gif link: ', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log('GIF successfully sent to program', inputValue);
      await getGifList();
    } catch (error) {
      console.log('Error sending GIF:', error);
    }
  };

  const renderGifs = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }
    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button className="cta-button submit-gif-button" type={'submit'}>
            Submit
          </button>
        </form>
        <div className="gif-grid">
          {gifList.map((gif) => (
            <div className="gif-item" key={gif}>
              <img src={gif.gifLink} alt={gif} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // if (isLoading) {
  //   return (
  //     <div className="App">
  //       <div className="container" style={{ alignItems: 'center' }}>
  //         <img alt="Page Loading" className="twitter-logo" src={loader} />
  //       </div>
  //     </div>
  //   );
  // }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log('ping');
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        'Created a new BaseAccount w/ address:',
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log('Error creating BaseAccount account:', error);
    }
  };

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && connectWalletButton()}
          {walletAddress && renderGifs()}
        </div>
        <div className="footer-container">
          <p className="footer-item">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >
              {`built on @${TWITTER_HANDLE}`} November 6th Cohort
            </a>
          </p>
          <p className="footer-item">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{` by @${TWITTER_PERSONAL_HANDLE}`}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
