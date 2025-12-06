import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

/**
 * POST /api/auth/signin - Proxy Pi authentication to backend
 * This is the main authentication endpoint for Pi users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward origin and referer headers for proper WebAuthn RP ID detection
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const origin = originHeader ||
                   (refererHeader ? new URL(refererHeader).origin : '') ||
                   (request.url ? new URL(request.url).origin : '') ||
                   '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (origin) {
      headers['origin'] = origin;
      headers['referer'] = refererHeader || origin;
    }

    // Forward session ID if present
    const sessionId = request.headers.get('x-session-id');
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
    
    const backendUrl = getBackendUrl();
    console.log('[API Route] Auth/signin - Backend URL:', backendUrl);
    console.log('[API Route] Auth/signin - Request body keys:', Object.keys(body));
    
    const response = await fetchWithTimeout(`${backendUrl}/api/auth/signin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    console.log('[API Route] Auth/signin - Response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[API Route] Auth/signin - Backend error:', {
        status: response.status,
        error: data.error,
      });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Auth/signin - Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

