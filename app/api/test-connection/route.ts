import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';

/**
 * Test endpoint to diagnose connection issues
 * GET /api/test-connection
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasNextPublicServerUrl: !!process.env.NEXT_PUBLIC_SERVER_URL,
      nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET',
    },
    resolved: {
      backendUrl: null as string | null,
      error: null as string | null,
    },
    connectionTest: {
      attempted: false,
      success: false,
      error: null as string | null,
      status: null as number | null,
    },
  };

  // Step 1: Try to resolve backend URL
  try {
    diagnostics.resolved.backendUrl = getBackendUrl();
  } catch (error) {
    diagnostics.resolved.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      diagnostics,
      message: 'Failed to resolve backend URL. NEXT_PUBLIC_SERVER_URL is required in production.',
    }, { status: 500 });
  }

  // Step 2: Test connection to backend
  try {
    diagnostics.connectionTest.attempted = true;
    const healthUrl = `${diagnostics.resolved.backendUrl}/api/health`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    diagnostics.connectionTest.status = response.status;
    diagnostics.connectionTest.success = response.ok;

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        diagnostics,
        backendResponse: data,
        message: 'Connection successful!',
      });
    } else {
      const errorData = await response.text();
      diagnostics.connectionTest.error = `HTTP ${response.status}: ${errorData}`;
      return NextResponse.json({
        success: false,
        diagnostics,
        message: `Backend returned error: ${response.status}`,
      }, { status: response.status });
    }
  } catch (error) {
    diagnostics.connectionTest.error = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.connectionTest.success = false;
    
    return NextResponse.json({
      success: false,
      diagnostics,
      message: 'Failed to connect to backend. Check backend URL and network connectivity.',
    }, { status: 500 });
  }
}

