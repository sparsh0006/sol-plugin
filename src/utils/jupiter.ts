import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { JUPITER_API_ENDPOINT, USDC_MINT, WSOL_MINT, DEFAULT_SLIPPAGE, PLATFORM_FEE } from './constants';
import Decimal from 'decimal.js';

// Interface for swap parameters
interface SwapParams {
  walletPublicKey: PublicKey;
  fromToken: PublicKey;
  toToken: PublicKey;
  amount: number;
  slippage?: number;
  destinationWallet?: PublicKey;
}

/**
 * Get quote for a swap from Jupiter API
 */
export const getJupiterQuote = async (
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: number,
  slippageBps = DEFAULT_SLIPPAGE * 100
) => {
  try {
    // Convert amount to proper decimal form
    const amountInDecimals = new Decimal(amount).times(1e6).toString(); // USDC has 6 decimals

    const quoteUrl = `${JUPITER_API_ENDPOINT}/quote?inputMint=${inputMint.toString()}&outputMint=${outputMint.toString()}&amount=${amountInDecimals}&slippageBps=${slippageBps}`;
    
    console.log("Fetching quote from URL:", quoteUrl);
    
    const response = await fetch(quoteUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Quote response error:", data);
      throw new Error(`Error fetching quote: ${data.error || 'Unknown error'}`);
    }
    
    console.log("Quote received successfully:", data);
    return data;
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    throw error;
  }
};

/**
 * Perform a swap using Jupiter API
 */
export const performJupiterSwap = async (
  connection: Connection,
  {
    walletPublicKey,
    fromToken,
    toToken,
    amount,
    slippage = DEFAULT_SLIPPAGE,
    destinationWallet
  }: SwapParams,
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
) => {
  try {
    console.log(`Starting swap from ${fromToken.toString()} to ${toToken.toString()}`);
    console.log(`Amount: ${amount}, Slippage: ${slippage}%, Destination: ${destinationWallet?.toString() || 'same as source'}`);
    
    // Get quote from Jupiter API
    const quote = await getJupiterQuote(
      fromToken,
      toToken,
      amount,
      slippage * 100
    );
    
    // Setup platform fee if needed
    const platformFeeOptions = PLATFORM_FEE.feeAccount ? {
      feeBps: PLATFORM_FEE.feeBps.toString(),
      feeAccount: PLATFORM_FEE.feeAccount.toString()
    } : undefined;
    
    // Get serialized transactions from Jupiter API (mainnet)
    const swapUrl = `${JUPITER_API_ENDPOINT}/swap`;
    
    const swapRequestBody = {
      quoteResponse: quote,
      userPublicKey: walletPublicKey.toString(),
      wrapAndUnwrapSol: true, // Add this to handle wrapping/unwrapping SOL
      // If destinationWallet is provided, use it, otherwise default to user's wallet
      destinationWallet: destinationWallet ? destinationWallet.toString() : undefined
    };
    
    if (platformFeeOptions) {
      Object.assign(swapRequestBody, {
        platformFeeBps: platformFeeOptions.feeBps,
        feeAccount: platformFeeOptions.feeAccount
      });
    }
    
    console.log("Swap request body:", JSON.stringify(swapRequestBody));
    
    const swapResponse = await fetch(swapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(swapRequestBody)
    });
    
    const swapData = await swapResponse.json();
    
    if (!swapResponse.ok) {
      console.error("Swap response error:", swapData);
      throw new Error(`Error creating swap transaction: ${swapData.error || 'Unknown error'}`);
    }
    
    console.log("Swap transaction created successfully");
    
    // Parse and sign the transaction
    const { swapTransaction } = swapData;
    
    // Create a Uint8Array from the base64 string
    const transactionBuf = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));
    
    // Determine transaction type and deserialize
    let transaction;
    if (transactionBuf[0] === 0) {
      // This is a legacy transaction
      transaction = Transaction.from(transactionBuf);
      console.log("Legacy transaction detected");
    } else {
      // This is a versioned transaction
      transaction = VersionedTransaction.deserialize(transactionBuf);
      console.log("Versioned transaction detected");
    }
    
    console.log("Transaction deserialized, signing...");
    
    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);
    console.log("Transaction signed successfully");
    
    // For versioned transactions
    if (signedTransaction instanceof VersionedTransaction) {
      // Send and confirm the transaction
      const serializedTx = signedTransaction.serialize();
      const signature = await connection.sendRawTransaction(serializedTx);
      console.log("Transaction sent, signature:", signature);
      
      await connection.confirmTransaction(signature, 'confirmed');
      console.log("Transaction confirmed");
      
      return { signature, destinationTransferred: !!swapRequestBody.destinationWallet };
    } else {
      // Legacy transaction
      const serializedTx = signedTransaction.serialize();
      const signature = await connection.sendRawTransaction(serializedTx);
      console.log("Transaction sent, signature:", signature);
      
      await connection.confirmTransaction(signature, 'confirmed');
      console.log("Transaction confirmed");
      
      return { signature, destinationTransferred: !!swapRequestBody.destinationWallet };
    }
  } catch (error) {
    console.error('Error performing Jupiter swap:', error);
    throw error;
  }
};