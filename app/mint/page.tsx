'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { PasswordPromptDialog } from '@/components/PasswordPromptDialog';
import { usePriceStore } from '@/lib/store/priceStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { usePi } from '@/components/providers/pi-provider';
import { apiClient } from '@/lib/api/client';
import { TestnetBadge } from '@/components/TestnetBadge';
import { Loader2, AlertCircle, CheckCircle, Wallet, Coins, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MintPage() {
  const { isAuthenticated } = usePi();
  const { walletAddress, balance, fetchBalance } = useWalletStore();
  const { piPrice, fetchPiPrice } = usePriceStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<'pi' | null>('pi');

  const { toast } = useToast();
  const { retrieveKeypairForTransaction, setError: clearAuthError } = useAuthStore();
  const isTestnet = apiClient.isTestnetMode();

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      fetchBalance(walletAddress);
      fetchPiPrice();
    }
  }, [isAuthenticated, walletAddress, fetchBalance, fetchPiPrice]);

  // Calculate USDP output and fees
  const OVERCOLLATERALIZATION_RATIO = 1.15;
  const piAmount = parseFloat(amount) || 0;
  const usdValue = piAmount * (piPrice || 0);
  const mintFee = usdValue * 0.003;
  const usdpOutput = usdValue - mintFee;
  const piRequired = piAmount * OVERCOLLATERALIZATION_RATIO;
  const overcollateralizationAmount = piRequired - piAmount;
  // Calculate peg rate: 1 USDP = X Pi (since 1 USDP = 1 USD, and 1 USD = 1/piPrice Pi)
  const pegRate = piPrice ? (1 / piPrice).toFixed(6) : '0.000000';

  const piBalance = parseFloat(balance?.pi?.amount || '0');
  const hasSufficientBalance = piBalance >= piRequired;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleMaxClick = () => {
    if (piBalance > 0) {
      const maxAmount = piBalance / OVERCOLLATERALIZATION_RATIO;
      setAmount(maxAmount.toFixed(7));
    }
  };

  const handleMint = async () => {
    if (!amount || piAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!hasSufficientBalance) {
      setError('Insufficient Pi balance');
      return;
    }

    if (!walletAddress) {
      setError('Please connect your wallet');
      return;
    }

    setShowConfirmation(true);
  };

  const handlePasswordEntered = async (password: string) => {
    if (!walletAddress) return;

    setIsLoading(true);
    setPasswordError(null);
    setError(null);
    setTransactionResult(null);

    try {
      const keypair = await retrieveKeypairForTransaction(walletAddress, password);
      const result = await apiClient.mint({
        amount: piAmount,
        walletAddress: keypair.walletAddress,
        secretSeed: keypair.secretSeed,
      });

      if (!result.success) {
        throw new Error(result.error || 'Mint transaction failed');
      }

      const transactionData = result.data as { success: boolean; txHash?: string; error?: string } | null;
      setTransactionResult(transactionData || { success: true });
      setShowConfirmation(false);
      setShowPasswordDialog(false);
      
      toast({
        title: 'Mint Successful',
        description: `Successfully minted ${usdpOutput.toFixed(7)} USDP tokens${isTestnet ? ' on testnet' : ''}`,
      });

      await fetchBalance(walletAddress);
      setAmount('');

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Mint transaction failed';
      
      // Check for connection errors
      if (errorMessage.includes('Cannot connect to backend') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('ERR_CONNECTION')) {
        errorMessage = 'Backend server is not running. Please start the backend server on port 3001.';
      }
      
      if (errorMessage.includes('PASSWORD_REQUIRED') || errorMessage.includes('Failed to decrypt')) {
        setPasswordError(errorMessage);
        throw err; // Re-throw to keep dialog open
      } else {
        setError(errorMessage);
        setShowPasswordDialog(false);
        toast({
          title: 'Mint Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMint = async () => {
    if (!walletAddress) return;
    setShowConfirmation(false); // Close confirmation dialog first
    setShowPasswordDialog(true); // Then open password dialog
  };

  if (!isAuthenticated || !walletAddress) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[#E9ECEF]">Wallet Required</CardTitle>
            <CardDescription className="text-[#707784]">
              Please import your wallet to view transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#707784] text-center mb-4">
              You need to import your wallet using the Account Service in your profile to view transaction history.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-gradient-blue glow-blue-hover btn-press"
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (transactionResult) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Mint Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">Transaction Hash:</span>
                <span className="font-mono text-sm text-[#E9ECEF] break-all">{transactionResult.txHash || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">USDP Minted:</span>
                <span className="font-semibold text-gradient-blue text-lg">{usdpOutput.toFixed(7)} USDP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">Fee Paid:</span>
                <span className="text-sm text-[#E9ECEF]">{mintFee.toFixed(7)} USDP</span>
              </div>
            </div>
            <Button 
              onClick={() => setTransactionResult(null)} 
              className="w-full bg-gradient-blue glow-blue-hover btn-press"
            >
              Mint More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <>
        <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
          <Card className="bg-panel border-[#1C1F25] max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-[#E9ECEF]">Confirm Mint Transaction</CardTitle>
              <CardDescription className="text-[#707784]">Review your transaction details before confirming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <div>{error}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null);
                        clearAuthError(null);
                        confirmMint();
                      }}
                      disabled={isLoading}
                      className="mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        'Retry Authentication'
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 p-4 bg-panel-light rounded-lg border border-[#1C1F25]">
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">Pi Amount:</span>
                  <span className="font-semibold text-[#E9ECEF]">{piAmount.toFixed(7)} Pi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">USD Value:</span>
                  <span className="text-sm text-[#E9ECEF]">${usdValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">Mint Fee (0.3%):</span>
                  <span className="text-sm text-[#E9ECEF]">${mintFee.toFixed(7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">USDP Output:</span>
                  <span className="font-semibold text-gradient-blue">{usdpOutput.toFixed(7)} USDP</span>
                </div>
                <div className="border-t border-[#1C1F25] pt-3 mt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#707784]">
                      <span>Base Pi Amount:</span>
                      <span>{piAmount.toFixed(7)} Pi</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#707784]">
                      <span>Extra Pi Locked (15%):</span>
                      <span className="text-orange-400">+{overcollateralizationAmount.toFixed(7)} Pi</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-[#1C1F25]">
                      <span className="text-[#E9ECEF]">Total Pi Required:</span>
                      <span className="text-gradient-blue">{piRequired.toFixed(7)} Pi</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={confirmMint} 
                  disabled={isLoading || showPasswordDialog}
                  className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Mint'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowConfirmation(false);
                    setError(null);
                    clearAuthError(null);
                    setShowPasswordDialog(false);
                  }}
                  disabled={isLoading}
                  className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Password Prompt Dialog - rendered even when confirmation is shown */}
        <PasswordPromptDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          onPasswordEntered={handlePasswordEntered}
          isLoading={isLoading}
          error={passwordError}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] page-transition">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">MINT USDP</h1>
          <p className="text-[#707784]">Convert Pi to USDP</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Choose Funding Source */}
            <div>
              <Label className="text-[#E9ECEF] mb-3 block">Choose Funding Source</Label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedSource('pi')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    selectedSource === 'pi'
                      ? "border-gradient-blue bg-panel-light glow-blue"
                      : "border-[#1C1F25] bg-panel hover:border-[#2A2D35]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-blue flex items-center justify-center">
                        <Coins className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#E9ECEF]">Pi Network</div>
                        <div className="text-xs text-[#707784]">Use your Pi balance</div>
                      </div>
                    </div>
                    {selectedSource === 'pi' && (
                      <div className="h-5 w-5 rounded-full bg-gradient-blue flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Input Panel */}
            <Card className="bg-panel border-[#1C1F25]">
              <CardHeader>
                <CardTitle className="text-[#E9ECEF]">Amount to Deposit</CardTitle>
                <CardDescription className="text-[#707784]">Enter the amount of Pi you want to mint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pi-amount" className="text-[#E9ECEF]">Pi Amount</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMaxClick}
                      className="text-xs text-gradient-blue hover:text-blue-400 h-auto p-1"
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="pi-amount"
                      type="text"
                      placeholder="0.0000000"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={isLoading}
                      className="h-14 text-2xl font-bold bg-panel-light border-[#1C1F25] text-[#E9ECEF] focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <p className="text-xs text-[#707784]">
                    Available: <span className="text-gradient-blue font-semibold">{piBalance.toFixed(7)} Pi</span>
                  </p>
                </div>

                {amount && piAmount > 0 && (
                  <div className="p-4 bg-panel-light rounded-lg border border-[#1C1F25] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#707784]">You&apos;ll receive:</span>
                      <span className="text-xl font-bold text-gradient-blue">{usdpOutput.toFixed(7)} USDP</span>
                    </div>
                    <div className="pt-3 border-t border-[#1C1F25]">
                      <div className="flex items-center justify-between text-xs text-[#707784]">
                        <span>Live peg rate:</span>
                        <span className="text-gradient-blue font-semibold">1 USDP = {pegRate} Pi</span>
                      </div>
                    </div>
                  </div>
                )}

                {!hasSufficientBalance && piAmount > 0 && (
                  <Alert className="bg-yellow-950/20 border-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-[#707784]">
                      Insufficient Pi balance. You need {piRequired.toFixed(7)} Pi but only have {piBalance.toFixed(7)} Pi.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Compliance Notes */}
            <div className="text-xs text-[#707784] leading-relaxed">
              <p>Processing time depends on liquidity provider availability. Transactions are processed on the Pi Network blockchain.</p>
            </div>

            {/* Mint Button */}
            <Button 
              onClick={handleMint} 
              disabled={isLoading || !amount || piAmount <= 0 || !hasSufficientBalance}
              className="w-full h-14 text-lg font-semibold bg-gradient-blue glow-blue-hover btn-press"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Mint USDP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Balance Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-panel border-[#1C1F25] sticky top-20">
              <CardHeader>
                <CardTitle className="text-[#E9ECEF] flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-gradient-blue" />
                  Your Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-[#707784] mb-1">Pi Balance</div>
                  <div className="text-2xl font-bold text-gradient-blue">{piBalance.toFixed(7)}</div>
                  <div className="text-xs text-[#707784] mt-1">
                    ${(piBalance * (piPrice || 0)).toFixed(2)} USD
                  </div>
                </div>
                <div className="pt-4 border-t border-[#1C1F25]">
                  <div className="text-xs text-[#707784] mb-1">USDP Balance</div>
                  <div className="text-2xl font-bold text-[#E9ECEF]">
                    {parseFloat(balance?.zyra?.amount || '0').toFixed(7)}
                  </div>
                  <div className="text-xs text-[#707784] mt-1">
                    ${balance?.zyra?.usdValue || '0.00'} USD
                  </div>
                </div>
                {isTestnet && (
                  <div className="pt-4">
                    <TestnetBadge />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Prompt Dialog */}
      <PasswordPromptDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordEntered={handlePasswordEntered}
        isLoading={isLoading}
        error={passwordError}
      />
    </div>
  );
}

