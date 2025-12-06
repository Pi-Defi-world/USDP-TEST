import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = getBackendUrl();
    console.log('[API Route] Mint - Backend URL:', backendUrl);
    console.log('[API Route] SERVER_URL:', process.env.SERVER_URL || 'NOT SET');
    console.log('[API Route] NEXT_PUBLIC_SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL || 'NOT SET');
    
    const mintUrl = `${backendUrl}/api/stablecoin/mint`;
    console.log('[API Route] Fetching from:', mintUrl);
    
    const response = await fetchWithTimeout(mintUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
      timeout: 30000, // 30 seconds
    });
    
    const data = await response.json();

    // Log error details for debugging
    if (!response.ok) {
      console.error('Backend mint error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        body: data,
      });
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Mint proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint tokens';
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json<ApiResponse>({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
