/**
 * Fetch helper with timeout and better error handling
 * Prevents hanging requests in serverless environments
 */

interface FetchOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
}

/**
 * Fetch with timeout support
 * Default timeout: 30 seconds
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeout}ms`);
    }
    
    // Enhanced error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new Error(`Cannot connect to ${url}. Check if the backend is running and accessible.`);
      }
      if (error.message.includes('ETIMEDOUT')) {
        throw new Error(`Connection to ${url} timed out. The backend may be slow or unreachable.`);
      }
    }
    
    throw error;
  }
}

