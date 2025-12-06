import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';

// POST /api/auth/login-passkey - Proxy to backend server
export async function POST(request: NextRequest) {
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
    const response = await fetch(`${backendUrl}/api/auth/login-passkey`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
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
    const response = await fetch(`${backendUrl}/api/auth/login-passkey`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login verification proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}