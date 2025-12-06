import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '');
    
    if (!backendUrl) {
      return NextResponse.json({
        success: false,
        error: 'Backend URL not configured. Set SERVER_URL or NEXT_PUBLIC_SERVER_URL',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    const response = await fetch(`${backendUrl}/api/account/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text().catch(() => 'Unable to read response');
      return NextResponse.json({
        success: false,
        error: `Invalid response format from server. Status: ${response.status}. Response: ${text.substring(0, 200)}`,
        timestamp: new Date().toISOString(),
      }, { status: response.status || 500 });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text().catch(() => 'Unable to read response');
      return NextResponse.json({
        success: false,
        error: `Invalid JSON response from server. Status: ${response.status}. Response: ${text.substring(0, 200)}`,
        timestamp: new Date().toISOString(),
      }, { status: response.status || 500 });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Generate wallet proxy error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

