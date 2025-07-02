import React from 'react';
import { useMessages } from '@/hooks/useMessages';
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
  const { messages, clearMessages, refreshMessages, isLoading } = useMessages();

  const handleCopyMessage = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopySignature = async (signature: string) => {
    await navigator.clipboard.writeText(signature);
  };

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
              onClick={refreshMessages}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
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
                key={message.id}
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
                        {message.verificationResult?.isValid ? (
                          <CheckCircle className="w-4 h-4 text-success-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-error-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          message.verificationResult?.isValid 
                            ? 'text-success-700' 
                            : 'text-error-700'
                        }`}>
                          {message.verificationResult?.isValid ? 'Verified' : 'Invalid'}
                        </span>
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
                        <code className="bg-secondary-100 px-2 py-1 rounded text-xs font-mono break-all">
                          {truncateText(message.signature, 30)}
                        </code>
                        <button
                          onClick={() => handleCopySignature(message.signature)}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
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