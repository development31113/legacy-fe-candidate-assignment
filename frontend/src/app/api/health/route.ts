import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Vercel KV environment variables are available
    const hasVercelKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
    
    if (hasVercelKV) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.ping();
        
        return NextResponse.json({
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            provider: 'vercel',
          },
        });
      } catch (error) {
        console.error('Vercel KV connection failed:', error);
        // Fall through to local response
      }
    }
    
    // Local development fallback
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'local',
        provider: 'local',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
} 