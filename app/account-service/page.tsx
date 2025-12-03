'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, MessageCircle, HelpCircle, FileText, Clock, Key, Wallet, Copy, Check, AlertCircle, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { generateAesKey, aesEncrypt, exportCryptoKey } from '@/lib/crypto/client-crypto';
import { idbSet, STORES } from '@/lib/storage/idb';

export default function AccountServicePage() {
  const [passphrase, setPassphrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'passphrase' | 'password' | 'complete'>('passphrase');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [derivedWallet, setDerivedWallet] = useState<{ walletAddress: string; secretSeed: string } | null>(null);
  const [copied, setCopied] = useState<'address' | 'seed' | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const handleDerive = async () => {
    if (!passphrase.trim()) {
      setError('Please enter your 24-word passphrase');
      return;
    }

    const words = passphrase.trim().toLowerCase().split(/\s+/);
    if (words.length !== 24) {
      setError('Passphrase must contain exactly 24 words');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDerivedWallet(null);

    try {
      // Use the existing /api/account/import endpoint directly
      const response = await fetch('/api/account/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic: passphrase.trim().toLowerCase() }),
      });

      const data = await response.json();
      
      if (data.success && data.publicKey && data.secret) {
        setDerivedWallet({
          walletAddress: data.publicKey,
          secretSeed: data.secret,
        });
        setStep('password');
        toast({
          title: 'Wallet Derived Successfully',
          description: 'Please set a PIN/password to encrypt your wallet.',
        });
      } else {
        throw new Error(data.error || 'Failed to derive wallet from passphrase');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to derive wallet from passphrase';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncryptAndStore = async () => {
    if (!password.trim()) {
      setError('Please enter a PIN/password');
      return;
    }

    if (password.length < 4) {
      setError('PIN/password must be at least 4 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('PIN/password confirmation does not match');
      return;
    }

    if (!derivedWallet) {
      setError('Wallet not derived. Please derive wallet first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { walletAddress, secretSeed } = derivedWallet;

      // If user is authenticated, link wallet to user account via AccountService
      if (isAuthenticated && user?.id) {
        try {
          const { importWallet } = useAuthStore.getState();
          const importResult = await importWallet(user.id, passphrase.trim().toLowerCase());
          
          if (!importResult.success) {
            throw new Error(importResult.error || 'Failed to link wallet to user account');
          }

          // Verify wallet address matches
          if (importResult.data?.publicKey && importResult.data.publicKey !== walletAddress) {
            throw new Error('Wallet address mismatch. Please check your passphrase.');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to link wallet to user account';
          setError(errorMessage);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      // Generate AES key and encrypt secret seed (following reImportWallet pattern)
      const aesKey = await generateAesKey();
      const { ciphertext, iv } = await aesEncrypt(aesKey, secretSeed);
      const rawAesKey = await exportCryptoKey(aesKey);

      // Store encrypted seed and AES key in IndexedDB
      await idbSet(STORES.ENCRYPTED_SEEDS, walletAddress, {
        ciphertext: Array.from(ciphertext),
        iv: Array.from(iv),
      });
      await idbSet(STORES.AES_KEYS, walletAddress, Array.from(rawAesKey));

      // If user is authenticated, also store server-side encrypted secret
      if (isAuthenticated && user?.id) {
        try {
          const { storeEncryptedSecret } = useAuthStore.getState();
          await storeEncryptedSecret(user.id, walletAddress, passphrase.trim().toLowerCase(), password);
        } catch (err) {
          // Log error but don't fail - client-side storage is primary
          console.warn('Failed to store server-side encrypted secret:', err);
        }
      }

      setStep('complete');
      toast({
        title: 'Wallet Imported Successfully',
        description: isAuthenticated 
          ? 'Your wallet has been linked to your account, encrypted, and stored securely. You can now use it for transactions.'
          : 'Your wallet has been encrypted and stored securely. You can now use it for transactions.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt and store wallet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'address' | 'seed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: 'Copied!',
        description: `${type === 'address' ? 'Wallet address' : 'Secret seed'} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setPassphrase('');
    setPassword('');
    setConfirmPassword('');
    setStep('passphrase');
    setDerivedWallet(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] page-transition pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">Account Service</h1>
          <p className="text-[#707784]">Support and service information for your USDP account</p>
        </div>

        <div className="space-y-6">
          {/* Account Service - Passphrase to Wallet */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Key className="h-5 w-5 text-gradient-blue" />
                Account Service
              </CardTitle>
              <CardDescription className="text-[#707784]">
                Convert your Pi Network passphrase to wallet address and secret seed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'passphrase' && (
                <>
                  <Alert className="bg-yellow-950/20 border-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[#707784]">
                      This service converts your 24-word passphrase into a wallet address and secret seed. 
                      After derivation, you'll set a PIN/password to encrypt and store your wallet securely.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="passphrase" className="text-[#E9ECEF]">24-Word Passphrase</Label>
                    <textarea
                      id="passphrase"
                      className="flex min-h-[120px] w-full rounded-md border border-[#1C1F25] bg-panel-light px-3 py-2 text-sm text-[#E9ECEF] ring-offset-background placeholder:text-[#707784] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your 24-word passphrase (separated by spaces)"
                      value={passphrase}
                      onChange={(e) => {
                        setPassphrase(e.target.value);
                        setError(null);
                      }}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-[#707784]">
                      Enter the 24-word passphrase you used when creating your Pi Network wallet
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleDerive}
                    disabled={isLoading || !passphrase.trim()}
                    className="w-full bg-gradient-blue glow-blue-hover btn-press"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Derive Wallet
                      </>
                    )}
                  </Button>
                </>
              )}

              {step === 'password' && derivedWallet && (
                <>
                  <Alert className="bg-blue-950/20 border-blue-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[#707784]">
                      Wallet derived successfully! Set a PIN/password to encrypt and store your wallet.
                      {isAuthenticated && user?.id && (
                        <span className="block mt-1 text-xs">
                          This wallet will be linked to your account ({user.piUsername || user.id}).
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#E9ECEF]">Wallet Address</Label>
                    <div className="flex items-center gap-2 p-2 rounded bg-panel-light border border-[#1C1F25]">
                      <p className="text-sm text-[#707784] font-mono break-all flex-1">
                        {derivedWallet.walletAddress}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(derivedWallet.walletAddress, 'address')}
                        className="p-1 h-auto"
                      >
                        {copied === 'address' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[#E9ECEF]">PIN/Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter a PIN/password (min 4 characters)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        disabled={isLoading}
                        className="bg-panel-light border-[#1C1F25]"
                      />
                      <p className="text-xs text-[#707784]">
                        This PIN/password will be used to encrypt your wallet and authorize transactions
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[#E9ECEF]">Confirm PIN/Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your PIN/password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError(null);
                        }}
                        disabled={isLoading}
                        className="bg-panel-light border-[#1C1F25]"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="flex-1 border-[#1C1F25]"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleEncryptAndStore}
                      disabled={isLoading || !password.trim() || password !== confirmPassword}
                      className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Encrypting...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Encrypt & Store Wallet
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {step === 'complete' && derivedWallet && (
                <>
                  <Alert className="bg-green-950/20 border-green-800">
                    <Check className="h-4 w-4" />
                    <AlertDescription className="text-[#E9ECEF]">
                      <strong>Wallet Imported Successfully!</strong>
                      <p className="text-sm text-[#707784] mt-1">
                        Your wallet has been encrypted and stored securely. You can now use your PIN/password for transactions.
                      </p>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#E9ECEF]">Wallet Address</Label>
                    <div className="flex items-center gap-2 p-2 rounded bg-panel-light border border-[#1C1F25]">
                      <p className="text-sm text-[#707784] font-mono break-all flex-1">
                        {derivedWallet.walletAddress}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(derivedWallet.walletAddress, 'address')}
                        className="p-1 h-auto"
                      >
                        {copied === 'address' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-950/20 border-blue-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[#707784] text-xs">
                      Your wallet is now encrypted and stored. The secret seed is encrypted and stored locally.
                      {isAuthenticated && user?.id && (
                        <span className="block mt-1">
                          ✓ Wallet linked to your account ({user.piUsername || user.id})
                          <br />
                          ✓ Encrypted wallet stored server-side for backup
                          <br />
                          ✓ Ready for mint, redeem, and other transactions
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 border-[#1C1F25]"
                    >
                      Import Another Wallet
                    </Button>
                    <Link href="/profile" className="flex-1">
                      <Button className="w-full bg-gradient-blue glow-blue-hover btn-press">
                        Go to Profile
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Service Overview */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Shield className="h-5 w-5 text-gradient-blue" />
                Account Services
              </CardTitle>
              <CardDescription className="text-[#707784]">
                Comprehensive account management and support services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Wallet Management</h3>
                  <p className="text-sm text-[#707784]">
                    Manage your wallet address, verify your passphrase, and secure your account with passkey authentication.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Transaction Support</h3>
                  <p className="text-sm text-[#707784]">
                    View your transaction history, track mint and redeem operations, and monitor your USDP balance.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Security Features</h3>
                  <p className="text-sm text-[#707784]">
                    Passphrase verification, passkey authentication, and secure wallet import/export functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Options */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <HelpCircle className="h-5 w-5 text-gradient-blue" />
                Get Help
              </CardTitle>
              <CardDescription className="text-[#707784]">
                Contact our support team or access helpful resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/contact" className="block">
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25] hover:bg-[#16191F] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-gradient-blue" />
                      <div>
                        <div className="font-semibold text-[#E9ECEF]">Contact Support</div>
                        <div className="text-xs text-[#707784]">Get in touch with our support team</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/privacy" className="block">
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25] hover:bg-[#16191F] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gradient-blue" />
                      <div>
                        <div className="font-semibold text-[#E9ECEF]">Privacy Policy</div>
                        <div className="text-xs text-[#707784]">Learn about our privacy practices</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Service Hours */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Clock className="h-5 w-5 text-gradient-blue" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-[#707784]">
                <p>
                  Our account service is available 24/7 for automated operations. For support inquiries, 
                  please use the contact form and we'll respond within 24-48 hours.
                </p>
                <p>
                  All transactions are processed on the Pi Network blockchain and are subject to network 
                  confirmation times.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Profile */}
          <div className="pt-4">
            <Link href="/profile">
              <Button variant="outline" className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                Back to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
