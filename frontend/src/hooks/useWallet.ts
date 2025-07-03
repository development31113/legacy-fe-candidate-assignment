import { useState, useCallback } from 'react';
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
    primaryWallet,
    loadingNetwork,
    setShowAuthFlow,
    handleLogOut,
  } = useDynamicContext();

  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setError(null);
    try {
      setShowAuthFlow(true);
    } catch (err: any) {
      setError(err.message || 'Failed to open wallet connect modal');
      console.error('Wallet connection error:', err);
    }
  }, [setShowAuthFlow]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await handleLogOut();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
      console.error('Wallet disconnection error:', err);
    }
  }, [handleLogOut]);

  // Sign message
  const signMessageWallet = useCallback(async (message: string): Promise<string> => {
    if (!primaryWallet) {
      throw new Error('Wallet not connected');
    }
    // 1. Если есть кастомный signMessage (например, у embedded wallet)
    if (primaryWallet.connector && typeof (primaryWallet.connector as any).signMessage === 'function') {
      return await (primaryWallet.connector as any).signMessage(message);
    }
    // 2. Если есть provider.request (EVM wallets)
    if (primaryWallet.connector && (primaryWallet.connector as any).provider && typeof (primaryWallet.connector as any).provider.request === 'function') {
      const address = primaryWallet.address;
      const provider = (primaryWallet.connector as any).provider;
      try {
        // EIP-191 personal_sign
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, address],
        });
        return signature;
      } catch (err: any) {
        console.error('Message signing error:', err);
        throw new Error(err.message || 'Failed to sign message');
      }
    }
    throw new Error('Wallet does not support message signing');
  }, [primaryWallet]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    // Dynamic.xyz автоматически обновляет user state
    // Здесь можно добавить кастомную логику при необходимости
  }, []);

  // Convert Dynamic.xyz user to our format
  const convertedUser: DynamicUser | null = user ? {
    id: user.email || '',
    email: user.email || undefined,
    walletAddress: primaryWallet?.address || undefined,
    wallets: primaryWallet ? [{
      address: primaryWallet.address,
      chainId: (primaryWallet as any).chainId || (primaryWallet as any).chain || 1,
      isConnected: true,
    }] : [],
  } : null;

  return {
    user: convertedUser,
    isConnected: !!user && !!primaryWallet,
    isLoading: loadingNetwork,
    error,
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage: signMessageWallet,
    refreshUser,
  };
} 