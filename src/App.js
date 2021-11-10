import twitterLogo from './assets/twitter-logo.svg'
import loader from './assets/loader.svg'
import './App.css'
import { useEffect, useState } from 'react'

// Constants
const TWITTER_HANDLE = '_buildspace'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp',
]

const App = () => {
	const [walletAddress, setWalletAddress] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [inputValue, setInputValue] = useState('')
	const [gifList, setGifList] = useState([])
	
	const checkIfWalletConnected = async () => {
		try {
			const { solana } = window
			if (solana) {
				if (solana.isPhantom) {
					console.log('Phantom wallet found!')
					const response = await solana.connect({ onlyIfTrusted: true })
					console.log({ response })
					console.log(
						'Connected with public key: ',
						response.publicKey.toString()
					)
					setWalletAddress(response.publicKey.toString())
				}
			} else {
				alert('Solana object not found! Get a Phantom wallet 👻')
			}
		} catch (error) {
			console.error(error)
		}
	}
	
	const signInWithWallet = async () => {
		const { solana } = window
		if (solana) {
			const response = await solana.connect()
			console.log('Connected with public key: ', response.publicKey.toString())
			setWalletAddress(response.publicKey.toString())
		}
	}
	
	const connectWalletButton = () => {
		return (
			<button
				className="cta-button connect-wallet-button"
				onClick={signInWithWallet}
			>
				Sign In with Wallet
			</button>
		)
	}
	
	useEffect(() => {
		window.addEventListener('load', async (event) => {
			await checkIfWalletConnected()
			console.log('Done')
			setIsLoading(false)
		})
	}, [])
	
	useEffect(() => {
		if(walletAddress) {
			console.log("Fetching GIF list...")
			setGifList(TEST_GIFS);
		}
	}, [walletAddress])
	
	const onInputChange = (event) => {
		const { value } = event.target
		setInputValue(value)
	}
	
	const sendGif = async () => {
		if (inputValue.length > 0) {
			console.log('Gif link:', inputValue)
		} else {
			console.log('Empty input. Try again.')
		}
	}
	
	const renderGifs = () => {
		return (
			<div className="connected-container">
				<form onSubmit={event => {
					event.preventDefault()
					sendGif()
				}}>
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
							<img src={gif} alt={gif}/>
						</div>
					))}
				</div>
			</div>
		)
	}
	
	// if (isLoading) {
	//   return (
	//     <div className="App">
	//       <div className="container" style={{ alignItems: 'center' }}>
	//         <img alt="Page Loading" className="twitter-logo" src={loader} />
	//       </div>
	//     </div>
	//   );
	// }
	
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
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo}/>
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	)
}

export default App
