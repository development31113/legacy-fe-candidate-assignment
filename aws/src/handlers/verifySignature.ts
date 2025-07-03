import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ethers } from 'ethers';
import { VerifySignatureRequest, VerifySignatureResponse } from '../types';
import { successResponse, errorResponse } from '../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: ''
      };
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const { message, signature, address }: VerifySignatureRequest = JSON.parse(event.body);

    if (!message || !signature || !address) {
      return errorResponse('Message, signature, and address are required', 400);
    }

    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Check if the recovered address matches the provided address
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

      const response: VerifySignatureResponse = {
        success: true,
        isValid,
        recoveredAddress: recoveredAddress.toLowerCase()
      };

      return successResponse(response);
    } catch (error) {
      const response: VerifySignatureResponse = {
        success: false,
        isValid: false,
        error: 'Invalid signature format'
      };

      return successResponse(response);
    }
  } catch (error) {
    console.error('Error in verifySignature handler:', error);
    return errorResponse('Internal server error', 500);
  }
}; 