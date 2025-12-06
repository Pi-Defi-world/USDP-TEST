import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getBackendUrl } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/stablecoin/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();

    // Log error details for debugging
    if (!response.ok) {
      console.error('Backend redeem error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        body: data,
      });
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Redeem proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redeem tokens',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
