import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

/**
 * Comprehensive diagnostic endpoint
 * GET /api/test-connection
 * 
 * Tests:
 * 1. Environment variable configuration
 * 2. Backend URL resolution
 * 3. Network connectivity to backend
 * 4. Backend health endpoint response
 */
interface Diagnostics {
  timestamp: string;
  environment: {
    nodeEnv: string | undefined;
    hasServerUrl: boolean;
    serverUrl: string;
    hasNextPublicServerUrl: boolean;
    nextPublicServerUrl: string;
    note: string;
  };
  resolved: {
    backendUrl: string | null;
    error: string | null;
  };
  connectionTest: {
    attempted: boolean;
    success: boolean;
    error: string | null;
    status: number | null;
    responseTime: number | null;
  };
}

export async function GET() {
  const diagnostics: Diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasServerUrl: !!process.env.SERVER_URL,
      serverUrl: process.env.SERVER_URL || 'NOT SET',
      hasNextPublicServerUrl: !!process.env.NEXT_PUBLIC_SERVER_URL,
      nextPublicServerUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET',
      note: 'SERVER_URL works at runtime (no rebuild). NEXT_PUBLIC_SERVER_URL requires rebuild.',
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
      responseTime: null as number | null,
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
      message: 'Failed to resolve backend URL. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL.',
      instructions: [
        '1. Go to Vercel → Project Settings → Environment Variables',
        '2. Add SERVER_URL = https://your-backend-url.com (no trailing slash)',
        '3. Redeploy (SERVER_URL works without rebuild)',
        'OR use NEXT_PUBLIC_SERVER_URL (requires rebuild after setting)',
      ],
    }, { status: 500 });
  }

  // Step 2: Test connection to backend
  try {
    diagnostics.connectionTest.attempted = true;
    const healthUrl = `${diagnostics.resolved.backendUrl}/api/health`;
    
    const startTime = Date.now();
    const response = await fetchWithTimeout(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds for health check
    });
    const responseTime = Date.now() - startTime;

    diagnostics.connectionTest.status = response.status;
    diagnostics.connectionTest.success = response.ok;
    diagnostics.connectionTest.responseTime = responseTime;

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        diagnostics,
        backendResponse: data,
        message: `Connection successful! Response time: ${responseTime}ms`,
      });
    } else {
      const errorData = await response.text().catch(() => 'Could not read error response');
      diagnostics.connectionTest.error = `HTTP ${response.status}: ${errorData.substring(0, 200)}`;
      return NextResponse.json({
        success: false,
        diagnostics,
        message: `Backend returned error: ${response.status}`,
        troubleshooting: [
          'Check backend logs for errors',
          'Verify backend is running and accessible',
          'Check CORS configuration on backend',
        ],
      }, { status: response.status });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.connectionTest.error = errorMessage;
    diagnostics.connectionTest.success = false;
    
    // Provide specific troubleshooting based on error type
    let troubleshooting: string[] = [];
    if (errorMessage.includes('timeout')) {
      troubleshooting = [
        'Request timed out - backend may be slow or unreachable',
        'Check if backend is running',
        'Verify backend URL is correct',
        'Check firewall/network restrictions',
      ];
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      troubleshooting = [
        'Cannot connect to backend - DNS or network issue',
        'Verify backend URL is correct (no typos)',
        'Check if backend is running',
        'Test backend directly: curl ' + diagnostics.resolved.backendUrl + '/api/health',
        'Check firewall/network restrictions between Vercel and backend',
      ];
    } else {
      troubleshooting = [
        'Unexpected connection error',
        'Check Vercel Function Logs for details',
        'Verify backend is accessible from internet',
        'Check backend CORS configuration',
      ];
    }
    
    return NextResponse.json({
      success: false,
      diagnostics,
      message: 'Failed to connect to backend',
      error: errorMessage,
      troubleshooting,
    }, { status: 500 });
  }
}

