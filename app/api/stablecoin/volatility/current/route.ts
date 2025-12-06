import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

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
    
    const token = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${backendUrl}/api/stablecoin/volatility/current`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Volatility current proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch current volatility',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

