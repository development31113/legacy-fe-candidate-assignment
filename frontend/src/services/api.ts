import { Message, VerifySignatureRequest, VerifySignatureResponse } from '../types';

// Определяем тип API провайдера
export type ApiProvider = 'vercel' | 'aws' | 'local';

// Конфигурация API
const API_CONFIG = {
  vercel: {
    baseUrl: process.env.NEXT_PUBLIC_VERCEL_API_URL || '',
    endpoints: {
      verifySignature: '/api/verify-signature',
      messages: '/api/messages',
      health: '/api/health'
    }
  },
  aws: {
    baseUrl: process.env.NEXT_PUBLIC_AWS_API_URL || '',
    endpoints: {
      verifySignature: '/verify-signature',
      messages: '/messages',
      health: '/health'
    }
  }
};

// Получаем активный провайдер из переменных окружения
const getActiveProvider = (): ApiProvider => {
  const provider = process.env.NEXT_PUBLIC_API_PROVIDER as ApiProvider;
  if (provider === 'local') return 'local';
  
  // Check if external APIs are configured
  if (process.env.NEXT_PUBLIC_VERCEL_API_URL) return 'vercel';
  if (process.env.NEXT_PUBLIC_AWS_API_URL) return 'aws';
  
  // Default to local if no external APIs are configured
  return 'local';
};

// Получаем конфигурацию для активного провайдера
const getApiConfig = () => {
  const provider = getActiveProvider();
  if (provider === 'local') {
    throw new Error('External API not configured. Running in local mode.');
  }
  return API_CONFIG[provider];
};

// Проверяем, доступен ли внешний API
const isExternalApiAvailable = () => {
  const provider = getActiveProvider();
  return provider !== 'local';
};

// Базовый URL для API
const getBaseUrl = () => {
  const config = getApiConfig();
  return config.baseUrl;
};

// Полный URL для endpoint
const getEndpointUrl = (endpoint: string) => {
  const config = getApiConfig();
  const baseUrl = getBaseUrl();
  const endpointPath = config.endpoints[endpoint as keyof typeof config.endpoints];
  
  if (!endpointPath) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  return `${baseUrl}${endpointPath}`;
};

// Общие заголовки для всех запросов
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// Обработка ошибок
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export class ApiService {
  // Проверка здоровья API
  static async healthCheck(): Promise<any> {
    if (!isExternalApiAvailable()) {
      throw new Error('External API not available in local mode');
    }
    
    try {
      const response = await fetch(getEndpointUrl('health'), {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Верификация подписи
  static async verifySignature(data: VerifySignatureRequest): Promise<VerifySignatureResponse> {
    if (!isExternalApiAvailable()) {
      throw new Error('External API not available in local mode');
    }
    
    try {
      const response = await fetch(getEndpointUrl('verifySignature'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Signature verification failed:', error);
      throw error;
    }
  }

  // Получение сообщений
  static async getMessages(walletAddress: string): Promise<Message[]> {
    if (!isExternalApiAvailable()) {
      throw new Error('External API not available in local mode');
    }
    
    try {
      const url = `${getEndpointUrl('messages')}?walletAddress=${encodeURIComponent(walletAddress)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result; // Поддержка разных форматов ответа
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  // Сохранение сообщения
  static async saveMessage(message: Omit<Message, 'messageId' | 'timestamp'>): Promise<Message> {
    if (!isExternalApiAvailable()) {
      throw new Error('External API not available in local mode');
    }
    
    try {
      const response = await fetch(getEndpointUrl('messages'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(message),
      });
      const result = await handleResponse(response);
      return result.data || result; // Поддержка разных форматов ответа
    } catch (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  }

  // Удаление сообщений
  static async deleteMessages(walletAddress: string): Promise<void> {
    if (!isExternalApiAvailable()) {
      throw new Error('External API not available in local mode');
    }
    
    try {
      const url = `${getEndpointUrl('messages')}?walletAddress=${encodeURIComponent(walletAddress)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      await handleResponse(response);
    } catch (error) {
      console.error('Failed to delete messages:', error);
      throw error;
    }
  }

  // Получение информации о текущем API провайдере
  static getApiInfo() {
    const provider = getActiveProvider();
    if (provider === 'local') {
      return {
        provider: 'local',
        baseUrl: '',
        endpoints: {}
      };
    }
    
    const config = getApiConfig();
    return {
      provider,
      baseUrl: config.baseUrl,
      endpoints: config.endpoints
    };
  }
} 