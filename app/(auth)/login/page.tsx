'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { apiClient } from '@/lib/api/client';
import { PassphraseVerification } from '@/components/PassphraseVerification';
import { Wallet, Shield, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type LoginState = 'username' | 'passphrase' | 'passkey' | 'reimport';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState('');
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('username');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [reImportWalletAddress, setReImportWalletAddress] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const { 
    verifyPasskeyLogin,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
    reImportWallet
  } = useAuthStore();
  const { setWalletAddress: setWallet } = useWalletStore();

  // Auto-redirect if already authenticated (but only if we have a user object)
  // Don't redirect just based on token - user might be on login page intentionally
  useEffect(() => {
    if (isAuthenticated && useAuthStore.getState().user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLookingUpUser(true);
    setAuthStep('Checking if user exists...');

    try {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        throw new Error('Please enter your username');
      }

      // Check if user exists and get passkey status
      const loginResponse = await apiClient.startPasskeyLogin(trimmedUsername);
      
      if (!loginResponse.success || !loginResponse.data) {
        throw new Error(loginResponse.error || 'User not found. Please check your username or register first.');
      }

      const loginData = loginResponse.data as {
        requiresPassphrase?: boolean;
        walletAddress?: string;
        challenge?: string;
        rpId?: string;
        timeout?: number;
        userVerification?: UserVerificationRequirement;
        passkeys?: Array<{ id: string; credentialId: string; deviceName: string; lastUsedAt: string; createdAt: string }>;
      };

      // Store wallet address for later use (in case passkey auth fails)
      if (loginData.walletAddress) {
        setWalletAddress(loginData.walletAddress);
      }

      // If no passkeys exist, show passphrase verification
      if (loginData.requiresPassphrase) {
        setLoginState('passphrase');
        setIsLookingUpUser(false);
        return;
      }

      // User has passkeys - show passkey authentication prompt
      // Ensure all required fields are present
      if (!loginData.challenge || !loginData.rpId || !loginData.timeout || !loginData.userVerification) {
        throw new Error('Invalid authentication options received from server');
      }

      // User has passkeys - trigger passkey authentication
      // Clear loading state first
      setIsLookingUpUser(false);
      setLoginState('passkey');
      
      // Trigger passkey authentication
      // Use non-blocking call so UI can update
      handlePasskeyAuthentication(trimmedUsername, {
        challenge: loginData.challenge!,
        rpId: loginData.rpId!,
        timeout: loginData.timeout!,
        userVerification: loginData.userVerification!,
      }).catch((err) => {
        console.error('Passkey authentication error:', err);
        // Error handling is done in handlePasskeyAuthentication
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setAuthStep('');
      setIsLookingUpUser(false);
    }
  };

  const handlePasskeyAuthentication = async (
    trimmedUsername: string, 
    authData: {
      challenge: string;
      rpId: string;
      timeout: number;
      userVerification: UserVerificationRequirement;
    }
  ) => {
    try {
      setIsLookingUpUser(false); // Clear username lookup loading state
      setAuthStep('Complete passkey authentication...');
      
      const base64urlToUint8Array = (base64url: string) => {
        const base64 = base64url
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
        const binaryString = atob(base64);
        return Uint8Array.from(binaryString, c => c.charCodeAt(0));
      };

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToUint8Array(authData.challenge),
        timeout: authData.timeout,
        rpId: authData.rpId,
        userVerification: authData.userVerification,
      };

      let credential: PublicKeyCredential;
      try {
        credential = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        }) as PublicKeyCredential;
      } catch (err) {
        // If passkey auth fails (user cancels or no passkey available), show passphrase option
        console.log('Passkey authentication failed or cancelled, showing passphrase option:', err);
        setLoginState('passphrase');
        setAuthStep('');
        setIsLookingUpUser(false);
        setError(null); // Clear any previous errors
        return;
      }
      
      setAuthStep('Verifying authentication...');
      
      const rawIdArray = Array.from(new Uint8Array(credential.rawId));
      const clientDataJSONArray = Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).clientDataJSON));
      const authenticatorDataArray = Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData));
      const signatureArray = Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature));
      const userHandleArray = (credential.response as AuthenticatorAssertionResponse).userHandle 
        ? Array.from(new Uint8Array((credential.response as AuthenticatorAssertionResponse).userHandle!))
        : null;
      
      const verifyResult = await verifyPasskeyLogin({
        username: trimmedUsername,
        credential: {
          id: credential.id,
          rawId: rawIdArray,
          response: {
            clientDataJSON: clientDataJSONArray,
            authenticatorData: authenticatorDataArray,
            signature: signatureArray,
            userHandle: userHandleArray,
          },
          type: credential.type,
        },
      });
      
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Authentication verification failed');
      }

      await handleSuccessfulAuth(verifyResult.data?.user?.walletAddress);
    } catch (err) {
      // If passkey auth fails, allow user to use passphrase instead
      console.log('Passkey authentication error, showing passphrase option:', err);
      setLoginState('passphrase');
      setAuthStep('');
      setIsLookingUpUser(false);
      setError('Passkey authentication failed. Please verify your passphrase to add a new passkey for this device.');
    }
  };

  const handlePassphraseVerified = async (verifiedWalletAddress: string) => {
    try {
      setAuthStep('Creating passkey for this device...');
      
      // Start new device passkey registration
      const regOptions = await apiClient.startAddDevicePasskey(username.trim(), verifiedWalletAddress);
      
      if (!regOptions.success || !regOptions.data) {
        throw new Error(regOptions.error || 'Failed to start passkey registration');
      }

      const regData = regOptions.data as {
        challenge: string;
        rp: { name: string; id: string };
        user: { id: string; name: string; displayName: string };
        pubKeyCredParams: Array<{ type: string; alg: number }>;
        authenticatorSelection: AuthenticatorSelectionCriteria;
        timeout: number;
        attestation: string;
      };

      // Create passkey
      setAuthStep('Complete passkey creation...');
      const base64urlToUint8Array = (base64url: string) => {
        const base64 = base64url
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
        const binaryString = atob(base64);
        return Uint8Array.from(binaryString, c => c.charCodeAt(0));
      };

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64urlToUint8Array(regData.challenge),
        rp: regData.rp,
        user: {
          id: base64urlToUint8Array(regData.user.id),
          name: regData.user.name,
          displayName: regData.user.displayName,
        },
        pubKeyCredParams: regData.pubKeyCredParams.map(param => ({
          type: 'public-key' as const,
          alg: param.alg,
        })),
        authenticatorSelection: regData.authenticatorSelection,
        timeout: regData.timeout,
        attestation: regData.attestation as AttestationConveyancePreference,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      setAuthStep('Verifying passkey registration...');
      
      const rawIdArray = Array.from(new Uint8Array(credential.rawId));
      const attestationObjectArray = Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject));
      const clientDataJSONArray = Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON));

      const verifyResult = await apiClient.verifyAddDevicePasskey({
        username: username.trim(),
        walletAddress: verifiedWalletAddress,
        credential: {
          id: credential.id,
          rawId: rawIdArray,
          response: {
            clientDataJSON: clientDataJSONArray,
            attestationObject: attestationObjectArray,
          },
          type: credential.type,
        },
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Passkey registration failed');
      }

      // Store token and user data
      const verifyData = verifyResult.data as { token?: string; user?: { id: string; walletAddress: string; piUsername: string; createdAt: string } } | undefined;
      if (verifyData?.token) {
        localStorage.setItem('auth_token', verifyData.token);
      }
      if (verifyData?.user) {
        useAuthStore.getState().setUser({
          _id: verifyData.user.id,
          walletAddress: verifyData.user.walletAddress,
          passkeyCredential: {
            credentialId: '',
            publicKey: '',
            counter: 0,
          },
          createdAt: new Date(verifyData.user.createdAt),
          lastLogin: new Date(),
        });
        useAuthStore.getState().setAuthenticated(true);
      }

      await handleSuccessfulAuth(verifiedWalletAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create passkey for this device');
      setAuthStep('');
    }
  };

  const handleSuccessfulAuth = async (walletAddr: string | undefined) => {
    if (!walletAddr) {
      setError('Wallet address not found');
      return;
    }

    setWallet(walletAddr);
    
    // Check if wallet exists in IndexedDB
    const { hasWalletInIndexedDB } = useAuthStore.getState();
    const hasWallet = await hasWalletInIndexedDB(walletAddr);
    
    if (!hasWallet) {
      setReImportWalletAddress(walletAddr);
      setLoginState('reimport');
      setAuthStep('');
      return;
    }

    toast({
      title: 'Login Successful',
      description: `Welcome back, ${username}!`,
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  const displayError = authError || error;
  const isLoading = authLoading || isLookingUpUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in with your passkey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loginState === 'reimport' ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Wallet not found on this device. Please re-import your wallet using your 24-word passphrase to continue.
                </AlertDescription>
              </Alert>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!reImportWalletAddress || !passphrase.trim()) {
                  setError('Please enter your 24-word passphrase');
                  return;
                }

                setError(null);
                setAuthStep('Re-importing wallet...');

                // Normalize passphrase to lowercase (like in registration)
                const normalizedPassphrase = passphrase.trim().toLowerCase();
                const result = await reImportWallet(reImportWalletAddress, normalizedPassphrase);
                
                if (result.success) {
                  toast({
                    title: 'Wallet Imported',
                    description: 'Your wallet has been successfully imported to this device.',
                  });
                  setLoginState('username');
                  setPassphrase('');
                  // Redirect to dashboard
                  if (typeof window !== 'undefined') {
                    router.push('/dashboard');
                  }
                } else {
                  setError(result.error || 'Failed to import wallet');
                  setAuthStep('');
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passphrase">24-Word Passphrase</Label>
                  <textarea
                    id="passphrase"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your 24-word passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value.trim().toLowerCase())}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Enter the 24-word passphrase you used when creating this wallet
                  </p>
                </div>

                {error && error !== 'WALLET_NOT_FOUND' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {authStep && (
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {authStep}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setLoginState('username');
                      setPassphrase('');
                      setError(null);
                      setReImportWalletAddress(null);
                    }}
                    disabled={authLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={authLoading}>
                    {authLoading ? 'Importing...' : 'Import Wallet'}
                  </Button>
                </div>
              </form>
            </div>
          ) : loginState === 'passkey' ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {authStep || 'Complete passkey authentication using your device'}
                </AlertDescription>
              </Alert>
              {authStep && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {authStep}
                </div>
              )}
              {displayError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setLoginState('passphrase');
                  setAuthStep('');
                  setError(null);
                  setIsLookingUpUser(false);
                }}
                disabled={authLoading}
              >
                Use Passphrase Instead
              </Button>
            </div>
          ) : loginState === 'passphrase' ? (
            <>
              {displayError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}
              <PassphraseVerification
                username={username}
                walletAddress={walletAddress || undefined}
                onVerified={handlePassphraseVerified}
                onCancel={() => {
                  setLoginState('username');
                  setError(null);
                  setIsLookingUpUser(false);
                }}
                error={displayError}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              {displayError && displayError !== 'WALLET_NOT_FOUND' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-slate-500">
                Enter your username, then authenticate with your passkey
              </p>
            </div>

            {authStep && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {authStep}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Secure Authentication
              </Badge>
            </div>
            <p className="text-xs text-center text-slate-500">
              Your passkey is used to decrypt your encrypted secret seed securely.
            </p>
          </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
