/**
 * Centralized API configuration
 * Ensures consistent backend URL resolution across the application
 */

/**
 * Get the backend server URL
 * Supports both build-time (NEXT_PUBLIC_SERVER_URL) and runtime (SERVER_URL) variables
 * NEXT_PUBLIC_* variables are embedded at build time, SERVER_URL works at runtime
 */
export function getBackendUrl(): string {
  // Try runtime variable first (works without rebuild)
  const runtimeUrl = process.env.SERVER_URL;
  if (runtimeUrl) {
    return runtimeUrl.replace(/\/$/, '');
  }

  // Try build-time variable (requires rebuild after setting)
  const buildTimeUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (buildTimeUrl) {
    return buildTimeUrl.replace(/\/$/, '');
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
    'Backend URL is not configured. Please set either:\n' +
    '  - SERVER_URL (runtime, no rebuild needed) OR\n' +
    '  - NEXT_PUBLIC_SERVER_URL (build-time, requires rebuild)\n' +
    'Set it to your backend server URL (e.g., https://api.yourdomain.com).\n' +
    'In Vercel: Project Settings → Environment Variables → Add variable → Redeploy'
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

