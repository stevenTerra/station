# Terra Station

![Banner](Banner.png)

**Terra Station** is a web application to interact with [Terra Core](https://github.com/terra-money/core).

Terra Station allows users to:

- Dashboard: An overview of Terra’s key macroeconomic metrics
- Wallet: Coins and Tokens (IBC, CW20) holdings in the connected wallet
- History: A list of transaction history executed by the connected wallet
- NFT: View and transfer NFT from a custom list of NFT collections
- Send: Token transfer to another Terra wallet
- Swap: Atomically swap currencies on the Terra network at the effective exchange rate.
- Validators: List and information of active validators on Terra
- Staking: Delegate and undelegate LUNA to and from a list of active validators
- Withdraw rewards: Receive rewards generated from staking to validator(s)
- Gov: Browse, read, submit, deposit LUNA to and vote on proposals
- Contract: Upload and instantiate new contracts and query from and execute messages to existing contracts
- Earn: Deposit and withdraw UST from Anchor Earn

## Running Terra Station

This guide explains how you can set up Terra Station repositories for local development.
This project was bootstrapped with [Create React App](https://create-react-app.dev/).

```
git clone https://github.com/terra-money/station.git
cd station
npm i
npm run start
```

Runs the app in the development mode.
Terra Station should now be running locally at https://localhost:3000.
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

> :warning: For Windows user, you need to change the `SASS_PATH` inside your `.env` file.
> The value must be `SASS_PATH=./node_modules;./src/styles`
