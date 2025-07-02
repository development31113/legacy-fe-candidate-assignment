import axios from 'axios';
import { VerifySignatureRequest, VerifySignatureResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
   * Verify a message signature
   */
  static async verifySignature(data: VerifySignatureRequest): Promise<VerifySignatureResponse> {
    try {
      const response = await apiClient.post('/api/verify-signature', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to verify signature');
    }
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error: any) {
      throw new Error('Backend is not available');
    }
  }
}

export default ApiService; 