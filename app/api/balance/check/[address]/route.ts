import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    if (!backendUrl) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    const { address } = await params;
    
    if (!address) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing address parameter',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    const response = await fetch(`${backendUrl}/api/balance/check/${address}`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Balance check proxy error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check balance',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
