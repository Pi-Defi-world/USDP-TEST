import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    if (!backendUrl) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    const body = await request.json();
    const response = await fetch(`${backendUrl}/api/balance/bulk-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Bulk balance check proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk check',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
