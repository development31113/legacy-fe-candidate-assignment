import { NextRequest, NextResponse } from 'next/server';
import { MessageData } from '@/types';

// Local storage fallback for development
const localStorage = new Map<string, MessageData[]>();

// Helper function to get KV instance
async function getKV() {
  // Check if Vercel KV environment variables are available
  const hasVercelKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  
  if (hasVercelKV) {
    try {
      const { kv } = await import('@vercel/kv');
      return kv;
    } catch (error) {
      console.error('Vercel KV import failed:', error);
      return null;
    }
  }
  
  return null;
}

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

    const kv = await getKV();
    let messages: MessageData[] = [];

    if (kv) {
      // Use Vercel KV
      messages = await kv.get<MessageData[]>(`messages:${walletAddress.toLowerCase()}`) || [];
    } else {
      // Use local fallback
      messages = localStorage.get(`messages:${walletAddress.toLowerCase()}`) || [];
    }

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

    const kv = await getKV();
    let existingMessages: MessageData[] = [];

    if (kv) {
      // Use Vercel KV
      existingMessages = await kv.get<MessageData[]>(`messages:${walletAddress.toLowerCase()}`) || [];
    } else {
      // Use local fallback
      existingMessages = localStorage.get(`messages:${walletAddress.toLowerCase()}`) || [];
    }
    
    // Add new message to the beginning
    const updatedMessages = [message, ...existingMessages];
    
    // Keep only last 50 messages per wallet
    const limitedMessages = updatedMessages.slice(0, 50);
    
    if (kv) {
      // Save to KV
      await kv.set(`messages:${walletAddress.toLowerCase()}`, limitedMessages);
    } else {
      // Save to local fallback
      localStorage.set(`messages:${walletAddress.toLowerCase()}`, limitedMessages);
    }

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

    const kv = await getKV();

    if (kv) {
      // Delete from KV
      await kv.del(`messages:${walletAddress.toLowerCase()}`);
    } else {
      // Delete from local fallback
      localStorage.delete(`messages:${walletAddress.toLowerCase()}`);
    }

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