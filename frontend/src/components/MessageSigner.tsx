import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useMessageContext } from '@/contexts/MessageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Send, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageSigner: React.FC = () => {
  const { user, isConnected } = useWallet();
  const { signAndVerifyMessage, isLoading, error } = useMessageContext();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected || !user?.walletAddress) {
      return;
    }

    try {
      await signAndVerifyMessage(message.trim(), user.walletAddress);
      setMessage('');
      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to sign message:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="text-center bg-secondary-50">
        <div className="flex flex-col items-center space-y-3">
          <FileText className="w-12 h-12 text-secondary-400" />
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
              Message Signing
            </h3>
            <p className="text-secondary-600">
              Connect your wallet to start signing messages
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card title="Sign Message" subtitle="Enter a message to sign with your wallet">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Message to Sign"
              value={message}
              onChange={setMessage}
              placeholder="Enter your message here..."
              disabled={isLoading}
              error={error || undefined}
              className="min-h-[100px]"
              as="textarea"
              rows={4}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              {message.length} characters
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isLoading || !isConnected}
              size="lg"
              className="min-w-[140px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing...</span>
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Sign Message
                </>
              )}
            </Button>
          </div>

          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">
                Message signed and verified successfully!
              </span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-error-600" />
              <span className="text-sm font-medium text-error-800">
                {error}
              </span>
            </motion.div>
          )}
        </form>
      </Card>
    </motion.div>
  );
};

export default MessageSigner; 