import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { MessageData } from '@/types';

// GET /api/messages?walletAddress=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get messages for specific wallet from KV
    const messages = await kv.get<MessageData[]>(`messages:${walletAddress.toLowerCase()}`) || [];

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, walletAddress } = body;

    if (!message || !walletAddress) {
      return NextResponse.json(
        { error: 'Message and wallet address are required' },
        { status: 400 }
      );
    }

    // Get existing messages for this wallet
    const existingMessages = await kv.get<MessageData[]>(`messages:${walletAddress.toLowerCase()}`) || [];
    
    // Add new message to the beginning
    const updatedMessages = [message, ...existingMessages];
    
    // Keep only last 50 messages per wallet
    const limitedMessages = updatedMessages.slice(0, 50);
    
    // Save to KV
    await kv.set(`messages:${walletAddress.toLowerCase()}`, limitedMessages);

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages?walletAddress=0x...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Delete messages for specific wallet
    await kv.del(`messages:${walletAddress.toLowerCase()}`);

    return NextResponse.json({
      success: true,
      message: 'Messages deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    );
  }
} 