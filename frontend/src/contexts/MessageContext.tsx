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
  refreshMessages: () => void;
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

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signMessage } = useWallet();

  // Load messages from storage on mount
  useEffect(() => {
    const loadMessages = () => {
      try {
        const storedMessages = StorageService.loadMessages();
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
      // Create message data
      const messageData: MessageData = {
        id: generateId(),
        message,
        signature: '', // Will be filled after signing
        timestamp: Date.now(),
        walletAddress,
      };

      // Add to messages immediately (optimistic update)
      setMessages(prev => [messageData, ...prev]);

      // Get signature from wallet
      const signature = await signMessage(message);
      messageData.signature = signature;

      // Verify signature with backend
      const verificationResult: VerifySignatureResponse = await ApiService.verifySignature({
        message,
        signature,
      });

      // Update message with verification result
      const updatedMessage: MessageData = {
        ...messageData,
        signature,
        verificationResult,
      };

      // Update messages with verification result
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageData.id ? updatedMessage : msg
        )
      );

      // Save to storage
      StorageService.addMessage(updatedMessage);

    } catch (err: any) {
      setError(err.message || 'Failed to sign and verify message');
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.message !== message));
      
      console.error('Message signing/verification error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [signMessage]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    StorageService.clearMessages();
  }, []);

  // Refresh messages from storage
  const refreshMessages = useCallback(() => {
    try {
      const storedMessages = StorageService.loadMessages();
      setMessages(storedMessages);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh messages:', err);
      setError('Failed to refresh message history');
    }
  }, []);

  const value: MessageContextType = {
    messages,
    isLoading,
    error,
    signAndVerifyMessage,
    clearMessages,
    refreshMessages,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}; 