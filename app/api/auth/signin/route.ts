import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

/**
 * POST /api/auth/signin - Proxy Pi authentication to backend
 * This is the main authentication endpoint for Pi users
 */
export async function POST(request: NextRequest) {
  // Log that the route was hit
  console.log('[API Route] ========== AUTH/SIGNIN ROUTE HIT ==========');
  console.log('[API Route] Request URL:', request.url);
  console.log('[API Route] Request method:', request.method);
  console.log('[API Route] Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('[API Route] Auth/signin - Request received');
    console.log('[API Route] Auth/signin - Request body keys:', Object.keys(body));
    console.log('[API Route] Auth/signin - Has accessToken:', !!body.accessToken);
    console.log('[API Route] Auth/signin - Has user:', !!body.user);
    
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
    console.log('[API Route] Auth/signin - Full backend URL:', `${backendUrl}/api/auth/signin`);
    console.log('[API Route] Auth/signin - Forwarding request to backend...');
    
    const response = await fetchWithTimeout(`${backendUrl}/api/auth/signin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    console.log('[API Route] Auth/signin - Backend response received');
    console.log('[API Route] Auth/signin - Response status:', response.status);
    console.log('[API Route] Auth/signin - Response ok:', response.ok);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[API Route] Auth/signin - Backend error:', {
        status: response.status,
        error: data.error,
        data: data,
      });
    } else {
      console.log('[API Route] Auth/signin - Backend success:', {
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user,
      });
    }
    
    console.log('[API Route] ========== AUTH/SIGNIN ROUTE COMPLETE ==========');
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] ========== AUTH/SIGNIN ROUTE ERROR ==========');
    console.error('[API Route] Auth/signin - Proxy error:', error);
    console.error('[API Route] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[API Route] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[API Route] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

