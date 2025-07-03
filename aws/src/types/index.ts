export interface Message {
  messageId: string;
  walletAddress: string;
  message: string;
  signature: string;
  timestamp: number;
  status: 'pending' | 'signed' | 'verified' | 'rejected';
  ttl?: number;
}

export interface VerifySignatureRequest {
  message: string;
  signature: string;
  address: string;
}

export interface VerifySignatureResponse {
  success: boolean;
  isValid: boolean;
  recoveredAddress?: string;
  error?: string;
}

export interface SaveMessageRequest {
  walletAddress: string;
  message: string;
  signature?: string;
  status?: 'pending' | 'signed' | 'verified' | 'rejected';
}

export interface ApiResponse<T = any> {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': boolean;
  };
  body: string;
}

export interface DynamoDBItem {
  walletAddress: string;
  messageId: string;
  message: string;
  signature?: string;
  timestamp: number;
  status: string;
  ttl?: number;
} 