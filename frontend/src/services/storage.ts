import { MessageData } from '@/types';
import { DatabaseService } from './database';

const STORAGE_KEYS = {
  MESSAGES: 'web3_messages',
  USER_PREFERENCES: 'web3_user_preferences',
} as const;

export class StorageService {
  /**
   * Save messages to database or localStorage
   */
  static async saveMessages(messages: MessageData[], walletAddress?: string): Promise<void> {
    try {
      // Try database first if wallet address is provided
      if (walletAddress && await DatabaseService.isAvailable()) {
        // Save each message to database
        for (const message of messages) {
          await DatabaseService.saveMessage(message, walletAddress);
        }
        return;
      }
    } catch (error) {
      console.warn('Database save failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }

  /**
   * Load messages from database or localStorage
   */
  static async loadMessages(walletAddress?: string): Promise<MessageData[]> {
    try {
      // Try database first if wallet address is provided
      if (walletAddress && await DatabaseService.isAvailable()) {
        return await DatabaseService.getMessages(walletAddress);
      }
    } catch (error) {
      console.warn('Database load failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      const parsedMessages = Array.isArray(messages) ? messages : [];
      
      // Filter by wallet address if provided
      if (walletAddress) {
        return parsedMessages.filter(msg => 
          msg.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
        );
      }
      
      return parsedMessages;
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
      return [];
    }
  }

  /**
   * Add a new message to storage
   */
  static async addMessage(message: MessageData, walletAddress?: string): Promise<void> {
    try {
      // Try database first if wallet address is provided
      if (walletAddress && await DatabaseService.isAvailable()) {
        await DatabaseService.saveMessage(message, walletAddress);
        return;
      }
    } catch (error) {
      console.warn('Database add failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const messages = this.loadMessagesSync();
      messages.unshift(message); // Add to beginning
      
      // Keep only last 50 messages
      const limitedMessages = messages.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Failed to add message to localStorage:', error);
    }
  }

  /**
   * Clear all messages
   */
  static async clearMessages(walletAddress?: string): Promise<void> {
    try {
      // Try database first if wallet address is provided
      if (walletAddress && await DatabaseService.isAvailable()) {
        await DatabaseService.clearMessages(walletAddress);
        return;
      }
    } catch (error) {
      console.warn('Database clear failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (error) {
      console.error('Failed to clear messages from localStorage:', error);
    }
  }

  /**
   * Clear messages for specific wallet
   */
  static async clearMessagesForWallet(walletAddress: string): Promise<void> {
    try {
      // Try database first
      if (await DatabaseService.isAvailable()) {
        await DatabaseService.clearMessages(walletAddress);
        return;
      }
    } catch (error) {
      console.warn('Database clear failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const messages = this.loadMessagesSync();
      const filteredMessages = messages.filter(msg => 
        msg.walletAddress?.toLowerCase() !== walletAddress.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filteredMessages));
    } catch (error) {
      console.error('Failed to clear messages for wallet from localStorage:', error);
    }
  }

  /**
   * Synchronous load messages from localStorage (for backward compatibility)
   */
  private static loadMessagesSync(): MessageData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
      return [];
    }
  }

  /**
   * Save user preferences
   */
  static saveUserPreferences(preferences: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  static loadUserPreferences(): Record<string, any> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!stored) return {};
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {};
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number; total: number } {
    try {
      const used = new Blob([JSON.stringify(localStorage)]).size;
      const total = 5 * 1024 * 1024; // 5MB typical limit
      const available = total - used;
      
      return { used, available, total };
    } catch {
      return { used: 0, available: 0, total: 0 };
    }
  }
}

export default StorageService; 