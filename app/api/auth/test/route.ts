import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify auth routes are accessible
 * GET /api/auth/test
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    path: '/api/auth/test',
  });
}

