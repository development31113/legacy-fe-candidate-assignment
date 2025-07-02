import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';

// Mock Dynamic.xyz SDK
jest.mock('@dynamic-labs/sdk-react-core', () => ({
  useDynamicContext: jest.fn(),
}));

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const mockUseDynamicContext = useDynamicContext as jest.MockedFunction<typeof useDynamicContext>;

describe('useWallet Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseDynamicContext.mockReturnValue({
      user: null,
      isInitialized: true,
      handleConnect: jest.fn(),
      handleDisconnect: jest.fn(),
      handleSignMessage: jest.fn(),
      primaryWallet: null,
      isConnecting: false,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful wallet connection', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockPrimaryWallet = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
    };

    const mockHandleConnect = jest.fn().mockResolvedValue(undefined);

    mockUseDynamicContext.mockReturnValue({
      user: mockUser,
      isInitialized: true,
      handleConnect: mockHandleConnect,
      handleDisconnect: jest.fn(),
      handleSignMessage: jest.fn(),
      primaryWallet: mockPrimaryWallet,
      isConnecting: false,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      walletAddress: '0x1234567890123456789012345678901234567890',
      wallets: [{
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        isConnected: true,
      }],
    });
  });

  it('should handle connection error', async () => {
    const mockHandleConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));

    mockUseDynamicContext.mockReturnValue({
      user: null,
      isInitialized: true,
      handleConnect: mockHandleConnect,
      handleDisconnect: jest.fn(),
      handleSignMessage: jest.fn(),
      primaryWallet: null,
      isConnecting: false,
    });

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('Connection failed');
  });

  it('should handle message signing', async () => {
    const mockSignature = '0x1234567890abcdef';
    const message = 'Hello, Web3!';
    const mockHandleSignMessage = jest.fn().mockResolvedValue(mockSignature);

    const mockPrimaryWallet = {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
    };

    mockUseDynamicContext.mockReturnValue({
      user: { id: 'user-123' },
      isInitialized: true,
      handleConnect: jest.fn(),
      handleDisconnect: jest.fn(),
      handleSignMessage: mockHandleSignMessage,
      primaryWallet: mockPrimaryWallet,
      isConnecting: false,
    });

    const { result } = renderHook(() => useWallet());

    const signature = await result.current.signMessage(message);
    expect(signature).toBe(mockSignature);
    expect(mockHandleSignMessage).toHaveBeenCalledWith(message);
  });

  it('should handle signing error when not connected', async () => {
    mockUseDynamicContext.mockReturnValue({
      user: null,
      isInitialized: true,
      handleConnect: jest.fn(),
      handleDisconnect: jest.fn(),
      handleSignMessage: jest.fn(),
      primaryWallet: null,
      isConnecting: false,
    });

    const { result } = renderHook(() => useWallet());

    await expect(result.current.signMessage('test')).rejects.toThrow('Wallet not connected');
  });
}); 