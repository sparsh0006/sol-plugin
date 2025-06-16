# Solana Jupiter Swap

A lightweight React application for swapping USDC to SOL on Solana blockchain using Jupiter Aggregator.

## Features

- Connect with Phantom wallet
- View real-time SOL and USDC balances
- Swap USDC to SOL with Jupiter's optimized routing
- Send swapped tokens to custom destination addresses
- Adjust slippage tolerance
- View transaction confirmations with explorer links

## Tech Stack

- React + TypeScript
- Solana Web3.js + Wallet Adapter
- Jupiter API v6

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Usage

1. **Connect Wallet**: Click "Select Wallet" and choose Phantom
2. **Check Balances**: View your SOL and USDC balances in the dashboard
3. **Swap Tokens**:
   - Enter USDC amount
   - (Optional) Set destination address
   - Adjust slippage if needed
   - Click "Swap USDC to SOL"
   - Approve transaction in wallet

## Configuration

The app connects to Solana mainnet. Key settings in `/src/utils/constants.ts`:
- Token addresses (USDC, WSOL)
- Jupiter API endpoint
- Default slippage (0.5%)

## Security Notes

- Always verify transaction details before approving
- App doesn't store private keys or seed phrases
- All blockchain interactions require explicit approval

##LICENSE

This project is under MIT license
