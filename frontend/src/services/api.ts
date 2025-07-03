import axios from 'axios';
import { VerifySignatureRequest, VerifySignatureResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export class ApiService {
  /**
   * Verify a message signature (using local API route)
   */
  static async verifySignature(data: VerifySignatureRequest): Promise<VerifySignatureResponse> {
    try {
      console.log('Sending verification request:', {
        message: data.message.substring(0, 50) + '...',
        signatureLength: data.signature.length,
        signaturePrefix: data.signature.substring(0, 20) + '...'
      });
      
      const response = await apiClient.post('/api/verify-signature', data);
      console.log('Verification response:', response.data);
      return response.data.data; // Return data from successful response
    } catch (error: any) {
      console.error('Verification error:', error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error('Failed to verify signature');
    }
  }

  /**
   * Health check endpoint (using local API route)
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get('/api/health');
      return response.data.data;
    } catch (error: any) {
      throw new Error('Database is not available');
    }
  }
}

export default ApiService; 