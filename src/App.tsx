import React from 'react';
import WalletConnect from './components/WalletConnect';
import BalanceInfo from './components/BalanceInfo';
import SwapComponent from './components/SwapComponent';
import { useWallet } from '@solana/wallet-adapter-react';

const App: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center' }}>Solana USDC to SOL Swap</h1>
      <p style={{ textAlign: 'center', marginBottom: '24px' }}>
        Swap USDC to SOL on Solana mainnet using Jupiter API
      </p>
      
      <WalletConnect />
      
      {connected && (
        <>
          <BalanceInfo />
          <SwapComponent />
        </>
      )}
      
      <div style={{ marginTop: '32px', fontSize: '0.8rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>This app operates on Solana mainnet</p>
      </div>
    </div>
  );
};

export default App;