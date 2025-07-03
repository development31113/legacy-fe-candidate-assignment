// Wallet and Authentication Types
export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
}

export interface DynamicUser {
  id: string;
  email?: string;
  walletAddress?: string;
  wallets: WalletInfo[];
}

// Message and Signature Types
export interface MessageData {
  id: string;
  message: string;
  signature: string;
  timestamp: number;
  walletAddress: string;
  verificationResult?: VerifySignatureResponse;
}

export interface SignatureRequest {
  message: string;
}

export interface SignatureResponse {
  message: string;
  signature: string;
  walletAddress: string;
}

// API Types
export interface VerifySignatureRequest {
  message: string;
  signature: string;
}

export interface VerifySignatureResponse {
  isValid: boolean;
  signer: string;
  originalMessage: string;
}

// UI State Types
export interface AppState {
  isConnected: boolean;
  user: DynamicUser | null;
  messages: MessageData[];
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'password' | 'email';
  as?: 'input' | 'textarea';
  rows?: number;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// Service Types
export interface ApiService {
  verifySignature: (data: VerifySignatureRequest) => Promise<VerifySignatureResponse>;
}

export interface WalletService {
  connect: () => Promise<DynamicUser>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  getUser: () => Promise<DynamicUser | null>;
} 