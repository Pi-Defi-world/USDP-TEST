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
import { Loader2, AlertCircle, CheckCircle, Wallet, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RedeemPage() {
  const { isAuthenticated } = usePi();
  const { walletAddress, balance, fetchBalance } = useWalletStore();
  const { piPrice, fetchPiPrice } = usePriceStore();
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSlippage, setShowSlippage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { toast } = useToast();
  const { retrieveKeypairForTransaction, setError: clearAuthError } = useAuthStore();
  const isTestnet = apiClient.isTestnetMode();

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      fetchBalance(walletAddress);
      fetchPiPrice();
    }
  }, [isAuthenticated, walletAddress, fetchBalance, fetchPiPrice]);

  // Calculate Pi output and fees
  const usdpAmount = parseFloat(amount) || 0;
  const usdValue = usdpAmount;
  const redeemFee = usdValue * 0.003;
  const netUsdValue = usdValue - redeemFee;
  const currentPiPrice = piPrice || 0;
  const piOutput = currentPiPrice > 0 ? netUsdValue / currentPiPrice : 0;
  const exchangeRate = currentPiPrice > 0 ? (1 / currentPiPrice).toFixed(6) : '0.000000';

  const usdpBalance = parseFloat(balance?.zyra?.amount || balance?.usdp?.amount || '0');
  const hasSufficientBalance = usdpBalance >= usdpAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleMaxClick = () => {
    if (usdpBalance > 0) {
      setAmount(usdpBalance.toFixed(7));
    }
  };

  const handleRedeem = async () => {
    if (!amount || usdpAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!hasSufficientBalance) {
      setError('Insufficient USDP balance');
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
      const result = await apiClient.redeem({
        amount: usdpAmount,
        walletAddress: keypair.walletAddress,
        secretSeed: keypair.secretSeed,
      });

      if (!result.success) {
        throw new Error(result.error || 'Redeem transaction failed');
      }

      const transactionData = result.data as { success: boolean; txHash?: string; error?: string } | null;
      setTransactionResult(transactionData || { success: true });
      setShowConfirmation(false);
      setShowPasswordDialog(false);
      
      toast({
        title: 'Redeem Successful',
        description: `Successfully redeemed ${piOutput.toFixed(7)} Pi tokens${isTestnet ? ' on testnet' : ''}`,
      });

      await fetchBalance(walletAddress);
      setAmount('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Redeem transaction failed';
      if (errorMessage.includes('PASSWORD_REQUIRED') || errorMessage.includes('Failed to decrypt')) {
        setPasswordError(errorMessage);
        throw err; // Re-throw to keep dialog open
      } else {
        setError(errorMessage);
        setShowPasswordDialog(false);
        toast({
          title: 'Redeem Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRedeem = async () => {
    if (!walletAddress) return;
    setShowPasswordDialog(true);
  };

  if (!isAuthenticated || !walletAddress) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 page-transition">
        <Card className="bg-panel border-[#1C1F25] max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-[#E9ECEF]">Connect Your Wallet</CardTitle>
            <CardDescription className="text-[#707784]">
              Please connect your Pi Network wallet to redeem USDP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#707784] text-center">
              Use the &quot;Connect Pi&quot; button in the navigation bar to get started.
            </p>
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
              Burn Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">Transaction Hash:</span>
                <span className="font-mono text-sm text-[#E9ECEF] break-all">{transactionResult.txHash || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">Pi Received:</span>
                <span className="font-semibold text-gradient-blue text-lg">{piOutput.toFixed(7)} Pi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#707784]">Fee Paid:</span>
                <span className="text-sm text-[#E9ECEF]">{redeemFee.toFixed(7)} USDP</span>
              </div>
            </div>
            <Button 
              onClick={() => setTransactionResult(null)} 
              className="w-full bg-gradient-blue glow-blue-hover btn-press"
            >
              Burn More
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
              <CardTitle className="text-[#E9ECEF]">Confirm Burn Transaction</CardTitle>
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
                        confirmRedeem();
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

              <div className="p-4 bg-panel-light rounded-lg border border-[#1C1F25] space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">USDP Amount:</span>
                  <span className="font-semibold text-[#E9ECEF]">{usdpAmount.toFixed(7)} USDP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">Redeem Fee (0.3%):</span>
                  <span className="text-sm text-[#E9ECEF]">{redeemFee.toFixed(7)} USDP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">Pi Output:</span>
                  <span className="font-semibold text-gradient-blue">{piOutput.toFixed(7)} Pi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#707784]">USD Value:</span>
                  <span className="text-sm text-[#E9ECEF]">${usdValue.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={confirmRedeem} 
                  disabled={isLoading || showPasswordDialog}
                  className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Burn'
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header with Balance */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">BURN USDP</h1>
            <p className="text-[#707784]">Convert USDP back to Pi</p>
          </div>
          <Card className="bg-panel border-[#1C1F25] px-4 py-3">
            <div className="text-right">
              <div className="text-xs text-[#707784] mb-1">USDP Balance</div>
              <div className="text-xl font-bold text-gradient-blue">{usdpBalance.toFixed(7)}</div>
            </div>
          </Card>
        </div>

        {/* Centered Card */}
        <Card className="bg-panel border-[#1C1F25]">
          <CardContent className="p-6 space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="usdp-amount" className="text-[#E9ECEF] text-lg">Amount</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSlippage(!showSlippage)}
                    className="text-xs text-gradient-blue hover:text-blue-400 h-auto p-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Slippage
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-xs text-gradient-blue hover:text-blue-400 h-auto p-1"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {showSlippage && (
                <div className="p-3 bg-panel-light rounded-lg border border-[#1C1F25]">
                  <Label className="text-xs text-[#707784] mb-2 block">Slippage Tolerance</Label>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map((val) => (
                      <Button
                        key={val}
                        variant={slippage === val ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(val)}
                        className={cn(
                          "flex-1",
                          slippage === val
                            ? "bg-gradient-blue text-white"
                            : "border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
                        )}
                      >
                        {val}%
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <Input
                  id="usdp-amount"
                  type="text"
                  placeholder="0.0000000"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isLoading}
                  className="h-16 text-3xl font-bold bg-panel-light border-[#1C1F25] text-[#E9ECEF] focus:border-primary focus:ring-primary"
                />
              </div>
              <p className="text-xs text-[#707784]">
                Available: <span className="text-gradient-blue font-semibold">{usdpBalance.toFixed(7)} USDP</span>
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-950/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Summary Panel */}
            {amount && usdpAmount > 0 && (
              <div className="p-5 bg-panel-light rounded-lg border border-[#1C1F25] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#707784]">Exchange Rate:</span>
                  <span className="text-sm font-semibold text-gradient-blue">1 USDP = {exchangeRate} Pi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#707784]">Fees (0.3%):</span>
                  <span className="text-sm text-[#E9ECEF]">{redeemFee.toFixed(7)} USDP</span>
                </div>
                <div className="pt-3 border-t border-[#1C1F25]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#707784]">Est. Received:</span>
                    <span className="text-xl font-bold text-gradient-blue">{piOutput.toFixed(7)} Pi</span>
                  </div>
                </div>
              </div>
            )}

            {!hasSufficientBalance && usdpAmount > 0 && (
              <Alert className="bg-yellow-950/20 border-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[#707784]">
                  Insufficient USDP balance. You need {usdpAmount.toFixed(7)} USDP but only have {usdpBalance.toFixed(7)} USDP.
                </AlertDescription>
              </Alert>
            )}

            {/* Burn Button */}
            <Button 
              onClick={handleRedeem} 
              disabled={isLoading || !amount || usdpAmount <= 0 || !hasSufficientBalance}
              className="w-full h-14 text-lg font-semibold bg-gradient-blue glow-blue-hover btn-press"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Burn
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
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

