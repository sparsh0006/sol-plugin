import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { USDC_MINT } from './constants';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';

/**
 * Get native SOL balance for an address
 */
export const getNativeBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    throw error;
  }
};

/**
 * Get USDC token balance for an address - using parsed accounts
 */
export const getUsdcBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  try {
    console.log("Fetching token accounts for wallet:", publicKey.toString());
    console.log("Looking for USDC mint:", USDC_MINT.toString());
    
    // Get all token accounts using getParsedTokenAccountsByOwner
    const response = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        mint: USDC_MINT
      }
    );
    
    console.log(`Found ${response.value.length} USDC token accounts`);
    
    // If no token accounts are found
    if (response.value.length === 0) {
      console.log("No USDC account found for this wallet");
      return 0;
    }
    
    // Get the token balance from the parsed data
    let highestBalance = 0;
    
    for (const item of response.value) {
      try {
        const parsedInfo = item.account.data.parsed.info;
        const usdcBalance = parsedInfo.tokenAmount.uiAmount;
        console.log(`USDC balance found in account: ${usdcBalance}`);
        
        if (usdcBalance > highestBalance) {
          highestBalance = usdcBalance;
        }
      } catch (err) {
        console.error("Error parsing account data:", err);
      }
    }
    
    return highestBalance;
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Fallback to a different method if the first one fails
    try {
      console.log("Trying alternative method to get USDC balance...");
      
      // Get token accounts using a different approach
      const accounts = await connection.getTokenAccountsByOwner(
        publicKey,
        { mint: USDC_MINT }
      );
      
      let maxBalance = 0;
      
      accounts.value.forEach((e) => {
        const data = AccountLayout.decode(e.account.data);
        // USDC has 6 decimals
        const amount = Number(data.amount) / Math.pow(10, 6);
        console.log("Raw amount:", data.amount.toString(), "Decoded amount:", amount);
        
        if (amount > maxBalance) {
          maxBalance = amount;
        }
      });
      
      return maxBalance;
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError);
      throw error; // Throw the original error
    }
  }
};