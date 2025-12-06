import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';

// POST /api/auth/verify-passphrase - Proxy to backend server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/auth/verify-passphrase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Verify passphrase proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

