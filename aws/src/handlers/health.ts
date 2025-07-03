import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/response';

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

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.STAGE || 'dev',
      function: process.env.FUNCTION_NAME || 'healthCheck',
      region: process.env.AWS_REGION || 'unknown'
    };

    return successResponse(healthData);
  } catch (error) {
    console.error('Error in health check handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      })
    };
  }
}; 