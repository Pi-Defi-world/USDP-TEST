import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
 
export async function GET() {
  try {
    const config = {
      hasServerUrl: !!process.env.SERVER_URL,
      serverUrl: process.env.SERVER_URL || 'NOT SET',
      hasNextPublicServerUrl: !!process.env.NEXT_PUBLIC_SERVER_URL,
      nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET',
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      resolvedBackendUrl: null as string | null,
    };

    try {
      config.resolvedBackendUrl = getBackendUrl();
    } catch (error) {
      config.resolvedBackendUrl = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: (config.hasServerUrl || config.hasNextPublicServerUrl)
        ? 'Configuration looks good. Use /api/test-connection to test backend connectivity.'
        : 'WARNING: SERVER_URL or NEXT_PUBLIC_SERVER_URL is not set. This will cause API routes to fail in production.',
      note: 'For connection testing, visit /api/test-connection',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

