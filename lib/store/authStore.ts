import { create } from 'zustand';
import { User, AuthResponseData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { idbGet, idbSet, idbHas, STORES } from '@/lib/storage/idb';
import { generateAesKey, aesEncrypt, aesDecrypt, exportCryptoKey, importRawAesKey } from '@/lib/crypto/client-crypto';
import { encryptWithPassword, decryptWithPassword } from '@/lib/crypto/password-crypto';

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
  
  // Wallet Import
  importWallet: (userId: string, mnemonic: string) => Promise<{ success: boolean; data?: { publicKey: string; secret: string }; error?: string }>;
  
  // Encrypted Secret Management (Server-side)
  storeEncryptedSecret: (userId: string, publicKey: string, mnemonic: string, password: string) => Promise<{ success: boolean; error?: string }>;
  getEncryptedSecret: (userId: string, publicKey: string, password: string) => Promise<{ success: boolean; data?: { mnemonic: string }; error?: string }>;
  removeEncryptedSecret: (userId: string, publicKey: string) => Promise<{ success: boolean; error?: string }>;
  
  // Wallet Operations
  retrieveKeypairForTransaction: (walletAddress: string, password?: string) => Promise<{ walletAddress: string; secretSeed: string }>;
  hasWalletInIndexedDB: (walletAddress: string) => Promise<boolean>;
  reImportWallet: (walletAddress: string, passphrase: string) => Promise<{ success: boolean; error?: string }>;
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
          console.log('✅ Re-authenticated successfully:', authData.user?.piUsername || userData.uid);
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
  
    // Wallet Import
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
  
    // Encrypted Secret Management (Server-side)
    storeEncryptedSecret: async (userId, publicKey, mnemonic, password) => {
      set({ isLoading: true, error: null });
      try {
        // Encrypt mnemonic with password on client-side
        const { encryptedSecret, iv, salt } = await encryptWithPassword(mnemonic, password);
        
        // Store encrypted secret on server
        const response = await apiClient.storeSecret({
          userId,
          publicKey,
          encryptedSecret,
          iv,
          salt,
        });
        
        set({ isLoading: false });
        return {
          success: response.success,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to store encrypted secret', 
          isLoading: false 
        });
        return { success: false, error: error instanceof Error ? error.message : 'Failed to store encrypted secret' };
      }
    },
  
    getEncryptedSecret: async (userId, publicKey, password) => {
      set({ isLoading: true, error: null });
      try {
        // Get encrypted secret from server
        const response = await apiClient.getSecret(userId, publicKey);
        
        if (!response.success || !response.data) {
          set({ isLoading: false });
          return {
            success: false,
            error: (response as { error?: string }).error || 'Secret not found',
          };
        }
        
        const secretData = response.data as { encryptedSecret: string; iv: string; salt: string };
        
        // Decrypt mnemonic with password on client-side
        const mnemonic = await decryptWithPassword(
          secretData.encryptedSecret,
          password,
          secretData.salt,
          secretData.iv
        );
        
        set({ isLoading: false });
        return {
          success: true,
          data: { mnemonic },
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to retrieve encrypted secret', 
          isLoading: false 
        });
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to retrieve encrypted secret' 
        };
      }
    },
  
    removeEncryptedSecret: async (userId, publicKey) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.removeSecret(userId, publicKey);
        set({ isLoading: false });
        return {
          success: response.success,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to remove encrypted secret', 
          isLoading: false 
        });
        return { success: false, error: error instanceof Error ? error.message : 'Failed to remove encrypted secret' };
      }
    },
  
    // Wallet Operations
    hasWalletInIndexedDB: async (walletAddress: string): Promise<boolean> => {
      try {
        const hasSeed = await idbHas(STORES.ENCRYPTED_SEEDS, walletAddress);
        const hasKey = await idbHas(STORES.AES_KEYS, walletAddress);
        return hasSeed && hasKey;
      } catch {
        return false;
      }
    },

    reImportWallet: async (walletAddress: string, passphrase: string): Promise<{ success: boolean; error?: string }> => {
      set({ isLoading: true, error: null });
      try {
        // Derive seed from passphrase
        const response = await fetch('/api/passphrase/derive-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passphrase }),
        });

        if (!response.ok) {
          throw new Error('Failed to derive wallet from passphrase');
        }

        const { walletAddress: derivedWalletAddress, secretSeed } = await response.json();

        // Verify wallet address matches
        if (derivedWalletAddress !== walletAddress) {
          throw new Error('Passphrase does not match this wallet address');
        }

        // Generate new AES key and encrypt seed
        const aesKey = await generateAesKey();
        const { ciphertext, iv } = await aesEncrypt(aesKey, secretSeed);
        const rawAesKey = await exportCryptoKey(aesKey);

        // Store in IndexedDB
        await idbSet(STORES.ENCRYPTED_SEEDS, walletAddress, {
          ciphertext: Array.from(ciphertext),
          iv: Array.from(iv),
        });
        await idbSet(STORES.AES_KEYS, walletAddress, Array.from(rawAesKey));

        set({ isLoading: false });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to re-import wallet';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        return { success: false, error: errorMessage };
      }
    },

    retrieveKeypairForTransaction: async (walletAddress, password): Promise<{ walletAddress: string; secretSeed: string }> => {
      set({ isLoading: true, error: null });
      try {
        if (!password) {
          throw new Error('PASSWORD_REQUIRED: Password is required to decrypt wallet for transactions.');
        }

        // First, check if wallet exists in IndexedDB (client-side storage)
        const hasWallet = await idbHas(STORES.ENCRYPTED_SEEDS, walletAddress);
        
        if (hasWallet) {
          // Use client-side stored wallet - decrypt with password
          // Note: We need to get the encrypted mnemonic from server-side to decrypt with password
          // OR we can use the stored AES key approach but require password verification
          
          // For now, try server-side first if user is authenticated
          const userResponse = await apiClient.findUserByWallet(walletAddress);
          if (userResponse.success) {
            interface UserResponseData {
              user?: {
                id: string;
                piUsername: string;
                walletAddress: string;
                createdAt: string;
              };
            }
            
            const responseData = userResponse.data as UserResponseData | undefined;
            const directUser = (userResponse as { user?: UserResponseData['user'] }).user;
            const userData = responseData?.user || directUser;
            
            if (userData?.id) {
              // Get encrypted secret from server and decrypt with password
              const { getEncryptedSecret } = useAuthStore.getState();
              const secretResult = await getEncryptedSecret(userData.id, walletAddress, password);
              
              if (secretResult.success && secretResult.data?.mnemonic) {
                // Derive wallet from decrypted mnemonic
                const importResponse = await fetch('/api/account/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ mnemonic: secretResult.data.mnemonic }),
                });
                
                const importData = await importResponse.json();
                if (importData.success && importData.secret) {
                  set({ isLoading: false });
                  return { walletAddress, secretSeed: importData.secret };
                }
              }
            }
          }

          // Fallback: Use IndexedDB with AES key (for backwards compatibility)
          // But we should still verify password somehow - for now, just use stored key
          const encryptedSeed = await idbGet<{ ciphertext: number[]; iv: number[] }>(STORES.ENCRYPTED_SEEDS, walletAddress);
          const rawAesKey = await idbGet<number[]>(STORES.AES_KEYS, walletAddress);

          if (!encryptedSeed || !rawAesKey) {
            throw new Error('WALLET_NOT_FOUND: Wallet data not found in this device. Please re-import with your 24-word passphrase.');
          }

          // Import AES key and decrypt seed
          const aesKey = await importRawAesKey(new Uint8Array(rawAesKey));
          const ciphertext = new Uint8Array(encryptedSeed.ciphertext);
          const iv = new Uint8Array(encryptedSeed.iv);
          const secretSeed = await aesDecrypt(aesKey, ciphertext, iv);
          
          set({ isLoading: false });
          return { walletAddress, secretSeed };
        } else {
          // Check if user has server-side encrypted secret
          const userResponse = await apiClient.findUserByWallet(walletAddress);
          if (!userResponse.success) {
            throw new Error(userResponse.error || 'User not found');
          }

          interface UserResponseData {
            user?: {
              id: string;
              piUsername: string;
              walletAddress: string;
              createdAt: string;
            };
          }
          
          const responseData = userResponse.data as UserResponseData | undefined;
          const directUser = (userResponse as { user?: UserResponseData['user'] }).user;
          const userData = responseData?.user || directUser;
          
          if (!userData || !userData.id) {
            throw new Error('User not found or missing user ID');
          }
          
          // Get encrypted secret from server and decrypt with password
          const { getEncryptedSecret } = useAuthStore.getState();
          const secretResult = await getEncryptedSecret(userData.id, walletAddress, password);
          
          if (!secretResult.success || !secretResult.data?.mnemonic) {
            throw new Error(secretResult.error || 'Failed to decrypt wallet. Please check your password.');
          }

          // Derive wallet from decrypted mnemonic
          const importResponse = await fetch('/api/account/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mnemonic: secretResult.data.mnemonic }),
          });
          
          const importData = await importResponse.json();
          if (!importData.success || !importData.secret) {
            throw new Error(importData.error || 'Failed to derive wallet from decrypted mnemonic.');
          }

          set({ isLoading: false });
          return { walletAddress, secretSeed: importData.secret };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve keypair';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        throw err;
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
