/**
 * Centralized API configuration
 * Ensures consistent backend URL resolution across the application
 */

/**
 * Get the backend server URL
 * In production, this MUST be set via NEXT_PUBLIC_SERVER_URL
 * Falls back to /api for Next.js API routes (development)
 */
export function getBackendUrl(): string {
  // In production, NEXT_PUBLIC_SERVER_URL must be set
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  
  if (serverUrl) {
    // Remove trailing slash if present
    return serverUrl.replace(/\/$/, '');
  }

  // For client-side requests, use relative /api path (Next.js API routes)
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // Server-side fallback (should not happen in production)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }

  // Production server-side: fail if not configured
  throw new Error(
    'NEXT_PUBLIC_SERVER_URL environment variable is required in production. ' +
    'Please set it to your backend server URL (e.g., https://api.yourdomain.com). ' +
    'This variable should be set in your deployment platform (Vercel, etc.) environment settings.'
  );
}

/**
 * Get the API base URL for client-side requests
 * Uses Next.js API routes by default, or direct backend URL if configured
 */
export function getApiBaseUrl(): string {
  // If NEXT_PUBLIC_API_URL is set, use it (for direct backend access)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Default to Next.js API routes (which proxy to backend)
  return '/api';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return (
      process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('testnet')
    );
  }
  return process.env.NODE_ENV === 'development';
}

/**
 * Get a user-friendly error message for connection issues
 */
export function getConnectionErrorMessage(): string {
  if (isDevelopment()) {
    return 'Cannot connect to backend server. Please ensure the backend server is running.';
  }
  return 'Unable to connect to the server. Please try again later or contact support if the problem persists.';
}

