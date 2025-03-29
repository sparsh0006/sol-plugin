import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnect: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <WalletMultiButton />
      {connected && (
        <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
            ● Connected
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;