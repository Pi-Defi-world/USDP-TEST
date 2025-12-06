import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

/**
 * POST /api/auth/signin - Proxy Pi authentication to backend
 * This is the main authentication endpoint for Pi users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get backend URL directly from environment variables
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    
    if (!backendUrl) {
      return NextResponse.json({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
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
    
    const targetUrl = `${backendUrl}/api/auth/signin`;
    
    const response = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text().catch(() => 'Unable to read response');
      return NextResponse.json({
        success: false,
        error: `Backend returned invalid JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}`,
        timestamp: new Date().toISOString(),
      }, { status: response.status || 500 });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isConfigError = errorMessage.includes('Backend URL is not configured');
    const isConnectionError = errorMessage.includes('Cannot connect') || 
                             errorMessage.includes('Failed to fetch') ||
                             errorMessage.includes('timed out');
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      ...(isConfigError && { 
        hint: 'Set SERVER_URL or NEXT_PUBLIC_SERVER_URL in Vercel environment variables and redeploy' 
      }),
      ...(isConnectionError && {
        hint: 'Check if backend is accessible and CORS is configured correctly'
      }),
    }, { status: 500 });
  }
}

