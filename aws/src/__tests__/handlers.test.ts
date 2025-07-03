import { handler as verifySignatureHandler } from '../handlers/verifySignature';
import { handler as messagesHandler } from '../handlers/messages';
import { handler as healthHandler } from '../handlers/health';
import { ethers } from 'ethers';

// Mock DynamoDB
jest.mock('../utils/dynamodb', () => ({
  DynamoDBService: {
    saveMessage: jest.fn(),
    getMessages: jest.fn(),
    deleteMessages: jest.fn(),
  }
}));

describe('AWS Lambda Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySignature handler', () => {
    it('should verify a valid signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Hello, Web3!';
      const signature = await wallet.signMessage(message);

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          message,
          signature,
          address: wallet.address
        })
      };

      const result = await verifySignatureHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.isValid).toBe(true);
      expect(body.data.recoveredAddress).toBe(wallet.address.toLowerCase());
    });

    it('should reject an invalid signature', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          message: 'Hello, Web3!',
          signature: 'invalid-signature',
          address: '0x1234567890123456789012345678901234567890'
        })
      };

      const result = await verifySignatureHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.isValid).toBe(false);
    });

    it('should handle missing body', async () => {
      const event = {
        httpMethod: 'POST'
      };

      const result = await verifySignatureHandler(event as any);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Request body is required');
    });

    it('should handle CORS preflight', async () => {
      const event = {
        httpMethod: 'OPTIONS'
      };

      const result = await verifySignatureHandler(event as any);

      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('messages handler', () => {
    beforeEach(() => {
      process.env.FUNCTION_NAME = 'getMessages';
    });

    it('should get messages for a wallet', async () => {
      const mockMessages = [
        {
          messageId: 'test-1',
          walletAddress: '0x123',
          message: 'Test message',
          signature: 'test-sig',
          timestamp: Date.now(),
          status: 'signed'
        }
      ];

      const { DynamoDBService } = require('../utils/dynamodb');
      DynamoDBService.getMessages.mockResolvedValue(mockMessages);

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          walletAddress: '0x123'
        }
      };

      const result = await messagesHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockMessages);
    });

    it('should save a message', async () => {
      process.env.FUNCTION_NAME = 'saveMessage';

      const messageData = {
        walletAddress: '0x123',
        message: 'Test message',
        signature: 'test-sig',
        status: 'pending'
      };

      const { DynamoDBService } = require('../utils/dynamodb');
      DynamoDBService.saveMessage.mockResolvedValue(undefined);

      const event = {
        httpMethod: 'POST',
        body: JSON.stringify(messageData)
      };

      const result = await messagesHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.walletAddress).toBe('0x123');
      expect(body.data.message).toBe('Test message');
    });

    it('should delete messages for a wallet', async () => {
      process.env.FUNCTION_NAME = 'deleteMessages';

      const { DynamoDBService } = require('../utils/dynamodb');
      DynamoDBService.deleteMessages.mockResolvedValue(undefined);

      const event = {
        httpMethod: 'DELETE',
        queryStringParameters: {
          walletAddress: '0x123'
        }
      };

      const result = await messagesHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Messages deleted successfully');
    });

    it('should handle missing wallet address for GET', async () => {
      process.env.FUNCTION_NAME = 'getMessages';

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {}
      };

      const result = await messagesHandler(event as any);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Wallet address is required');
    });
  });

  describe('health handler', () => {
    it('should return health status', async () => {
      const event = {
        httpMethod: 'GET'
      };

      const result = await healthHandler(event as any);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('healthy');
      expect(body.data.timestamp).toBeDefined();
    });

    it('should handle CORS preflight', async () => {
      const event = {
        httpMethod: 'OPTIONS'
      };

      const result = await healthHandler(event as any);

      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });
}); 