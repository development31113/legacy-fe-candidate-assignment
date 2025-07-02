import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatAddress } from '@/utils/format';
import { Wallet, LogOut, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const WalletConnect: React.FC = () => {
  const { user, isConnected, isLoading, error, connect, disconnect } = useWallet();
  const { mfa } = useDynamicContext();

  const handleCopyAddress = async () => {
    if (user?.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      // You could add a toast notification here
    }
  };

  if (isConnected && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                <Wallet className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  Connected Wallet
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-secondary-600 font-mono">
                    {formatAddress(user.walletAddress || '')}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-secondary-400 hover:text-secondary-600 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {mfa?.isEnabled && (
                  <div className="mt-1 text-xs text-blue-600 font-semibold">MFA enabled</div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-success-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                disabled={isLoading}
                className="ml-2"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="text-center bg-gradient-to-r from-secondary-50 to-primary-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-secondary-600 mb-4">
              Sign in with Dynamic.xyz to start signing messages
            </p>
          </div>
          <Button
            onClick={connect}
            disabled={isLoading}
            size="lg"
            className="w-full max-w-xs"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-error-600 mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default WalletConnect; 