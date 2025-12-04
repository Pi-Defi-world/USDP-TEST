'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Wallet, Copy, Check, AlertCircle, Loader2, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { generateAesKey, aesEncrypt, exportCryptoKey } from '@/lib/crypto/client-crypto';
import { idbSet, STORES } from '@/lib/storage/idb';
import { PasswordSetupDialog } from '@/components/PasswordSetupDialog';

interface AccountServiceCardProps {
  onWalletImported?: (walletAddress: string) => void;
}

export function AccountServiceCard({ onWalletImported }: AccountServiceCardProps) {
  const [passphrase, setPassphrase] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [step, setStep] = useState<'import' | 'complete'>('import');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [derivedWallet, setDerivedWallet] = useState<{ walletAddress: string; secretSeed: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { setWalletAddress, fetchBalance } = useWalletStore();

  const normalizeMnemonic = (value: string) =>
    value
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .join(' ');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passphrase.trim() && !secretKey.trim()) {
      setError('Please enter either a 24-word passphrase or secret key');
      return;
    }

    if (passphrase.trim()) {
      const words = normalizeMnemonic(passphrase).split(/\s+/);
      if (words.length !== 24) {
        setError('Passphrase must contain exactly 24 words');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setDerivedWallet(null);

    try {
      const response = await fetch('/api/account/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mnemonic: passphrase.trim() ? normalizeMnemonic(passphrase) : undefined,
          secret: secretKey.trim() || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.publicKey && data.secret) {
        setDerivedWallet({
          walletAddress: data.publicKey,
          secretSeed: data.secret,
        });
        setShowPasswordDialog(true);
        toast({
          title: 'Wallet Derived Successfully',
          description: 'Please set a PIN/password to encrypt and store your wallet.',
        });
      } else {
        throw new Error(data.error || 'Failed to import account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import account';
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

  const handlePasswordSet = async (password: string) => {
    if (!derivedWallet) {
      throw new Error('Wallet not derived. Please import wallet first.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const { walletAddress, secretSeed } = derivedWallet;

      // If user is authenticated, link wallet to user account via AccountService
      if (isAuthenticated && user?.id) {
        try {
          const { importWallet } = useAuthStore.getState();
          const mnemonic = passphrase.trim() ? normalizeMnemonic(passphrase) : '';
          if (mnemonic) {
            const importResult = await importWallet(user.id, mnemonic);
            
            if (!importResult.success) {
              throw new Error(importResult.error || 'Failed to link wallet to user account');
            }

            // Verify wallet address matches
            if (importResult.data?.publicKey && importResult.data.publicKey !== walletAddress) {
              throw new Error('Wallet address mismatch. Please check your passphrase.');
            }
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
          throw err;
        }
      }

      // Generate AES key and encrypt secret seed
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
      if (isAuthenticated && user?.id && passphrase.trim()) {
        try {
          const { storeEncryptedSecret } = useAuthStore.getState();
          await storeEncryptedSecret(user.id, walletAddress, normalizeMnemonic(passphrase), password);
        } catch (err) {
          console.warn('Failed to store server-side encrypted secret:', err);
        }
      }

      setStep('complete');
      setShowPasswordDialog(false);
      
      // Update wallet store
      setWalletAddress(walletAddress);
      await fetchBalance(walletAddress);
      
      toast({
        title: 'Wallet Imported Successfully',
        description: isAuthenticated 
          ? 'Your wallet has been linked to your account, encrypted, and stored securely.'
          : 'Your wallet has been encrypted and stored securely.',
      });

      onWalletImported?.(walletAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt and store wallet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err; // Re-throw to let dialog handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setPassphrase('');
    setSecretKey('');
    setStep('import');
    setDerivedWallet(null);
    setError(null);
    setShowPasswordDialog(false);
  };

  return (
    <Card className="bg-panel border-[#1C1F25]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
          <Shield className="h-5 w-5 text-gradient-blue" />
          Account Service
        </CardTitle>
        <CardDescription className="text-[#707784]">
          Import your account using a 24-word passphrase or secret key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'import' && (
          <>
            <Alert className="bg-yellow-950/20 border-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-[#707784]">
                Import your Pi Network wallet to access all features. Your credentials are processed securely and never stored in plain text.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase" className="text-[#E9ECEF]">24-Word Passphrase</Label>
                <textarea
                  id="passphrase"
                  className="flex min-h-[100px] w-full rounded-md border border-[#1C1F25] bg-panel-light px-3 py-2 text-sm text-[#E9ECEF] ring-offset-background placeholder:text-[#707784] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#1C1F25]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-panel px-2 text-[#707784]">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret-key" className="text-[#E9ECEF]">Secret Key (optional)</Label>
                <Input
                  id="secret-key"
                  type="password"
                  placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="bg-panel-light border-[#1C1F25]"
                />
                <p className="text-xs text-[#707784]">
                  Alternative: Enter your secret key directly
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || (!passphrase.trim() && !secretKey.trim())}
                className="w-full bg-gradient-blue glow-blue-hover btn-press"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Import Account
                  </>
                )}
              </Button>
            </form>
          </>
        )}


        {step === 'complete' && derivedWallet && (
          <>
            <Alert className="bg-green-950/20 border-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription className="text-[#E9ECEF]">
                <strong>Wallet Imported Successfully!</strong>
                <p className="text-sm text-[#707784] mt-1">
                  Your wallet has been encrypted and stored securely. You can now use it for transactions.
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
                  onClick={() => handleCopy(derivedWallet.walletAddress)}
                  className="p-1 h-auto"
                >
                  {copied ? (
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

            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full border-[#1C1F25]"
            >
              Import Another Wallet
            </Button>
          </>
        )}
      </CardContent>

      {/* Password Setup Dialog */}
      <PasswordSetupDialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            // If dialog is closed and not loading, reset to import step
            handleReset();
          }
          setShowPasswordDialog(open);
        }}
        onPasswordSet={handlePasswordSet}
        isLoading={isLoading}
      />
    </Card>
  );
}

