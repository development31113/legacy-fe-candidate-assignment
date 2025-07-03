import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { VerifySignatureRequest, VerifySignatureResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature }: VerifySignatureRequest = body;

    // Validate input
    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Message and signature are required' },
        { status: 400 }
      );
    }

    // Validate signature format
    if (!ethers.isHexString(signature, 65)) {
      return NextResponse.json(
        { error: 'Invalid signature format' },
        { status: 400 }
      );
    }

    // Recover the signer address
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch (error) {
      console.error('Failed to verify message signature:', error);
      return NextResponse.json(
        { error: 'Failed to verify signature' },
        { status: 400 }
      );
    }

    // Validate recovered address
    if (!ethers.isAddress(recoveredAddress)) {
      return NextResponse.json(
        { error: 'Invalid recovered address' },
        { status: 400 }
      );
    }

    const response: VerifySignatureResponse = {
      isValid: true,
      signer: recoveredAddress,
      originalMessage: message,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in signature verification:', error);
    return NextResponse.json(
      { error: 'Internal verification error' },
      { status: 500 }
    );
  }
} 