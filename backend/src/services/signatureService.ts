import { ethers } from 'ethers';
import { SignatureVerificationResult, VerifySignatureRequest } from '@/types';
import logger from '@/utils/logger';

export class SignatureService {
  /**
   * Verify an Ethereum message signature
   */
  static verifySignature(data: VerifySignatureRequest): SignatureVerificationResult {
    try {
      const { message, signature } = data;

      // Validate input
      if (!message || !signature) {
        return {
          isValid: false,
          signer: '',
          error: 'Message and signature are required',
        };
      }

      // Validate signature format
      if (!ethers.isHexString(signature, 65)) {
        return {
          isValid: false,
          signer: '',
          error: 'Invalid signature format',
        };
      }

      // Recover the signer address
      let recoveredAddress: string;
      try {
        // Try to recover using the message as-is
        recoveredAddress = ethers.verifyMessage(message, signature);
      } catch (error) {
        logger.error('Failed to verify message signature', { error, message, signature });
        return {
          isValid: false,
          signer: '',
          error: 'Failed to verify signature',
        };
      }

      // Validate recovered address
      if (!ethers.isAddress(recoveredAddress)) {
        return {
          isValid: false,
          signer: '',
          error: 'Invalid recovered address',
        };
      }

      logger.info('Signature verified successfully', {
        message: message.substring(0, 50) + '...',
        signer: recoveredAddress,
      });

      return {
        isValid: true,
        signer: recoveredAddress,
      };
    } catch (error) {
      logger.error('Error in signature verification', { error, data });
      return {
        isValid: false,
        signer: '',
        error: 'Internal verification error',
      };
    }
  }

  /**
   * Verify signature with custom message format
   */
  static verifySignatureWithPrefix(data: VerifySignatureRequest): SignatureVerificationResult {
    try {
      const { message, signature } = data;

      // Add Ethereum message prefix
      const prefixedMessage = ethers.toUtf8Bytes(
        `\x19Ethereum Signed Message:\n${message.length}${message}`
      );

      // Create message hash
      const messageHash = ethers.keccak256(prefixedMessage);

      // Recover signer from signature
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      if (!ethers.isAddress(recoveredAddress)) {
        return {
          isValid: false,
          signer: '',
          error: 'Invalid recovered address',
        };
      }

      logger.info('Signature verified with prefix', {
        message: message.substring(0, 50) + '...',
        signer: recoveredAddress,
      });

      return {
        isValid: true,
        signer: recoveredAddress,
      };
    } catch (error) {
      logger.error('Error in signature verification with prefix', { error, data });
      return {
        isValid: false,
        signer: '',
        error: 'Internal verification error',
      };
    }
  }

  /**
   * Validate Ethereum address format
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Validate signature format
   */
  static isValidSignature(signature: string): boolean {
    return ethers.isHexString(signature, 65);
  }

  /**
   * Get checksum address
   */
  static getChecksumAddress(address: string): string {
    return ethers.getAddress(address);
  }
}

export default SignatureService; 