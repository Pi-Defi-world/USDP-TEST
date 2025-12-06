import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { testBackendConnection } from '@/lib/config/debug-api';

/**
 * Debug endpoint to check API configuration
 * GET /api/debug - Returns configuration and connection status
 */
export async function GET() {
  try {
    const config = {
      hasServerUrl: !!process.env.NEXT_PUBLIC_SERVER_URL,
      serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET',
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      resolvedBackendUrl: null as string | null,
      connectionTest: null as { success: boolean; error?: string; status?: number } | null,
    };

    try {
      config.resolvedBackendUrl = getBackendUrl();
      
      // Test connection if we have a backend URL
      if (config.resolvedBackendUrl && config.resolvedBackendUrl !== '/api') {
        config.connectionTest = await testBackendConnection(config.resolvedBackendUrl);
      }
    } catch (error) {
      config.resolvedBackendUrl = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: config.hasServerUrl 
        ? 'Configuration looks good. Check connectionTest for backend connectivity.'
        : 'WARNING: NEXT_PUBLIC_SERVER_URL is not set. This will cause API routes to fail in production.',
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

