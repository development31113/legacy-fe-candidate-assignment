import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService } from '../utils/dynamodb';
import { SaveMessageRequest, Message } from '../types';
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

    const functionName = process.env.FUNCTION_NAME;

    switch (functionName) {
      case 'getMessages':
        return await handleGetMessages(event);
      case 'saveMessage':
        return await handleSaveMessage(event);
      case 'deleteMessages':
        return await handleDeleteMessages(event);
      default:
        return errorResponse('Unknown function', 400);
    }
  } catch (error) {
    console.error('Error in messages handler:', error);
    return errorResponse('Internal server error', 500);
  }
};

async function handleGetMessages(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const walletAddress = event.queryStringParameters?.walletAddress;

  if (!walletAddress) {
    return errorResponse('Wallet address is required', 400);
  }

  try {
    const messages = await DynamoDBService.getMessages(walletAddress);
    return successResponse(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    return errorResponse('Failed to get messages', 500);
  }
}

async function handleSaveMessage(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const { walletAddress, message, signature, status = 'pending' }: SaveMessageRequest = JSON.parse(event.body);

  if (!walletAddress || !message) {
    return errorResponse('Wallet address and message are required', 400);
  }

  try {
    const messageId = `${walletAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData: Message = {
      messageId,
      walletAddress,
      message,
      signature: signature || '',
      timestamp: Date.now(),
      status
    };

    await DynamoDBService.saveMessage(messageData);
    return successResponse(messageData);
  } catch (error) {
    console.error('Error saving message:', error);
    return errorResponse('Failed to save message', 500);
  }
}

async function handleDeleteMessages(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const walletAddress = event.queryStringParameters?.walletAddress;

  if (!walletAddress) {
    return errorResponse('Wallet address is required', 400);
  }

  try {
    await DynamoDBService.deleteMessages(walletAddress);
    return successResponse({ message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return errorResponse('Failed to delete messages', 500);
  }
} 