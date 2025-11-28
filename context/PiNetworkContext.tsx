'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PiPayment, PiAuthResult, PiUser as PiSDKUser } from '@/types/pi-sdk';

interface PiUser extends PiSDKUser {
  wallet_address?: string;
  authenticated_at?: Date;
}

interface PiNetworkContextType {
  isAuthenticated: boolean;
  user: PiUser | null;
  accessToken: string | null;
  isLoading: boolean;
  authenticate: () => Promise<PiAuthResult>;
  logout: () => void;
}

const PiNetworkContext = createContext<PiNetworkContextType | undefined>(undefined);

interface PiNetworkProviderProps {
  children: ReactNode;
}

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export function PiNetworkProvider({ children }: PiNetworkProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingAuth = async () => {
      if (typeof window === 'undefined') return;
      
      const savedToken = localStorage.getItem('pi_access_token');
      const savedUser = localStorage.getItem('pi_user');
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setAccessToken(savedToken);
          setIsAuthenticated(true);
          console.log('Restored authentication from localStorage');
        } catch (error) {
          console.error('Error restoring saved authentication:', error);
          localStorage.removeItem('pi_access_token');
          localStorage.removeItem('pi_user');
        }
      }
    };

    checkExistingAuth();
  }, []);

  const authenticate = async (): Promise<PiAuthResult> => {
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please open in Pi Browser.');
    }

    setIsLoading(true);
    try {
      console.log('Starting Pi authentication...');

      const onIncompletePaymentFound = (payment: PiPayment) => {
        console.log('Incomplete payment found:', payment);
      };
      
      console.log(' Authenticating with Pi Network...');
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      );
      
      console.log('Pi authentication completed successfully');
      
      const userData = auth.user;
      
      setUser(userData);
      setAccessToken(auth.accessToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('pi_access_token', auth.accessToken);
      localStorage.setItem('pi_user', JSON.stringify(userData));
      
      console.log('Authentication data saved to localStorage');
      
      try {
        let sessionId = localStorage.getItem('pi_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('pi_session_id', sessionId);
        }
        
        const response = await fetch(`${SERVER_BASE_URL}/api/auth/pi-init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          body: JSON.stringify({ 
            piAccessToken: auth.accessToken,
            piUid: userData.uid,
            piUsername: userData.username || ''
          }),
        });

        if (response.ok) {
          console.log(' Pi auth data synced with backend, session:', sessionId);
        } else {
          console.warn(' Backend sync failed');
        }
      } catch (error) {
        console.error('Backend sync request failed:', error);
      }
      
      return auth;
    } catch (error) {
      console.error('Pi Network authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pi_access_token');
      localStorage.removeItem('pi_user');
    }
  };

  const value: PiNetworkContextType = {
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    authenticate,
    logout
  };

  return (
    <PiNetworkContext.Provider value={value}>
      {children}
    </PiNetworkContext.Provider>
  );
}

const DEFAULT_CONTEXT: PiNetworkContextType = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isLoading: false,
  authenticate: async () => { throw new Error('Not available during build'); },
  logout: () => {},
};

export function usePiNetwork(): PiNetworkContextType {
  
  const isSSR = typeof window === 'undefined';
  let context: PiNetworkContextType | undefined;
  
  try {
    
    context = useContext(PiNetworkContext);
  } catch (error: unknown) {
    const errorMessage = String((error as Error)?.message || '');
    const errorString = String(error || '');
     
    if (
      isSSR ||
      errorMessage.includes('null') ||
      errorMessage.includes('useContext') ||
      errorMessage.includes('Cannot read properties') ||
      errorString.includes('null') ||
      errorString.includes('useContext')
    ) {
      return DEFAULT_CONTEXT;
    }
    throw error;
  }
  
  if (context === undefined) {
    if (isSSR) {
      return DEFAULT_CONTEXT;
    }
    throw new Error('usePiNetwork must be used within a PiNetworkProvider');
  }
  
  return context as PiNetworkContextType;
}
