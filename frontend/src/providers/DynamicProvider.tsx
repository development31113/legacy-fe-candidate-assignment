'use client';

import React from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

interface DynamicProviderProps {
  children: React.ReactNode;
}

const DynamicProvider: React.FC<DynamicProviderProps> = ({ children }) => {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  if (!environmentId) {
    console.warn('Dynamic.xyz environment ID not found. Please set NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID');
    return <div>Please configure Dynamic.xyz environment ID</div>;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};

export default DynamicProvider; 