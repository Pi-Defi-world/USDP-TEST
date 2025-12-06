import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function GET(request: NextRequest) {
  try {
    // Forward authorization header from client
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Authorization header required',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }

    // Forward origin and referer headers for proper WebAuthn RP ID detection
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    const origin = originHeader ||
                   (refererHeader ? new URL(refererHeader).origin : '') ||
                   (request.url ? new URL(request.url).origin : '') ||
                   '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    if (origin) {
      headers['origin'] = origin;
      headers['referer'] = refererHeader || origin;
    }
    
    const backendUrl = getBackendUrl();
    
    const response = await fetchWithTimeout(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers,
      timeout: 30000,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

