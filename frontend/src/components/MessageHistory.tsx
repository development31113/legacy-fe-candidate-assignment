import React, { useState, useEffect } from 'react';
import { useMessageContext } from '@/contexts/MessageContext';
import { useWallet } from '@/hooks/useWallet';
import { MessageData } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatAddress, formatRelativeTime, truncateText } from '@/utils/format';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Trash2, 
  RefreshCw,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageHistory: React.FC = () => {
  const { getMessagesForWallet, clearMessagesForWallet, refreshMessages, isLoading } = useMessageContext();
  const { user, isConnected } = useWallet();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load messages for current wallet
  useEffect(() => {
    const loadWalletMessages = async () => {
      if (!isConnected || !user?.walletAddress) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const walletMessages = getMessagesForWallet(user.walletAddress);
        setMessages(walletMessages);
      } catch (error) {
        console.error('Failed to load wallet messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadWalletMessages();
  }, [isConnected, user?.walletAddress, getMessagesForWallet]);

  const handleCopyMessage = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopySignature = async (signature: string) => {
    await navigator.clipboard.writeText(signature);
  };

  const handleClearMessages = async () => {
    if (user?.walletAddress) {
      await clearMessagesForWallet(user.walletAddress);
      setMessages([]);
    }
  };

  const handleRefreshMessages = async () => {
    if (user?.walletAddress) {
      setIsLoadingMessages(true);
      try {
        await refreshMessages();
        const walletMessages = getMessagesForWallet(user.walletAddress);
        setMessages(walletMessages);
      } catch (error) {
        console.error('Failed to refresh messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    }
  };

  if (!isConnected) {
    return (
      <Card className="text-center bg-secondary-50">
        <div className="flex flex-col items-center space-y-3 py-8">
          <History className="w-12 h-12 text-secondary-400" />
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
              Message History
            </h3>
            <p className="text-secondary-600">
              Connect your wallet to view your message history
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="text-center bg-secondary-50">
        <div className="flex flex-col items-center space-y-3 py-8">
          <History className="w-12 h-12 text-secondary-400" />
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
              No Messages Yet
            </h3>
            <p className="text-secondary-600">
              Sign your first message to see it here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Message History" 
      subtitle={`${messages.length} signed message${messages.length !== 1 ? 's' : ''}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-secondary-500" />
            <span className="text-sm text-secondary-600">
              Recent messages
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMessages}
              disabled={isLoadingMessages}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMessages}
              className="text-error-600 hover:text-error-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.messageId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="border border-secondary-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
              >
                <div className="space-y-3">
                  {/* Message Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {!message.signature ? (
                          <>
                            <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium text-secondary-700">
                              Pending
                            </span>
                          </>
                        ) : message.verificationResult?.isValid ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-success-600" />
                            <span className="text-sm font-medium text-success-700">
                              Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-error-600" />
                            <span className="text-sm font-medium text-error-700">
                              Invalid
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-secondary-500">
                      {formatRelativeTime(message.timestamp)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <p className="text-sm text-secondary-900 break-words">
                      {truncateText(message.message, 200)}
                    </p>
                    <button
                      onClick={() => handleCopyMessage(message.message)}
                      className="mt-2 text-xs text-secondary-500 hover:text-secondary-700 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy message</span>
                    </button>
                  </div>

                  {/* Signature and Wallet Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-secondary-600">
                        <span className="font-medium">Signature:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!message.signature ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 border border-secondary-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-secondary-500">Pending...</span>
                          </div>
                        ) : (
                          <>
                            <code className="bg-secondary-100 px-2 py-1 rounded text-xs font-mono break-all">
                              {truncateText(message.signature, 30)}
                            </code>
                            <button
                              onClick={() => handleCopySignature(message.signature)}
                              className="text-secondary-500 hover:text-secondary-700"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-secondary-600">
                        <User className="w-3 h-3" />
                        <span className="font-medium">Signer:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-secondary-100 px-2 py-1 rounded text-xs font-mono">
                          {formatAddress(message.walletAddress)}
                        </code>
                        <button
                          onClick={() => handleCopyMessage(message.walletAddress)}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verification Details */}
                  {message.verificationResult && (
                    <div className="pt-2 border-t border-secondary-200">
                      <div className="text-xs text-secondary-600">
                        <span className="font-medium">Verified by:</span>{' '}
                        {formatAddress(message.verificationResult.signer)}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

export default MessageHistory; 