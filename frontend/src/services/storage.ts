import { MessageData } from '@/types';

const STORAGE_KEYS = {
  MESSAGES: 'web3_messages',
  USER_PREFERENCES: 'web3_user_preferences',
} as const;

export class StorageService {
  /**
   * Save messages to localStorage
   */
  static saveMessages(messages: MessageData[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }

  /**
   * Load messages from localStorage
   */
  static loadMessages(): MessageData[] {
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
   * Add a new message to storage
   */
  static addMessage(message: MessageData): void {
    try {
      const messages = this.loadMessages();
      messages.unshift(message); // Add to beginning
      
      // Keep only last 50 messages
      const limitedMessages = messages.slice(0, 50);
      this.saveMessages(limitedMessages);
    } catch (error) {
      console.error('Failed to add message to storage:', error);
    }
  }

  /**
   * Clear all messages
   */
  static clearMessages(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (error) {
      console.error('Failed to clear messages from localStorage:', error);
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