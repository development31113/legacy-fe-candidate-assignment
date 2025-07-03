'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import MessageSigner from '@/components/MessageSigner';
import MessageHistory from '@/components/MessageHistory';
import { MessageProvider } from '@/contexts/MessageContext';
import { Shield, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-white shadow-sm border-b border-secondary-200">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  Web3 Message Signer
                </h1>
                <p className="text-sm text-secondary-600">
                  Sign and verify messages with your wallet
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-secondary-600">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Powered by Dynamic.xyz</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
              Secure Message Signing with Web3
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Connect your wallet, sign custom messages, and verify signatures on the blockchain. 
              Built with Dynamic.xyz for seamless Web3 authentication.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Secure Authentication
              </h3>
              <p className="text-secondary-600">
                Connect securely with Dynamic.xyz embedded wallet
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-4">
                <Zap className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Message Signing
              </h3>
              <p className="text-secondary-600">
                Sign any message with your private key
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mx-auto mb-4">
                <Clock className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Signature History
              </h3>
              <p className="text-secondary-600">
                View and manage your signed messages
              </p>
            </div>
          </motion.div>

          {/* Main Application */}
          <MessageProvider>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Wallet & Signing */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <WalletConnect />
                <MessageSigner />
              </motion.div>

              {/* Right Column - History */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <MessageHistory />
              </motion.div>
            </div>
          </MessageProvider>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-8 border-t border-secondary-200"
          >
            <p className="text-secondary-600">
              Built with Next.js, React 18+, TypeScript, and Dynamic.xyz
            </p>
            <p className="text-sm text-secondary-500 mt-2">
              Secure • Fast • Reliable
            </p>
          </motion.footer>
        </div>
      </main>
    </div>
  );
} 