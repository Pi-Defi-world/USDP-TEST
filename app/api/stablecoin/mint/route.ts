import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!SERVER_API_URL) {
      console.error('SERVER_API_URL is not configured');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Server configuration error: NEXT_PUBLIC_SERVER_URL is not set',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const response = await fetch(`${SERVER_API_URL}/api/stablecoin/mint`, {
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
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint tokens',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
