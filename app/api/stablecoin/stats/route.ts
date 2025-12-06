import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { fetchWithTimeout } from '@/lib/api/fetch-with-timeout';

export async function GET() {
  try {
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    
    if (!backendUrl) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    const response = await fetchWithTimeout(`${backendUrl}/api/health/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    const data = await response.json();
    
    // Add testnet flag to response if successful
    if (data.success && data.data) {
      const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
      data.data.isTestnet = isTestnet;
    }
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Stats proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
