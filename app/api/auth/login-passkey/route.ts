import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

// POST /api/auth/login-passkey - Proxy to backend server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = request.headers.get('x-session-id') || 'default';
 
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const origin = originHeader || 
                   (refererHeader ? new URL(refererHeader).origin : '') ||
                   (request.url ? new URL(request.url).origin : '') ||
                   '';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    };

    if (origin) {
      headers['origin'] = origin;
      headers['referer'] = refererHeader || origin;
    }
    
    const backendUrl = getBackendUrl();
    console.log('[API Route] Auth/login-passkey - Backend URL:', backendUrl);
    
    const response = await fetchWithTimeout(`${backendUrl}/api/auth/login-passkey`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    console.log('[API Route] Auth/login-passkey - Response status:', response.status);
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Auth/login-passkey - Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// PUT /api/auth/login-passkey - Proxy to backend server
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = request.headers.get('x-session-id') || 'default';
    
    // Forward origin and referer headers so backend can determine RP ID        
    // Extract origin from request headers or derive from request URL
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const origin = originHeader || 
                   (refererHeader ? new URL(refererHeader).origin : '') ||
                   (request.url ? new URL(request.url).origin : '') ||
                   '';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    };
    
    if (origin) {
      headers['origin'] = origin;
      headers['referer'] = refererHeader || origin;
    }
    
    const backendUrl = getBackendUrl();
    console.log('[API Route] Auth/login-passkey (PUT) - Backend URL:', backendUrl);
    
    const response = await fetchWithTimeout(`${backendUrl}/api/auth/login-passkey`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    console.log('[API Route] Auth/login-passkey (PUT) - Response status:', response.status);
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Auth/login-passkey (PUT) - Proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}