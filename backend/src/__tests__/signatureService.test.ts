import { ethers } from 'ethers';
import SignatureService from '@/services/signatureService';

describe('SignatureService', () => {
  let wallet: any;
  let message: string;
  let signature: string;

  beforeEach(() => {
    // Create a test wallet
    wallet = ethers.Wallet.createRandom();
    message = 'Hello, Web3!';
    
    // Sign the message
    signature = wallet.signMessageSync(message);
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', () => {
      const result = SignatureService.verifySignature({ message, signature });

      expect(result.isValid).toBe(true);
      expect(result.signer).toBe(wallet.address);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid signature format', () => {
      const invalidSignature = 'invalid-signature';
      const result = SignatureService.verifySignature({ message, signature: invalidSignature });

      expect(result.isValid).toBe(false);
      expect(result.signer).toBe('');
      expect(result.error).toBe('Invalid signature format');
    });

    it('should reject empty message', () => {
      const result = SignatureService.verifySignature({ message: '', signature });

      expect(result.isValid).toBe(false);
      expect(result.signer).toBe('');
      expect(result.error).toBe('Message and signature are required');
    });

    it('should reject empty signature', () => {
      const result = SignatureService.verifySignature({ message, signature: '' });

      expect(result.isValid).toBe(false);
      expect(result.signer).toBe('');
      expect(result.error).toBe('Message and signature are required');
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longSignature = wallet.signMessageSync(longMessage);
      const result = SignatureService.verifySignature({ message: longMessage, signature: longSignature });

      expect(result.isValid).toBe(true);
      expect(result.signer).toBe(wallet.address);
    });
  });

  describe('verifySignatureWithPrefix', () => {
    it('should verify signature with Ethereum message prefix', () => {
      const result = SignatureService.verifySignatureWithPrefix({ message, signature });

      expect(result.isValid).toBe(true);
      expect(result.signer).toBe(wallet.address);
      expect(result.error).toBeUndefined();
    });
  });

  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddress = ethers.getAddress('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
      expect(SignatureService.isValidAddress(validAddress)).toBe(true);
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0xinvalid',
        'not-an-address',
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6invalid',
        '',
      ];

      invalidAddresses.forEach(address => {
        expect(SignatureService.isValidAddress(address)).toBe(false);
      });
    });
  });

  describe('isValidSignature', () => {
    it('should validate correct signature format', () => {
      expect(SignatureService.isValidSignature(signature)).toBe(true);
    });

    it('should reject invalid signature formats', () => {
      const invalidSignatures = [
        '0xinvalid',
        'not-a-signature',
        '0x' + 'a'.repeat(63), // Too short
        '0x' + 'a'.repeat(131), // Too long
        '',
      ];

      invalidSignatures.forEach(sig => {
        expect(SignatureService.isValidSignature(sig)).toBe(false);
      });
    });
  });

  describe('getChecksumAddress', () => {
    it('should return checksum address', () => {
      const address = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6';
      const checksumAddress = SignatureService.getChecksumAddress(address);
      expect(checksumAddress).toBe(ethers.getAddress(address));
    });
  });
}); 