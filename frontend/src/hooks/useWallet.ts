import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicUser, WalletInfo } from '@/types';

interface UseWalletReturn {
  user: DynamicUser | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  refreshUser: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const { 
    user, 
    isInitialized, 
    handleConnect, 
    handleDisconnect, 
    handleSignMessage,
    primaryWallet,
    isConnecting 
  } = useDynamicContext();

  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isInitialized) {
      setError('Dynamic.xyz is not initialized');
      return;
    }

    setError(null);

    try {
      await handleConnect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    }
  }, [isInitialized, handleConnect]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!isInitialized) return;

    try {
      await handleDisconnect();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
      console.error('Wallet disconnection error:', err);
    }
  }, [isInitialized, handleDisconnect]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!isInitialized || !primaryWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await handleSignMessage(message);
      return signature;
    } catch (err: any) {
      console.error('Message signing error:', err);
      throw new Error(err.message || 'Failed to sign message');
    }
  }, [isInitialized, primaryWallet, handleSignMessage]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    // Dynamic.xyz automatically handles user state
    // This is just a placeholder for any custom refresh logic
  }, []);

  // Convert Dynamic.xyz user to our format
  const convertedUser: DynamicUser | null = user ? {
    id: user.id || '',
    email: user.email || undefined,
    walletAddress: primaryWallet?.address || undefined,
    wallets: primaryWallet ? [{
      address: primaryWallet.address,
      chainId: primaryWallet.chainId || 1,
      isConnected: true,
    }] : [],
  } : null;

  return {
    user: convertedUser,
    isConnected: !!user && !!primaryWallet,
    isLoading: isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
    refreshUser,
  };
} 