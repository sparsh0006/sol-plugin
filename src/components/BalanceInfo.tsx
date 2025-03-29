import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getNativeBalance, getUsdcBalance } from '../utils/wallet';

const BalanceInfo: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBalances = async () => {
    if (!publicKey || !connected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching SOL balance...");
      // 1. Get Native SOL Balance
      const solBal = await getNativeBalance(connection, publicKey);
      console.log("SOL balance received:", solBal);
      setSolBalance(solBal);
      
      console.log("Fetching USDC balance...");
      // 2. Get USDC Balance
      const usdcBal = await getUsdcBalance(connection, publicKey);
      console.log("USDC balance received:", usdcBal);
      setUsdcBalance(usdcBal);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances. See console for details.');
      setSolBalance(null);
      setUsdcBalance(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (connected && publicKey) {
      console.log("Wallet connected, fetching balances...");
      fetchBalances();
    } else {
      setSolBalance(null);
      setUsdcBalance(null);
    }
  }, [connected, publicKey]);
  
  if (!connected) {
    return null;
  }
  
  return (
    <div className="balance-info">
      <h3 style={{ marginTop: 0 }}>Your Balances</h3>
      {loading ? (
        <p>Loading balances...</p>
      ) : error ? (
        <div style={{ color: '#ef4444' }}>
          <p>{error}</p>
          <p>Try reconnecting your wallet or refreshing the page.</p>
        </div>
      ) : (
        <div>
          <p>
            <strong>SOL:</strong> {solBalance !== null ? solBalance.toFixed(6) : 'N/A'} SOL
          </p>
          <p>
            <strong>USDC:</strong> {usdcBalance !== null ? usdcBalance.toFixed(2) : 'N/A'} USDC
          </p>
        </div>
      )}
      <button onClick={fetchBalances} disabled={loading} style={{ marginTop: '8px' }}>
        {loading ? 'Refreshing...' : 'Refresh Balances'}
      </button>
    </div>
  );
};

export default BalanceInfo;