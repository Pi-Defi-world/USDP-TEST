'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { idbSet, STORES } from '@/lib/storage/idb';
import { generateAesKey, aesEncrypt, exportCryptoKey } from '@/lib/crypto/client-crypto';
import { apiClient } from '@/lib/api/client';
import { Wallet, Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState<'pi-auth' | 'manual' | 'passphrase' | 'passkey' | 'success'>('pi-auth');                                                     
  const [passphrase, setPassphrase] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const { toast } = useToast();
  const { 
    startPasskeyRegistration, 
    verifyPasskeyRegistration, 
    isLoading: authLoading,
    error: authError,
  } = useAuthStore();
  const { setWalletAddress: setWallet } = useWalletStore();

  

    const handlePiAuth = async () => {
    toast({
      title: 'Coming Soon',
      description: 'Pi Network authentication is coming soon. Please use the Import Wallet option below.',
      variant: 'default',
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCheckingUsername(true);

    if (!username.trim() || !userDisplayName.trim()) {
      setError('Please fill in all fields');
      setIsCheckingUsername(false);
      return;
    }

    const trimmedUsername = username.trim();

    // Check if username already exists in the database
    try {
      const userCheckResponse = await apiClient.findUserByUsername(trimmedUsername);
      
      if (userCheckResponse.success) {
        // Username exists - show error
        setError('This username is already taken. Please choose a different username.');
        setIsCheckingUsername(false);
        return;
      }
    } catch (err) {
      // Check if error is a 404 (user not found) - this is expected and means we can proceed
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorWithStatus = err as Error & { status?: number };
      const statusCode = errorWithStatus?.status;
      
      // 404 means user doesn't exist, which is good - we can proceed with registration
      if (statusCode === 404 || errorMessage.includes('User not found') || errorMessage.includes('404')) {
        // User doesn't exist - this is good, we can proceed with registration
        setIsCheckingUsername(false);
        setStep('passphrase');
        return;
      }
      
      // For other errors, show error message
      console.error('Error checking username:', err);
      setError('Failed to check username availability. Please try again.');
      setIsCheckingUsername(false);
      return;
    }

    // If we get here without error and without success, something unexpected happened
    setIsCheckingUsername(false);
    setStep('passphrase');
  };

  const handlePassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const words = passphrase.trim().toLowerCase().split(/\s+/);
      if (words.length !== 24) {
        throw new Error('Passphrase must contain exactly 24 words');
      }

      setAuthStep('Deriving wallet address...');
      
      const response = await fetch('/api/passphrase/derive-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passphrase }),
      });

      if (!response.ok) {
        throw new Error('Failed to derive wallet address');
      }

      const { walletAddress: derivedWalletAddress } = await response.json();
      
      setWalletAddress(derivedWalletAddress);
      setStep('passkey');
      
      toast({
        title: 'Wallet Address Generated',
        description: `Your wallet: ${derivedWalletAddress.substring(0, 8)}...${derivedWalletAddress.substring(-8)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process passphrase');
      setAuthStep('');
    }
  };

  const handlePasskeyRegistration = async () => {
    setError(null);
    setAuthStep('Starting passkey registration...');

    try {
      if (typeof window !== 'undefined' && !window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }
      
      if (!walletAddress) {
        throw new Error('Wallet address not derived from passphrase');
      }
      
      if (typeof window === 'undefined') {
        throw new Error('Cannot access localStorage during server-side rendering');                                                                           
      }
      
      if (!username || !userDisplayName) {
        throw new Error('Username and display name are required');
      }
      
      let sessionId = typeof window !== 'undefined' ? localStorage.getItem('pi_session_id') : null;
      sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;                                                            
      localStorage.setItem('pi_session_id', sessionId);

      const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;
      await fetch(`${SERVER_BASE_URL}/api/auth/pi-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ 
          piAccessToken: '',
          piUid: `manual_${username}_${Date.now()}`,   
          piUsername: username
        }),
      });
      
      console.log(' Using manual registration session:', sessionId);
      
      if (!sessionId) {
        throw new Error('Session ID not found.');
      }
      
       
      setAuthStep('Requesting passkey registration...');
      const registrationOptions = await startPasskeyRegistration(walletAddress);
      
      if (!registrationOptions.success || !registrationOptions.data) {
        throw new Error(registrationOptions.error || 'Registration failed');
      }

    
      setAuthStep('Creating passkey credential...');
      let credential;
      
      
      const base64urlToUint8Array = (base64url: string) => {
        if (typeof window === 'undefined') {
          throw new Error('This function requires browser APIs');
        }
        const base64 = base64url
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
        const binaryString = atob(base64);
        return Uint8Array.from(binaryString, c => c.charCodeAt(0));
      };

      const regData = registrationOptions.data as {
        challenge: string;
        rp: { id: string; name: string };
        user: { id: string; name: string; displayName: string };
        pubKeyCredParams: PublicKeyCredentialParameters[];
        timeout: number;
        attestation: AttestationConveyancePreference;
        excludeCredentials: Array<{ id: string }>;
        authenticatorSelection: AuthenticatorSelectionCriteria;
      };

      const publicKeyCredentialCreationOptions = {
          challenge: base64urlToUint8Array(regData.challenge),
          rp: regData.rp,
          user: {
            id: base64urlToUint8Array(regData.user.id),
            name: regData.user.name,
            displayName: regData.user.displayName,
          },
          pubKeyCredParams: regData.pubKeyCredParams,
          timeout: regData.timeout,
          attestation: regData.attestation,
          excludeCredentials: regData.excludeCredentials.map((cred: { id: string }) => ({
            id: base64urlToUint8Array(cred.id),
            type: 'public-key' as const,
          })),
          authenticatorSelection: regData.authenticatorSelection,
        };

      try {
        if (typeof window === 'undefined' || !navigator?.credentials) {
          throw new Error('WebAuthn is not available in this environment');
        }
        credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        }) as PublicKeyCredential;
        
        console.log('WebAuthn credential created:', credential);
      } catch (webauthnError) {
        console.error('WebAuthn error:', webauthnError);
        
        // Check if this is a permissions policy error in iframe
        if (webauthnError instanceof Error && webauthnError.name === 'NotAllowedError') {
          const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
          if (isInIframe && webauthnError.message.includes('publickey-credentials-create')) {
            // Try to work around iframe restrictions by redirecting to a popup window
            throw new Error('WebAuthn cannot be used in the sandbox iframe due to browser security restrictions. Please open the app in Pi Browser (not the sandbox iframe) or contact your developer to enable WebAuthn in the sandbox environment.');
          } else {
            throw new Error('WebAuthn registration failed: ' + webauthnError.message);
          }
        }
        
        throw new Error(`WebAuthn registration failed: ${webauthnError instanceof Error ? webauthnError.message : 'Unknown error'}`);
      }
      
      // Verify registration
      setAuthStep('Verifying registration...');
      const verifyResult = await verifyPasskeyRegistration({
        walletAddress: walletAddress,
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array((credential as PublicKeyCredential & { rawId: ArrayBuffer }).rawId)),
          response: {
            clientDataJSON: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).clientDataJSON)),
            attestationObject: Array.from(new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject)),
          },
          type: credential.type,
        },
        passphrase: passphrase,
      });
      
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Registration verification failed');
      }

      // Derive seed from passphrase and store encrypted in IndexedDB
      setAuthStep('Encrypting and storing wallet...');
      
      // Derive seed from passphrase
      const deriveResponse = await fetch('/api/passphrase/derive-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });

      if (!deriveResponse.ok) {
        throw new Error('Failed to derive wallet from passphrase');
      }

      const { secretSeed } = await deriveResponse.json();

      // Generate random AES key and encrypt seed
      const aesKey = await generateAesKey();
      const { ciphertext, iv } = await aesEncrypt(aesKey, secretSeed);
      const rawAesKey = await exportCryptoKey(aesKey);

      // Store encrypted seed and AES key in IndexedDB
      await idbSet(STORES.ENCRYPTED_SEEDS, walletAddress, {
        ciphertext: Array.from(ciphertext),
        iv: Array.from(iv),
      });
      await idbSet(STORES.AES_KEYS, walletAddress, Array.from(rawAesKey));

      // Update wallet store
      setWallet(walletAddress);

      setStep('success');
      toast({
        title: 'Registration Complete',
        description: 'Your account has been successfully created.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey registration failed');
      setAuthStep('');
    }
  };

  const displayError = authError || error;
  const isLoading = authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Wallet className="h-6 w-6 text-white" />
          </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {step === 'pi-auth' && 'Choose your authentication method'}      
            {step === 'manual' && 'Import your wallet'}
            {step === 'passphrase' && 'Enter your 24-word passphrase'}
            {step === 'passkey' && 'Register your passkey'}
            {step === 'success' && 'Account created!'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

                    {step === 'pi-auth' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Choose your authentication method to get started.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handlePiAuth} 
                className="w-full" 
                disabled={true}
                variant="outline"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Authenticate with Pi Network</span>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
                    Or
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setStep('manual')}
                className="w-full"
              >
                Import Wallet
              </Button>
            </div>
          )}

          {step === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={userDisplayName}
                  onChange={(e) => setUserDisplayName(e.target.value)}
                  required
                />
              </div>

              {isCheckingUsername && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking username availability...
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isCheckingUsername}>
                {isCheckingUsername ? 'Checking...' : isLoading ? 'Processing...' : 'Continue'}
              </Button>
              
              <Button
                type="button"
                onClick={() => setStep('pi-auth')}
                variant="outline"
                className="w-full"
                disabled={isCheckingUsername}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'passphrase' && (
            <form onSubmit={handlePassphraseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase">24-Word Passphrase</Label>
                <Input
                  id="passphrase"
                  type="text"
                  placeholder="Enter your 24-word passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value.trim().toLowerCase())}
                  required
                />
                <p className="text-xs text-slate-500">
                  Your passphrase will generate your wallet address. It will be encrypted and stored securely on your local device.
                </p>
              </div>

              {authStep && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {authStep}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Generating wallet...' : 'Generate Wallet & Continue'}
              </Button>
            </form>
          )}

          {step === 'passkey' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-blue-600" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Register a passkey to secure your account
                </p>
                <Badge variant="outline" className="w-full justify-center">
                  Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </Badge>
              </div>
              
              {authStep && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {authStep}
                </div>
              )}
              
              <Button onClick={handlePasskeyRegistration} className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering Passkey...' : 'Register Passkey'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('passphrase')} 
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Welcome to Zyra!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your account has been created successfully.
                </p>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center">
                  Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </Badge>
              </div>

              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
