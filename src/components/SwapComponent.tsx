import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { performJupiterSwap } from '../utils/jupiter';
import { USDC_MINT, WSOL_MINT } from '../utils/constants';

const SwapComponent: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  const [amount, setAmount] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('0.5');
  const [isSwapping, setIsSwapping] = useState(false);
  const [txResult, setTxResult] = useState<{ signature: string; success: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Validation for inputs
  const isValidAmount = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  const isValidDestination = !destinationAddress || destinationAddress.trim() === '' || 
    (destinationAddress.length >= 32 && destinationAddress.length <= 44);
  
  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !connected || !isValidAmount) {
      return;
    }
    
    setIsSwapping(true);
    setError(null);
    setTxResult(null);
    
    try {
      // Parse input values
      const amountToSwap = parseFloat(amount);
      const slippageValue = parseFloat(slippage);
      
      // Parse destination address if provided
      let destinationWallet = undefined;
      if (destinationAddress && destinationAddress.trim() !== '') {
        try {
          destinationWallet = new PublicKey(destinationAddress);
        } catch (e) {
          throw new Error('Invalid destination wallet address');
        }
      }
      
      // Perform the swap
      const result = await performJupiterSwap(
        connection,
        {
          walletPublicKey: publicKey,
          fromToken: USDC_MINT,
          toToken: WSOL_MINT, // Use wrapped SOL address for Jupiter
          amount: amountToSwap,
          slippage: slippageValue,
          destinationWallet
        },
        signTransaction
      );
      
      // Update UI with success
      setTxResult({
        signature: result.signature,
        success: true
      });
      
    } catch (err: any) {
      console.error('Swap failed:', err);
      setError(err.message || 'Failed to complete swap');
    } finally {
      setIsSwapping(false);
    }
  };
  
  if (!connected) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Please connect your wallet to swap tokens</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3>Swap USDC to SOL</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="amount" style={{ display: 'block', marginBottom: '4px' }}>
          USDC Amount to Swap
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter USDC amount"
          disabled={isSwapping}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="destination" style={{ display: 'block', marginBottom: '4px' }}>
          Destination Address (Optional)
        </label>
        <input
          id="destination"
          type="text"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          placeholder="Leave empty to send to your wallet"
          disabled={isSwapping}
        />
        {destinationAddress && !isValidDestination && (
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
            Please enter a valid Solana address
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="slippage" style={{ display: 'block', marginBottom: '4px' }}>
          Slippage Tolerance (%)
        </label>
        <input
          id="slippage"
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          placeholder="Default: 0.5%"
          step="0.1"
          min="0.1"
          max="5"
          disabled={isSwapping}
        />
      </div>
      
      <button
        onClick={handleSwap}
        disabled={isSwapping || !isValidAmount || !isValidDestination}
        style={{ width: '100%', padding: '12px' }}
      >
        {isSwapping ? 'Processing...' : 'Swap USDC to SOL'}
      </button>
      
      {error && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fecaca', color: '#b91c1c', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {txResult && txResult.success && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}><strong>Success!</strong> Transaction confirmed.</p>
          <p style={{ margin: '8px 0 0 0', wordBreak: 'break-all' }}>
            Signature: {txResult.signature}
          </p>
          <a 
            href={`https://explorer.solana.com/tx/${txResult.signature}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#166534', textDecoration: 'underline' }}
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
};

export default SwapComponent;