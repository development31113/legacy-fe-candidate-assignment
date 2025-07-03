'use client';

import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import Button from './ui/Button';
import Card from './ui/Card';

export const ApiProviderSelector = () => {
  const [currentProvider, setCurrentProvider] = useState<'vercel' | 'aws'>('vercel');
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    vercel: boolean;
    aws: boolean;
  }>({ vercel: false, aws: false });

  useEffect(() => {
    checkHealthStatus();
  }, []);

  const checkHealthStatus = async () => {
    setIsLoading(true);
    
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_API_URL;
    const awsUrl = process.env.NEXT_PUBLIC_AWS_API_URL;
    
    // Check Vercel API only if URL is configured
    if (vercelUrl) {
      try {
        const response = await fetch(`${vercelUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        setHealthStatus(prev => ({ ...prev, vercel: response.ok }));
      } catch (error) {
        setHealthStatus(prev => ({ ...prev, vercel: false }));
      }
    } else {
      setHealthStatus(prev => ({ ...prev, vercel: false }));
    }

    // Check AWS API only if URL is configured
    if (awsUrl) {
      try {
        const response = await fetch(`${awsUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        setHealthStatus(prev => ({ ...prev, aws: response.ok }));
      } catch (error) {
        setHealthStatus(prev => ({ ...prev, aws: false }));
      }
    } else {
      setHealthStatus(prev => ({ ...prev, aws: false }));
    }

    setIsLoading(false);
  };

  const switchProvider = (provider: 'vercel' | 'aws') => {
    setCurrentProvider(provider);
    // In a real application, you would update the environment variable
    // or use context to manage the API provider
    console.log(`Switched to ${provider} API provider`);
  };

  const storageInfo = StorageService.getInstance().getStorageInfo();

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">API Provider</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Current:</span>
            <span className="text-sm text-gray-600">{storageInfo.apiProvider}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Storage:</span>
            <span className={`text-sm ${storageInfo.useDatabase ? 'text-green-600' : 'text-orange-600'}`}>
              {storageInfo.useDatabase ? 'Database' : 'LocalStorage'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm font-medium">Vercel API</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${healthStatus.vercel ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button
                size="sm"
                variant={currentProvider === 'vercel' ? 'primary' : 'outline'}
                onClick={() => switchProvider('vercel')}
                disabled={!healthStatus.vercel}
              >
                Use
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm font-medium">AWS API</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${healthStatus.aws ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button
                size="sm"
                variant={currentProvider === 'aws' ? 'primary' : 'outline'}
                onClick={() => switchProvider('aws')}
                disabled={!healthStatus.aws}
              >
                Use
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>API URL: {storageInfo.apiUrl || 'Local Development (No external API)'}</p>
          <p>Status: {isLoading ? 'Checking...' : 'Ready'}</p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={checkHealthStatus}
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>
    </Card>
  );
}; 