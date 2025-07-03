import request from 'supertest';
import express from 'express';
import { ethers } from 'ethers';
import signatureRoutes from '@/routes/signatureRoutes';

// Create test app
const app = express();
app.use(express.json());
app.use('/api', signatureRoutes);

describe('SignatureController', () => {
  let wallet: any;
  let message: string;
  let signature: string;

  beforeEach(() => {
    wallet = ethers.Wallet.createRandom();
    message = 'Test message for signing';
    signature = wallet.signMessageSync(message);
  });

  describe('POST /api/verify-signature', () => {
    it('should verify a valid signature', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          message,
          signature,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.signer).toBe(wallet.address);
      expect(response.body.data.originalMessage).toBe(message);
      expect(response.body.data.timestamp).toBeDefined();
    });

    it('should reject invalid signature format', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          message,
          signature: 'invalid-signature',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject missing message', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          signature,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject missing signature', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          message,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          message: '',
          signature,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'A'.repeat(10001);
      const response = await request(app)
        .post('/api/verify-signature')
        .send({
          message: longMessage,
          signature,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.responseTime).toBeDefined();
      expect(response.body.data.checks).toBeDefined();
    });
  });

  describe('GET /api/info', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Web3 Message Signer API');
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.description).toBeDefined();
      expect(response.body.data.endpoints).toBeDefined();
      expect(response.body.data.features).toBeDefined();
    });
  });
}); 