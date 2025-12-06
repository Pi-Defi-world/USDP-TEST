import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    console.log('[API Route] Health check - Backend URL:', backendUrl);
    console.log('[API Route] SERVER_URL:', process.env.SERVER_URL || 'NOT SET');
    console.log('[API Route] NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET');
    
    const healthUrl = `${backendUrl}/api/health`;
    console.log('[API Route] Fetching from:', healthUrl);
    
    const response = await fetchWithTimeout(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('[API Route] Response status:', response.status);
    
    if (!response.ok) {
      console.error('[API Route] Backend returned error:', response.status, response.statusText);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[API Route] Health proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health status';
    console.error('[API Route] Error details:', {
      message: errorMessage,
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    interface DebugInfo {
      serverUrl: string;
      nextPublicServerUrl: string;
      nodeEnv: string | undefined;
      note: string;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      debug: {
        serverUrl: process.env.SERVER_URL || 'NOT SET',
        nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        note: 'Set SERVER_URL (runtime) or NEXT_PUBLIC_SERVER_URL (build-time)',
      } as DebugInfo,
    } as ApiResponse & { debug?: DebugInfo }, { status: 500 });
  }
}
