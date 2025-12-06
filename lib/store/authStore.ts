import { create } from 'zustand';
import { User, AuthResponseData } from '@/types';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Pi Authentication
  signInWithPi: (authResult: { accessToken: string; user: { uid: string; username: string } }) => Promise<{ success: boolean; data?: AuthResponseData; error?: string }>;
  
  // Wallet Generation
  generateWallet: () => Promise<{ success: boolean; data?: { publicKey: string; secretSeed: string; seedAmount: string; transactionHash: string; accountCreated: boolean; warning: string }; error?: string }>;
  createNewWallet: () => Promise<{ success: boolean; data?: { publicKey: string; secretSeed: string; seedAmount: string; transactionHash: string; accountCreated: boolean; warning: string }; error?: string }>;
  
  // Wallet Import (deprecated - kept for internal/backup use)
  importWallet: (userId: string, mnemonic: string) => Promise<{ success: boolean; data?: { publicKey: string; secret: string }; error?: string }>;
  verifyPassphrase: (username: string, passphrase: string) => Promise<{ success: boolean; data?: { walletAddress: string }; error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize with empty state - we'll restore from backend asynchronously
  let isInitialized = false;
  
  // Restore user from backend on first access
  const initializeAuth = async () => {
    if (isInitialized || typeof window === 'undefined') {
      return;
    }
    
    isInitialized = true;
    
    // Wait a bit for Pi provider to potentially refresh tokens
    // This helps avoid race conditions where authStore initializes before Pi provider
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let authToken = localStorage.getItem('auth_token');
    const piAccessToken = localStorage.getItem('pi_access_token');
    const piUser = localStorage.getItem('pi_user');
    
    // If no JWT token but we have Pi credentials, try to refresh
    // Always re-authenticate if we have Pi access token (idempotent signin)
    // This ensures fresh tokens and updates user data if needed
    // Works for both production and development
    if (piAccessToken && piUser) {
      try {
        console.log('Re-authenticating user on app load for fresh tokens...');
        const userData = JSON.parse(piUser);
        
        // Use API client's signIn method which handles URL construction correctly
        // This works for both production (Next.js proxy) and development (direct backend)
        const signInResponse = await apiClient.signIn({
          accessToken: piAccessToken,
          user: {
            uid: userData.uid,
            username: userData.username || '',
            wallet_address: userData.wallet_address || '' // Pi SDK sends empty string, but we keep it for compatibility
          }
        });

        if (signInResponse.success && signInResponse.data) {
          const authData = signInResponse.data as AuthResponseData;
          if (authData.token) {
            localStorage.setItem('auth_token', authData.token);
            authToken = authData.token;
          }
          if (authData.user?.piUsername) {
            userData.username = authData.user.piUsername;
            localStorage.setItem('pi_user', JSON.stringify(userData));
          }
          console.log('Re-authenticated successfully:', authData.user?.piUsername || userData.uid);
        } else {
          console.warn('Signin succeeded but no token returned');
          return; // Can't proceed without token
        }
      } catch (error) {
        console.error('Failed to re-authenticate on app load:', error);
        // Don't clear tokens on connection errors - might be temporary
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
        return; // Can't proceed without token
      }
    }
    
    if (!authToken) {
      return; // No token, user is not authenticated
    }
    
    try {
      set({ isLoading: true });
      const response = await apiClient.getCurrentUser();
      
      if (response.success && (response.data as AuthResponseData)?.user) {
        const user = (response.data as AuthResponseData).user!;
        // Store user in localStorage as backup
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      }
    } catch (error) {
      // Token is invalid or expired, or network error
      console.error('Error restoring user from backend:', error);
      // Don't remove tokens immediately - might be a network issue
      // Only remove if it's clearly an auth error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    }
  };
  
  // Initialize auth on store creation (only in browser)
  if (typeof window !== 'undefined') {
    initializeAuth();
  }
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  
    setUser: (user) => {
      set({ user });
      // Persist user to localStorage
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('auth_user');
        }
      }
    },
    setAuthenticated: (authenticated) => {
      set({ isAuthenticated: authenticated });
      // If not authenticated, clear user from localStorage
      if (!authenticated && typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
      }
    },
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      set({ user: null, isAuthenticated: false, error: null });
    },
  
    // Pi Authentication
    signInWithPi: async (authResult) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.signIn(authResult);
        if (response.success && (response.data as AuthResponseData)?.user) {
          const authData = response.data as AuthResponseData;
          // Store JWT token if provided
          if (authData.token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', authData.token);
          }
          // Store user in localStorage as backup
          if (typeof window !== 'undefined' && authData.user) {
            localStorage.setItem('auth_user', JSON.stringify(authData.user));
          }
          
          set({ 
            user: authData.user!, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } else {
          set({ error: (response as { error?: string }).error || 'Sign-in failed', isLoading: false });
        }
        return response as { success: boolean; data?: AuthResponseData; error?: string };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Sign-in failed', 
          isLoading: false 
        });
        throw error;
      }
    },
  
    // Wallet Generation
    generateWallet: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.generateWallet();
        set({ isLoading: false });
        return {
          success: response.success,
          data: response.data as { publicKey: string; secretSeed: string; seedAmount: string; transactionHash: string; accountCreated: boolean; warning: string } | undefined,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallet';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    },

    createNewWallet: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.createNewWallet();
        set({ isLoading: false });
        return {
          success: response.success,
          data: response.data as { publicKey: string; secretSeed: string; seedAmount: string; transactionHash: string; accountCreated: boolean; warning: string } | undefined,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create new wallet';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    },
  
    // Wallet Import (deprecated - kept for internal/backup use)
    importWallet: async (userId, mnemonic) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.importWallet(userId, mnemonic);
        set({ isLoading: false });
        return {
          success: response.success,
          data: response.data as { publicKey: string; secret: string } | undefined,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Wallet import failed', 
          isLoading: false 
        });
        throw error;
      }
    },

    verifyPassphrase: async (username, passphrase) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.verifyPassphrase(username, passphrase);
        set({ isLoading: false });
        return {
          success: response.success,
          data: response.data as { walletAddress: string } | undefined,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Passphrase verification failed', 
          isLoading: false 
        });
        throw error;
      }
    },
  };
});
