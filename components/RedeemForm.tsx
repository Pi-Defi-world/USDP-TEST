'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { usePriceStore } from '@/lib/store/priceStore';
import { useWalletStore } from '@/lib/store/walletStore';
import { apiClient } from '@/lib/api/client';
import { Loader2, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface RedeemFormProps {
  walletAddress: string;
  onTransactionComplete?: () => void;
}

export function RedeemForm({ walletAddress, onTransactionComplete }: RedeemFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { toast } = useToast();
  const { retrieveKeypairForTransaction, setError: clearAuthError } = useAuthStore();
  const { piPrice } = usePriceStore();
  const { balance } = useWalletStore();

  // Calculate Pi output and fees
  const usdpAmount = parseFloat(amount) || 0;
  const usdValue = usdpAmount; // 1 USDP = 1 USD
  const redeemFee = usdValue * 0.003; // 0.3% fee on USD value
  const netUsdValue = usdValue - redeemFee; // USD value after fee
  // Pi output = (USD value - fee) / Pi price (no overcollateralization on redeem)
  const currentPiPrice = piPrice || 0;
  const piOutput = currentPiPrice > 0 ? netUsdValue / currentPiPrice : 0;

  // Check if user has sufficient USDP balance
  const usdpBalance = parseFloat(balance?.usdp?.amount || '0');
  const hasSufficientBalance = usdpBalance >= usdpAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
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

    setShowConfirmation(true);
  };

  const confirmRedeem = async () => {
    setIsLoading(true);
    setError(null);
    setTransactionResult(null);

    try {
      // Retrieve keypair using passkey authentication
      const keypair = await retrieveKeypairForTransaction(walletAddress);
      
      // Call redeem API with keypair data using apiClient (includes Authorization header)
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
      
      toast({
        title: 'Redeem Successful',
        description: `Successfully redeemed ${piOutput.toFixed(7)} Pi tokens`,
      });

      // Refresh balance
      if (onTransactionComplete) {
        onTransactionComplete();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Redeem transaction failed';
      setError(errorMessage);
      
      toast({
        title: 'Redeem Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setTransactionResult(null);
  };

  if (transactionResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Redeem Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaction Hash:</span>
              <span className="font-mono text-sm">{transactionResult.txHash || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pi Redeemed:</span>
              <span className="font-semibold">{piOutput.toFixed(7)} Pi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fee Paid:</span>
              <span className="text-sm">{redeemFee.toFixed(7)} USDP</span>
            </div>
          </div>
          <Button onClick={handleRetry} className="w-full">
            Redeem More
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Redeem Transaction</CardTitle>
          <CardDescription>Review your transaction details before confirming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
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

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USDP Amount:</span>
              <span className="font-semibold">{usdpAmount.toFixed(7)} USDP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Redeem Fee (0.3%):</span>
              <span className="text-sm">{redeemFee.toFixed(7)} USDP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pi Output:</span>
              <span className="font-semibold text-green-600">{piOutput.toFixed(7)} Pi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USD Value:</span>
              <span className="text-sm">${usdValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                <p className="text-muted-foreground mb-1">
                  <strong>Note:</strong> USDP tokens are minted with 115% overcollateralization. 
                  When redeeming, you receive Pi based on the current Pi price without the overcollateralization premium.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={confirmRedeem} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Redeem'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmation(false);
                setError(null);
                clearAuthError(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Redeem USDP Tokens
        </CardTitle>
        <CardDescription>
          Convert your USDP stablecoin back to Pi tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="usdp-amount">USDP Amount</Label>
          <Input
            id="usdp-amount"
            type="text"
            placeholder="0.0000000"
            value={amount}
            onChange={handleAmountChange}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Available: {usdpBalance.toFixed(7)} USDP
          </p>
        </div>

        {amount && usdpAmount > 0 && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">USDP Amount:</span>
              <span>{usdpAmount.toFixed(7)} USDP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Redeem Fee (0.3%):</span>
              <span>{redeemFee.toFixed(7)} USDP</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Pi Output:</span>
              <span className="text-green-600">{piOutput.toFixed(7)} Pi</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">USD Value:</span>
              <span>${usdValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                <p className="text-muted-foreground">
                  <strong>Note:</strong> USDP uses 115% overcollateralization. 
                  Redeem returns Pi at current market price (no overcollateralization premium).
                </p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleRedeem} 
          disabled={isLoading || !amount || usdpAmount <= 0 || !hasSufficientBalance}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Redeem Pi'
          )}
        </Button>

        {!hasSufficientBalance && usdpAmount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient USDP balance. You need {usdpAmount.toFixed(7)} USDP but only have {usdpBalance.toFixed(7)} USDP.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
