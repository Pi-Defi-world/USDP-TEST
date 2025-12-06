import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getBackendUrl } from '@/lib/config/api-config';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/health`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Health proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch health status',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
