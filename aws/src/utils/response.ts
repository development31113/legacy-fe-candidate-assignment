import { ApiResponse } from '../types';

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): ApiResponse => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  return {
    statusCode,
    headers: { ...defaultHeaders, ...headers },
    body: JSON.stringify(body)
  };
};

export const successResponse = (data: any): ApiResponse => {
  return createResponse(200, { success: true, data });
};

export const errorResponse = (message: string, statusCode: number = 400): ApiResponse => {
  return createResponse(statusCode, { success: false, error: message });
};

export const corsResponse = (): ApiResponse => {
  return createResponse(200, { message: 'OK' });
}; 