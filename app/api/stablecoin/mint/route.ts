import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getBackendUrl } from '@/lib/config/api-config';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = getBackendUrl();
    
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
