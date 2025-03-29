import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Commitment } from '@solana/web3.js';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
const network = WalletAdapterNetwork.Mainnet;

// Use RPC Pool which combines multiple providers
const endpoint = 'https://mainnet.helius-rpc.com/?api-key=db5f1cff-000b-4138-8211-92f09b51f0cc';

// Add connection config for better reliability
const connectionConfig = {
  commitment: 'confirmed' as Commitment,
  disableRetryOnRateLimit: false,
  confirmTransactionInitialTimeout: 60000
};

// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
// Only the wallets you configure here will be compiled into your application, and only the dependencies
// of wallets that your users connect to will be loaded.
const wallets = [
  new PhantomWalletAdapter(),
];

root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);