import { ApiResponse, AuthResponseData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private sessionId: string | null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.sessionId = null;
  }

  private getSessionId(): string {
    const storageKey = 'pi_session_id';

    if (typeof window === 'undefined') {
      if (!this.sessionId) {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      }
      return this.sessionId;
    }

    const storedSessionId = localStorage.getItem(storageKey);
    if (storedSessionId) {
      this.sessionId = storedSessionId;
      return storedSessionId;
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    try {
      localStorage.setItem(storageKey, newSessionId);
    } catch (error) {
      console.warn('Unable to persist session identifier to localStorage', error);
    }
    this.sessionId = newSessionId;
    return newSessionId;
  }

  // Helper to check if JWT token is expired
  private isJWTExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true; // If we can't parse it, consider it expired
    }
  }

  // Helper to refresh JWT token using Pi access token
  private async refreshJWTToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const piAccessToken = localStorage.getItem('pi_access_token');
    const piUser = localStorage.getItem('pi_user');

    if (!piAccessToken || !piUser) {
      return null;
    }

    try {
      const userData = JSON.parse(piUser);
      
      // Use the signIn method which handles URL construction correctly
      const response = await this.signIn({
        accessToken: piAccessToken,
        user: {
          uid: userData.uid,
          username: userData.username || '',
          wallet_address: userData.wallet_address
        }
      });

      if (response.success && response.data) {
        const authData = response.data as AuthResponseData;
        if (authData.token) {
          localStorage.setItem('auth_token', authData.token);
          return authData.token;
        }
      }
    } catch (error) {
      console.error('Failed to refresh JWT token:', error);
    }

    return null;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-session-id': this.getSessionId(),
    };
     
    if (typeof window !== 'undefined') {
      defaultHeaders['Origin'] = window.location.origin;
      
      // Try JWT token first (from backend signin) - required in production
      let token = localStorage.getItem('auth_token');
      
      // Check if JWT token is expired and refresh if needed
      if (token && this.isJWTExpired(token)) {
        console.log('JWT token expired, refreshing...');
        token = await this.refreshJWTToken();
      }
      
      // Fallback to Pi access token only in development/sandbox mode
      // In production, JWT tokens are required for security
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname.includes('testnet');
      
      if (!token && isDevelopment) {
        token = localStorage.getItem('pi_access_token');
        if (token) {
          console.warn('Using Pi access token instead of JWT (development mode only)');
        }
      }
      
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      } else if (!isDevelopment) {
        console.error('No authentication token available. JWT token required in production.');
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Retry logic for connection resilience
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        // Handle connection errors (no response received)
        if (!response) {
          throw new Error('Backend server is not responding. Please ensure the backend server is running on port 3001.');
        }
        
        const data = await response.json();

        if (!response.ok) {
          // For 404 errors, include the status code in the error message for easier detection
          const errorMessage = data.error || `HTTP ${response.status}`;
          const error = new Error(errorMessage) as Error & { status?: number };
          // Add status code to error for easier checking
          error.status = response.status;
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Only retry on network/connection errors, not on HTTP errors
        const isNetworkError = 
          error instanceof TypeError && 
          (error.message.includes('fetch') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('network') ||
           error.message.includes('ERR_CONNECTION_REFUSED') ||
           error.message.includes('ERR_CONNECTION_RESET'));
        
        // Don't retry on HTTP errors (4xx, 5xx) or if we've exhausted retries
        const errorWithStatus = error as Error & { status?: number };
        const isHttpError = error instanceof Error && 'status' in error && typeof errorWithStatus.status === 'number' && errorWithStatus.status >= 400;
        
        if (!isNetworkError || isHttpError || attempt === maxRetries) {
          // Handle network errors (connection refused, reset, etc.)
          if (isNetworkError && !isHttpError) {
            const connectionError = new Error(
              'Cannot connect to backend server. Please ensure the backend server is running on http://localhost:3001'
            ) as Error & { status?: number; isConnectionError?: boolean };
            connectionError.status = 0;
            connectionError.isConnectionError = true;
            console.error(`Backend connection failed: ${endpoint}. Is the server running?`);
            throw connectionError;
          }
          
          // Only log non-404 errors to avoid cluttering console
          const errorWithStatus = error as Error & { status?: number };
          if (!(error instanceof Error && errorWithStatus.status === 404)) {
            console.error(`API request failed: ${endpoint}`, error);
          }
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Retrying request to ${endpoint} (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }

  // Authentication methods
  async initPiAuth(piAuthData: {
    piAccessToken: string;
    piUid: string;
    piUsername: string;
  }) {
    return this.request('/auth/pi-init', {
      method: 'POST',
      body: JSON.stringify(piAuthData),
    });
  }

  async findUserByWallet(walletAddress: string) {
    return this.request('/auth/find-user-by-wallet', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async findUserByUsername(username: string) {
    return this.request('/auth/find-user', {
      method: 'POST',
      body: JSON.stringify({ piUsername: username }),
    });
  }

  // Pi Authentication
  async signIn(authResult: {
    accessToken: string;
    user: { uid: string; username: string; wallet_address?: string };
  }) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(authResult),
    });
  }

  // Wallet Import
  async importWallet(userId: string, mnemonic: string) {
    return this.request('/auth/import-wallet', {
      method: 'POST',
      body: JSON.stringify({ userId, mnemonic }),
    });
  }

  // Encrypted Secret Management
  async storeSecret(data: {
    userId: string;
    publicKey: string;
    encryptedSecret: string;
    iv: string;
    salt: string;
  }) {
    return this.request('/auth/store-secret', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSecret(userId: string, publicKey: string) {
    return this.request('/auth/get-secret', {
      method: 'POST',
      body: JSON.stringify({ userId, publicKey }),
    });
  }

  async removeSecret(userId: string, publicKey: string) {
    return this.request('/auth/remove-secret', {
      method: 'DELETE',
      body: JSON.stringify({ userId, publicKey }),
    });
  }

  async verifyPassphrase(username: string, passphrase: string) {
    return this.request('/auth/verify-passphrase', {
      method: 'POST',
      body: JSON.stringify({ username, passphrase }),
    });
  }

  async getCurrentUser() {
    // If using Pi access token (no JWT), include walletAddress from localStorage if available
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const piUser = typeof window !== 'undefined' ? localStorage.getItem('pi_user') : null;
    
    // If no JWT token but we have Pi user data, include walletAddress in request body
    if (!authToken && piUser) {
      try {
        const userData = JSON.parse(piUser);
        if (userData.wallet_address) {
          return this.request('/auth/me', {
            method: 'POST', // Use POST to send body
            body: JSON.stringify({ walletAddress: userData.wallet_address }),
          });
        }
      } catch {
        // Fall through to regular GET request
      }
    }
    
    return this.request('/auth/me', {
      method: 'GET',
    });
  }


  // Balance Check Methods 
  async checkBalance(address: string) {
    return this.request(`/balance/check/${address}`);
  }

  async bulkCheckBalance(addresses: string[]) {
    return this.request('/balance/bulk-check', {
      method: 'POST',
      body: JSON.stringify({ addresses }),
    });
  }

  async enhancedBalanceCheck(address: string) {
    return this.request(`/balance/enhanced/${address}`);
  }

  // Health & Monitoring Methods  
  async healthCheck() {
    return this.request('/health');
  }

  async detailedHealthCheck() {
    return this.request('/health/detailed');
  }

  async getStats() {
    return this.request('/health/stats');
  }

  async getPiPrice() {
    return this.request('/health/price');
  }

  async getReserveStatus() {
    return this.request('/health/reserve');
  }

  // Get liquidity pool information
  async getPoolInfo() {
    return this.request('/health/pool');
  }

  // Get comprehensive wallet and pool status (reserve + pool combined)
  async getWalletStatus() {
    return this.request('/health/wallet');
  }

  // Check if running on testnet
  isTestnetMode(): boolean {
    if (typeof window === 'undefined') {
      // Server-side: check environment variable
      return process.env.NEXT_PUBLIC_NETWORK === 'testnet';
    }
    // Client-side: check environment variable or hostname
    return (
      process.env.NEXT_PUBLIC_NETWORK === 'testnet' ||
      window.location.hostname.includes('testnet')
    );
  }

  async getStatsLegacy(type: 'dynamic' | 'fixed' = 'dynamic') {
    return this.request(`/stablecoin/stats?type=${type}`);
  }

  async mint(data: {
    amount: number;
    walletAddress: string;
    secretSeed: string;
  }) {
    return this.request('/stablecoin/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeem(data: {
    amount: number;
    walletAddress: string;
    secretSeed: string;
  }) {
    return this.request('/stablecoin/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBalanceLegacy() {
    return this.request('/stablecoin/balance');
  }

  // Wallet methods
  async getWalletInfo() {
    return this.request('/wallet/info');
  }

  async getTransactionHistory(limit?: number, walletAddress?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (walletAddress) params.append('walletAddress', walletAddress);
    const queryString = params.toString();
    return this.request(`/stablecoin/history${queryString ? `?${queryString}` : ''}`);
  }

  // Volatility & Position Health Methods
  async getCurrentVolatility() {
    return this.request('/stablecoin/volatility/current');
  }

  async getVolatilityHistory(hours?: number) {
    const params = hours ? `?hours=${hours}` : '';
    return this.request(`/stablecoin/volatility/history${params}`);
  }

  async getPositionHealth(address: string) {
    return this.request(`/stablecoin/positions/${address}`);
  }

  async getPositionHealthDetailed(address: string) {
    return this.request(`/stablecoin/positions/${address}/health`);
  }

  async getNotifications(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/stablecoin/notifications${params}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/stablecoin/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // Rewards & Incentives Methods
  async getRewardStatus() {
    return this.request('/stablecoin/rewards/status');
  }

  // Soft Liquidation Methods
  async getSoftLiquidationOffers(address: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation`);
  }

  async offerSoftLiquidation(address: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation/offer`, {
      method: 'POST',
    });
  }

  async acceptSoftLiquidation(address: string, offerId: string) {
    return this.request(`/stablecoin/positions/${address}/soft-liquidation/accept`, {
      method: 'POST',
      body: JSON.stringify({ offerId }),
    });
  }

  // Risk Signals (admin/internal)
  async getRiskSignals() {
    return this.request('/stablecoin/risk-signals');
  }

}

export const apiClient = new ApiClient();
export { ApiClient };
