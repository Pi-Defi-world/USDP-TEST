import { create } from 'zustand';
import { Balance, ReserveStatus } from '@/types';
import { apiClient } from '@/lib/api/client';

interface WalletState {
  walletAddress: string | null;
  balance: Balance | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isTestnet: boolean;
  reserveStatus: ReserveStatus | null;
  
  // Actions
  setWalletAddress: (address: string | null) => void;
  setBalance: (balance: Balance | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (balance: Balance) => void;
  clearWallet: () => void;
  fetchBalance: (address: string) => Promise<void>;
  fetchEnhancedBalance: (address: string) => Promise<void>;
  fetchReserveStatus: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => {
  // Initialize testnet mode check
  const checkTestnetMode = () => {
    const testnetMode = apiClient.isTestnetMode();
    set({ isTestnet: testnetMode });
    return testnetMode;
  };

  // Initial check
  if (typeof window !== 'undefined') {
    checkTestnetMode();
  }

  return {
    walletAddress: null,
    balance: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
    isTestnet: false,
    reserveStatus: null,
  
    setWalletAddress: (address) => set({ walletAddress: address }),
    setBalance: (balance) => set({ balance, lastUpdate: new Date() }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    updateBalance: (balance) => set({ balance, lastUpdate: new Date(), error: null }),
    clearWallet: () => set({ 
      walletAddress: null, 
      balance: null, 
      error: null, 
      lastUpdate: null,
      reserveStatus: null,
    }),
  
  fetchBalance: async (address: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.checkBalance(address);
      if (response.success) {
        set({ 
          balance: response.data as Balance, 
          lastUpdate: new Date(), 
          isLoading: false,
          error: null 
        });
      } else {
        set({ error: response.error || 'Failed to fetch balance', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch balance', 
        isLoading: false 
      });
    }
  },
  
  fetchEnhancedBalance: async (address: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.enhancedBalanceCheck(address);
      if (response.success) {
        set({ 
          balance: response.data as Balance, 
          lastUpdate: new Date(), 
          isLoading: false,
          error: null 
        });
      } else {
        set({ error: response.error || 'Failed to fetch enhanced balance', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch enhanced balance', 
        isLoading: false 
      });
    }
  },

  fetchReserveStatus: async () => {
    const isTestnet = get().isTestnet || checkTestnetMode();
    if (!isTestnet) return;

    try {
      const response = await apiClient.getReserveStatus();
      if (response.success && response.data) {
        set({ reserveStatus: response.data as ReserveStatus });
      }
    } catch (error) {
      console.error('Failed to fetch reserve status:', error);
      // Don't set error state for reserve status as it's optional
    }
  },
  };
});
