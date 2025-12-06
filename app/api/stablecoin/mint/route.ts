import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get backend URL directly from environment variables
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    
    if (!backendUrl) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    const response = await fetchWithTimeout(`${backendUrl}/api/stablecoin/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
      timeout: 30000,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint tokens';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
