import { MessageData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000';

export class DatabaseService {
  /**
   * Get messages for a specific wallet from database
   */
  static async getMessages(walletAddress: string): Promise<MessageData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages?walletAddress=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Database getMessages error:', error);
      throw error;
    }
  }

  /**
   * Save a message to database
   */
  static async saveMessage(message: MessageData, walletAddress: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          walletAddress,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Database saveMessage error:', error);
      throw error;
    }
  }

  /**
   * Clear messages for a specific wallet from database
   */
  static async clearMessages(walletAddress: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages?walletAddress=${walletAddress}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear messages: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Database clearMessages error:', error);
      throw error;
    }
  }

  /**
   * Check if database is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default DatabaseService; 