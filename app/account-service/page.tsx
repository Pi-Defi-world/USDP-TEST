'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Copy, Check, AlertCircle, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { WalletFundingDialog } from '@/components/WalletFundingDialog';

export default function AccountServicePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWallet, setGeneratedWallet] = useState<{
    publicKey: string;
    secretSeed: string;
    seedAmount: string;
    transactionHash: string;
  } | null>(null);
  const [showSecretSeed, setShowSecretSeed] = useState(false);
  const [copied, setCopied] = useState<'address' | 'seed' | null>(null);
  const [showFundingDialog, setShowFundingDialog] = useState(false);
  
  const { toast } = useToast();
  const { isAuthenticated, generateWallet } = useAuthStore();
  const { setWalletAddress, fetchBalance } = useWalletStore();

  const handleGenerateWallet = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to generate a wallet');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedWallet(null);

    try {
      const result = await generateWallet();
      
      if (result.success && result.data) {
        setGeneratedWallet({
          publicKey: result.data.publicKey,
          secretSeed: result.data.secretSeed,
          seedAmount: result.data.seedAmount || '2',
          transactionHash: result.data.transactionHash || '',
        });
        
        // Update wallet store
        setWalletAddress(result.data.publicKey);
        await fetchBalance(result.data.publicKey);
        
        toast({
          title: 'Wallet Generated Successfully!',
          description: `Your wallet has been created and seeded with ${result.data.seedAmount || '2'} Test-Pi.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate wallet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate wallet';
      setError(errorMessage);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleAcknowledgeSecret = () => {
    // Show funding dialog after acknowledging secret seed is saved
    setShowFundingDialog(true);
  };
  
  const handleFundingDialogContinue = () => {
    // After dialog, clear wallet generation state but keep wallet address in store
    setGeneratedWallet(null);
    setShowSecretSeed(false);
    setError(null);
    setShowFundingDialog(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[#E9ECEF]">Authentication Required</CardTitle>
            <CardDescription className="text-[#707784]">
              Please sign in to access account services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#707784] text-center mb-4">
              You need to be authenticated to generate wallets.
            </p>
            <Link href="/profile">
              <Button className="w-full bg-gradient-blue glow-blue-hover btn-press">
                Go to Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wallet details after generation
  if (generatedWallet) {
    return (
      <div className="min-h-screen bg-[#000000] page-transition pb-20 lg:pb-0">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Check className="h-5 w-5 text-green-500" />
                Wallet Generated Successfully
              </CardTitle>
              <CardDescription className="text-[#707784]">
                Your wallet has been created and seeded. Please save your secret seed securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-red-950/20 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-[#E9ECEF]">
                  <strong className="text-red-400">CRITICAL: Save Your Secret Seed</strong>
                  <p className="text-sm text-[#707784] mt-2">
                    Your secret seed is shown below. This is the ONLY time it will be displayed. 
                    You MUST save it securely. If you lose it, you will lose access to your wallet and funds.
                    We cannot recover it for you.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-[#E9ECEF]">Wallet Address (Public Key)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generatedWallet.publicKey, 'address')}
                    className="p-1 h-auto"
                  >
                    {copied === 'address' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-[#707784]" />
                    )}
                  </Button>
                </div>
                <div className="p-3 rounded bg-panel-light border border-[#1C1F25]">
                  <p className="text-sm text-[#707784] font-mono break-all">
                    {generatedWallet.publicKey}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-[#E9ECEF]">Secret Seed (PRIVATE - SAVE THIS)</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecretSeed(!showSecretSeed)}
                      className="p-1 h-auto"
                    >
                      {showSecretSeed ? (
                        <EyeOff className="h-4 w-4 text-[#707784]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#707784]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generatedWallet.secretSeed, 'seed')}
                      className="p-1 h-auto"
                    >
                      {copied === 'seed' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#707784]" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-3 rounded bg-red-950/10 border-2 border-red-800">
                  <p className={`text-sm font-mono break-all ${showSecretSeed ? 'text-[#E9ECEF]' : 'text-[#707784]'}`}>
                    {showSecretSeed ? generatedWallet.secretSeed : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </p>
                </div>
                <p className="text-xs text-[#707784]">
                  Store this in a secure password manager or write it down and keep it safe. Never share it with anyone.
                </p>
              </div>

              {generatedWallet.seedAmount && (
                <Alert className="bg-green-950/20 border-green-800">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-[#707784]">
                    Wallet seeded with {generatedWallet.seedAmount} Test-Pi
                    {generatedWallet.transactionHash && (
                      <span className="block mt-1 text-xs font-mono">
                        TX: {generatedWallet.transactionHash}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t border-[#1C1F25]">
                <Button
                  onClick={handleAcknowledgeSecret}
                  className="w-full bg-gradient-blue glow-blue-hover btn-press"
                >
                  I Have Saved My Secret Seed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Wallet Funding Dialog */}
        <WalletFundingDialog
          open={showFundingDialog}
          onOpenChange={setShowFundingDialog}
          walletAddress={generatedWallet.publicKey}
          onContinue={handleFundingDialogContinue}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] page-transition pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">Account Service</h1>
          <p className="text-[#707784]">Generate your USDP wallet</p>
        </div>

        <div className="space-y-6">
          {/* Wallet Generation Card */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Wallet className="h-5 w-5 text-gradient-blue" />
                Create New Wallet
              </CardTitle>
              <CardDescription className="text-[#707784]">
                Generate a new wallet to start using USDP services. Any existing wallet will be cleared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert className="bg-yellow-950/20 border-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[#707784]">
                  <strong className="text-[#E9ECEF]">Create a New Wallet</strong>
                  <p className="text-sm mt-1">
                    We&apos;ll create a new Stellar/Pi wallet for you and automatically seed it with Test-Pi. 
                    You&apos;ll receive your wallet address and secret seed. 
                    <strong className="text-yellow-400"> Save your secret seed securely - it cannot be recovered!</strong>
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Note:</strong> If you already have a wallet, creating a new one will clear your old wallet from the database. 
                    You will lose access to any funds in your old wallet if you don&apos;t have the secret seed.
                  </p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGenerateWallet}
                disabled={isGenerating}
                className="w-full h-14 text-lg font-semibold bg-gradient-blue glow-blue-hover btn-press"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Generate New Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Shield className="h-5 w-5 text-gradient-blue" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                <h3 className="font-semibold text-[#E9ECEF] mb-2">Non-Custodial Wallet</h3>
                <p className="text-sm text-[#707784]">
                  Your wallet is non-custodial. We never store your secret seed. 
                  You are responsible for keeping it safe and secure.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                <h3 className="font-semibold text-[#E9ECEF] mb-2">Secret Seed Security</h3>
                <p className="text-sm text-[#707784]">
                  Your secret seed is required for every transaction. Store it in a secure password manager 
                  or write it down and keep it in a safe place. Never share it with anyone.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                <h3 className="font-semibold text-[#E9ECEF] mb-2">Lost Secret Seed?</h3>
                <p className="text-sm text-[#707784]">
                  If you lose your secret seed, you can create a new wallet. However, you will lose access 
                  to any funds in your old wallet. We cannot recover lost secret seeds. Creating a new wallet 
                  will clear your old wallet from our database.
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
