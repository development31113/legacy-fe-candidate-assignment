import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Message, DynamoDBItem } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'web3-message-signer-api-messages-dev';

export class DynamoDBService {
  static async saveMessage(message: Message): Promise<void> {
    const item: DynamoDBItem = {
      walletAddress: message.walletAddress,
      messageId: message.messageId,
      message: message.message,
      signature: message.signature,
      timestamp: message.timestamp,
      status: message.status,
      ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));
  }

  static async getMessages(walletAddress: string): Promise<Message[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'walletAddress = :walletAddress',
      ExpressionAttributeValues: {
        ':walletAddress': walletAddress
      },
      ScanIndexForward: false // Sort by timestamp descending
    }));

    return (result.Items || []).map(item => ({
      messageId: item.messageId,
      walletAddress: item.walletAddress,
      message: item.message,
      signature: item.signature || '',
      timestamp: item.timestamp,
      status: item.status as Message['status']
    }));
  }

  static async deleteMessages(walletAddress: string): Promise<void> {
    // First get all messages for the wallet
    const messages = await this.getMessages(walletAddress);
    
    // Delete each message
    const deletePromises = messages.map(message => 
      docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          walletAddress: message.walletAddress,
          messageId: message.messageId
        }
      }))
    );

    await Promise.all(deletePromises);
  }

  static async getAllMessages(): Promise<Message[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    return (result.Items || []).map(item => ({
      messageId: item.messageId,
      walletAddress: item.walletAddress,
      message: item.message,
      signature: item.signature || '',
      timestamp: item.timestamp,
      status: item.status as Message['status']
    }));
  }
} 