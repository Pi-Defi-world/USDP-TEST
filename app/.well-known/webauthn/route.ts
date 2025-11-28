import { NextRequest, NextResponse } from 'next/server';

/**
 * WebAuthn RP ID validation endpoint
 * This endpoint is required by WebAuthn specification to validate the relying party ID
 * It must be accessible at: https://<rp-id>/.well-known/webauthn
 */
export async function GET(request: NextRequest) {
  // Get the frontend URL from environment or derive from request
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      process.env.NEXT_PUBLIC_VERCEL_URL ? 
                        `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
                      (request.url ? new URL(request.url).origin : '');

  // Return trusted origins for WebAuthn validation
  const trustedOrigins = [
    frontendUrl,
    'https://zyra-stable-coin-v3-frontend.onrender.com',
    'https://sandbox.minepi.com',
    'https://minepi.com',
  ].filter(Boolean);

  return NextResponse.json({
    trustedOrigins,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
