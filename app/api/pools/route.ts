import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

// GET /api/pools - Proxy to server
export async function GET(request: NextRequest) {
  try {
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    if (!backendUrl) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('id');
    
    // Proxy to server pools endpoint
    const url = poolId ? `${backendUrl}/pools?id=${poolId}` : `${backendUrl}/pools`;
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Pools proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pools',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// POST /api/pools/create - Proxy to server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to server pool creation endpoint
    const response = await fetch(`${backendUrl}/pools/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Pool creation proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create pool',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// PUT /api/pools/trade - Proxy to server
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to server pool trade endpoint
    const response = await fetch(`${backendUrl}/pools/trade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Pool trade proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute pool trade',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
