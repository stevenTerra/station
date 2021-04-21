# Terra Station

![Banner](Banner.png)

**Terra Station** is a web application to interact with [Terra Core](https://github.com/terra-money/core).

Terra Station allows users to:

- Send tokens
- Get involved with staking, with looking through validator information and delegating Luna tokens
- A dashboard monitoring key Terra macroeconomic variables
- Atomically swap currencies on the Terra network at the effective on-chain exchange rate.

## Running Terra Station

This guide explains how you can set up Terra Station repositories for local development.

### Build Terra Station

```sh
git clone https://github.com/terra-money/station.git
cd station
npm i
npm run start
```

> :warning: For Windows user, you need to change the `SASS_PATH` inside your `.env` file.
> The value must be `SASS_PATH=./node_modules;./src/styles`

Terra Station should now be running locally at https://localhost:3000.

## Available Scripts

This project was bootstrapped with [Create React App](https://create-react-app.dev/).

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.<br>
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.
