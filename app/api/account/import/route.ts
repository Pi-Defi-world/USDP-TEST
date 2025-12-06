import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mnemonic, secret } = body;

    if (!mnemonic && !secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either mnemonic or secret is required',
        },
        { status: 400 }
      );
    }

    // Normalize mnemonic to lowercase if provided
    const normalizedBody: { mnemonic?: string; secret?: string } = {};
    if (mnemonic) {
      normalizedBody.mnemonic = mnemonic.trim().toLowerCase();
    }
    if (secret) {
      normalizedBody.secret = secret.trim();
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/account/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedBody),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Account import proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import account',
      },
      { status: 500 }
    );
  }
}




