'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MessageData, VerifySignatureResponse } from '@/types';
import { StorageService } from '@/services/storage';
import { ApiService } from '@/services/api';
import { generateId } from '@/utils/format';
import { useWallet } from '@/hooks/useWallet';

interface MessageContextType {
  messages: MessageData[];
  isLoading: boolean;
  error: string | null;
  signAndVerifyMessage: (message: string, walletAddress: string) => Promise<void>;
  clearMessages: () => void;
  clearMessagesForWallet: (walletAddress: string) => void;
  refreshMessages: () => void;
  getMessagesForWallet: (walletAddress: string) => MessageData[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: React.ReactNode;
}

// Helper function to verify signature using local API route
const verifySignatureLocally = async (message: string, signature: string): Promise<VerifySignatureResponse> => {
  const response = await fetch('/api/verify-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, signature }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
};

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signMessage } = useWallet();

  // Load messages from storage on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Load messages for current user if connected
        const storageService = StorageService.getInstance();
        const storedMessages = await storageService.getMessages('');
        setMessages(storedMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load message history');
      }
    };

    loadMessages();
  }, []);

  // Sign and verify message
  const signAndVerifyMessage = useCallback(async (message: string, walletAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create optimistic message data (do NOT mutate later)
      const tempId = generateId();
      const optimisticMessage: MessageData = {
        messageId: tempId,
        message,
        signature: '', // Will be filled after signing
        timestamp: Date.now(),
        walletAddress,
        status: 'pending',
      };

      // Add to messages immediately (optimistic update)
      setMessages(prev => [optimisticMessage, ...prev]);

      // Get signature from wallet
      console.log('Requesting signature for message:', message);
      const signature = await signMessage(message);
      console.log('Received signature:', signature);
      console.log('Signature length:', signature.length);

      // Verify signature with backend
      console.log('Sending verification request to backend...');
      let verificationResult: VerifySignatureResponse;
      
      try {
        // Try external API first
        verificationResult = await ApiService.verifySignature({
          message,
          signature,
        });
      } catch (apiError) {
        console.log('External API failed, trying local API route:', apiError);
        // Fallback to local API route
        verificationResult = await verifySignatureLocally(message, signature);
      }
      
      console.log('Verification result:', verificationResult);

      // Create new updated message object
      const updatedMessage: MessageData = {
        ...optimisticMessage,
        signature,
        verificationResult,
      };

      // Update messages with verification result (replace by messageId)
      setMessages(prev =>
        prev.map(msg =>
          msg.messageId === tempId ? updatedMessage : msg
        )
      );

      // Save to storage (database with fallback to localStorage)
      const storageService = StorageService.getInstance();
      await storageService.saveMessage(updatedMessage);

    } catch (err: any) {
      console.error('Message signing/verification error:', err);
      setError(err.message || 'Failed to sign and verify message');
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.message !== message));
    } finally {
      setIsLoading(false);
    }
  }, [signMessage]);

  // Clear all messages
  const clearMessages = useCallback(async () => {
    setMessages([]);
    const storageService = StorageService.getInstance();
    await storageService.deleteMessages('');
  }, []);

  // Refresh messages from storage
  const refreshMessages = useCallback(async () => {
    try {
      const storageService = StorageService.getInstance();
      const storedMessages = await storageService.getMessages('');
      setMessages(storedMessages);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh messages:', err);
      setError('Failed to refresh message history');
    }
  }, []);

  // Get messages for specific wallet
  const getMessagesForWallet = useCallback((walletAddress: string): MessageData[] => {
    return messages.filter(msg => 
      msg.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
    );
  }, [messages]);

  // Clear messages for specific wallet
  const clearMessagesForWallet = useCallback(async (walletAddress: string) => {
    setMessages(prev => prev.filter(msg => msg.walletAddress !== walletAddress));
    const storageService = StorageService.getInstance();
    await storageService.deleteMessages(walletAddress);
  }, []);

  const value: MessageContextType = {
    messages,
    isLoading,
    error,
    signAndVerifyMessage,
    clearMessages,
    clearMessagesForWallet,
    refreshMessages,
    getMessagesForWallet,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}; 