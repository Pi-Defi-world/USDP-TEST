import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// DELETE /api/auth/passkeys/[credentialId] - Proxy to backend server
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    const { credentialId } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - No token provided',
        timestamp: new Date().toISOString(),
      }, { status: 401 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/auth/passkeys/${credentialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Delete passkey proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

