# Solana dAPP

Solana programs are stateless. They don't hold data permanently. This is very different from the world of Ethereum smart contracts — which hold state right on the contract.
Solana programs can interact w/ "accounts".
Again, accounts are basically files that programs can read and write to. The word "accounts" is confusing and super shitty. For example, when you create a wallet on Solana — you create an "account". But, your program can also make an "account" that it can write data to. Programs themselves are considered "accounts".
Everything is an account lol. Just remember an account isn't just like your actual wallet — it's a general way for programs to pass data between each other.

You may be asking yourself, "Why did it re-deploy? Why isn't it just talking to the program. already deployed? Also, if we re-deployed wouldn't it have been deployed to a completely different program id?".
So — Solana programs are upgradeable. That means when we re-deploy we're updating the same program id to point to the latest version of the program we deployed. And, what's cool here is the accounts that the programs talk to will stick around — remember, these accounts keep data related to the program.
That means we can upgrade programs while keeping the data piece separate

this is very very different from Ethereum where you can never change a smart contract once it's deployed!

The idl file is actually just a JSON file that has some info about our Solana program like the names of our functions and the parameters they accept. This helps our web app actually know how to interact w/ our deployed program.