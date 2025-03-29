import { PublicKey } from '@solana/web3.js';

// Mainnet USDC mint
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Native SOL wrapped address (needed for Jupiter)
export const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

// Jupiter API endpoint
export const JUPITER_API_ENDPOINT = 'https://quote-api.jup.ag/v6';

// Default slippage for swaps (in percentage)
export const DEFAULT_SLIPPAGE = 0.5;

// Platform fee (set to 0 for now)
export const PLATFORM_FEE = {
  feeBps: 0,  // 0 basis points = 0%
  feeAccount: null as PublicKey | null
};