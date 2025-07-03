import { MessageData } from '@/types';
import { DatabaseService } from './database';
import { ApiService } from './api';

const STORAGE_KEYS = {
  MESSAGES: 'web3_messages',
  USER_PREFERENCES: 'web3_user_preferences',
} as const;

export class StorageService {
  private static instance: StorageService;
  private useDatabase: boolean;

  private constructor() {
    // Определяем, использовать ли базу данных или localStorage
    this.useDatabase = !!(process.env.NEXT_PUBLIC_VERCEL_API_URL || process.env.NEXT_PUBLIC_AWS_API_URL);
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

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

  // Получение сообщений
  async getMessages(walletAddress: string): Promise<MessageData[]> {
    if (this.useDatabase) {
      try {
        return await ApiService.getMessages(walletAddress);
      } catch (error) {
        console.warn('Database unavailable, falling back to localStorage:', error);
        return this.getMessagesFromLocalStorage(walletAddress);
      }
    } else {
      return this.getMessagesFromLocalStorage(walletAddress);
    }
  }

  // Сохранение сообщения
  async saveMessage(message: Omit<MessageData, 'messageId' | 'timestamp'>): Promise<MessageData> {
    const messageData: MessageData = {
      ...message,
      messageId: `${message.walletAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    if (this.useDatabase) {
      try {
        return await ApiService.saveMessage(messageData);
      } catch (error) {
        console.warn('Database unavailable, falling back to localStorage:', error);
        this.saveMessageToLocalStorage(messageData);
        return messageData;
      }
    } else {
      this.saveMessageToLocalStorage(messageData);
      return messageData;
    }
  }

  // Удаление сообщений
  async deleteMessages(walletAddress: string): Promise<void> {
    if (this.useDatabase) {
      try {
        await ApiService.deleteMessages(walletAddress);
      } catch (error) {
        console.warn('Database unavailable, falling back to localStorage:', error);
        this.deleteMessagesFromLocalStorage(walletAddress);
      }
    } else {
      this.deleteMessagesFromLocalStorage(walletAddress);
    }
  }

  // Обновление статуса сообщения
  async updateMessageStatus(messageId: string, status: MessageData['status']): Promise<void> {
    if (this.useDatabase) {
      // Для AWS/Vercel API нужно пересохранить сообщение
      const messages = await this.getMessages('');
      const message = messages.find(m => m.messageId === messageId);
      if (message) {
        message.status = status;
        await ApiService.saveMessage(message);
      }
    } else {
      this.updateMessageStatusInLocalStorage(messageId, status);
    }
  }

  // Проверка доступности базы данных
  async isDatabaseAvailable(): Promise<boolean> {
    if (!this.useDatabase) return false;
    
    try {
      await ApiService.healthCheck();
      return true;
    } catch (error) {
      console.warn('Database health check failed:', error);
      return false;
    }
  }

  // Получение информации о хранилище
  getStorageInfo() {
    return {
      useDatabase: this.useDatabase,
      apiProvider: ApiService.getApiInfo().provider,
      apiUrl: ApiService.getApiInfo().baseUrl
    };
  }

  // ===== LocalStorage методы (fallback) =====

  private getMessagesFromLocalStorage(walletAddress: string): MessageData[] {
    try {
      const key = `messages_${walletAddress}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private saveMessageToLocalStorage(message: MessageData): void {
    try {
      const key = `messages_${message.walletAddress}`;
      const messages = this.getMessagesFromLocalStorage(message.walletAddress);
      messages.unshift(message); // Добавляем в начало
      
      // Ограничиваем количество сообщений (последние 100)
      const limitedMessages = messages.slice(0, 100);
      
      localStorage.setItem(key, JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private deleteMessagesFromLocalStorage(walletAddress: string): void {
    try {
      const key = `messages_${walletAddress}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  private updateMessageStatusInLocalStorage(messageId: string, status: MessageData['status']): void {
    try {
      // Находим сообщение во всех хранилищах
      const keys = Object.keys(localStorage).filter(key => key.startsWith('messages_'));
      
      for (const key of keys) {
        const messages: MessageData[] = JSON.parse(localStorage.getItem(key) || '[]');
        const messageIndex = messages.findIndex(m => m.messageId === messageId);
        
        if (messageIndex !== -1) {
          messages[messageIndex].status = status;
          localStorage.setItem(key, JSON.stringify(messages));
          break;
        }
      }
    } catch (error) {
      console.error('Error updating message status in localStorage:', error);
    }
  }
}

export default StorageService; 