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
import { TestnetBadge } from '@/components/TestnetBadge';
import { SecretSeedInputDialog } from '@/components/SecretSeedInputDialog';
import { Loader2, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface MintFormProps {
  walletAddress: string;
  onTransactionComplete?: () => void;
}

export function MintForm({ walletAddress, onTransactionComplete }: MintFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSecretSeedDialog, setShowSecretSeedDialog] = useState(false);
  const [secretSeedError, setSecretSeedError] = useState<string | null>(null);

  const { toast } = useToast();
  const { setError: clearAuthError } = useAuthStore();
  const { piPrice } = usePriceStore();
  const { balance } = useWalletStore();
  const isTestnet = apiClient.isTestnetMode();

  // Calculate USDP output and fees
  const OVERCOLLATERALIZATION_RATIO = 1.15; // 115% overcollateralization
  const piAmount = parseFloat(amount) || 0;
  const usdValue = piAmount * (piPrice || 0); // Convert Pi to USD value
  const mintFee = usdValue * 0.003; // 0.3% fee on USD value
  const usdpOutput = usdValue - mintFee; // USDP output (1 USDP = 1 USD)
  const piRequired = piAmount * OVERCOLLATERALIZATION_RATIO; // Pi required with 115% overcollateralization
  const overcollateralizationAmount = piRequired - piAmount; // Extra Pi locked

  // Check if user has sufficient Pi balance (accounting for overcollateralization)
  const piBalance = parseFloat(balance?.pi?.amount || '0');
  const hasSufficientBalance = piBalance >= piRequired;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
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

    setShowConfirmation(true);
  };

  const handleSecretSeedEntered = async (secretSeed: string) => {
    setIsLoading(true);
    setError(null);
    setSecretSeedError(null);
    setTransactionResult(null);

    try {
      // Call mint API with secret seed directly
      const result = await apiClient.mint({
        amount: piAmount,
        walletAddress: walletAddress,
        secretSeed: secretSeed,
      });

      if (!result.success) {
        throw new Error(result.error || 'Mint transaction failed');
      }

      const transactionData = result.data as { success: boolean; txHash?: string; error?: string } | null;
      setTransactionResult(transactionData || { success: true });
      setShowConfirmation(false);
      setShowSecretSeedDialog(false);
      
      toast({
        title: 'Mint Successful',
        description: `Successfully minted ${usdpOutput.toFixed(7)} USDP tokens${isTestnet ? ' on testnet' : ''}`,
      });

      // Refresh balance
      if (onTransactionComplete) {
        onTransactionComplete();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mint transaction failed';
      setSecretSeedError(errorMessage);
      
      toast({
        title: 'Mint Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMint = () => {
    // After confirmation, show secret seed dialog
    setShowSecretSeedDialog(true);
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
            Mint Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaction Hash:</span>
              <span className="font-mono text-sm">{transactionResult.txHash || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USDP Minted:</span>
              <span className="font-semibold">{usdpOutput.toFixed(7)} USDP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fee Paid:</span>
              <span className="text-sm">{mintFee.toFixed(7)} USDP</span>
            </div>
          </div>
          <Button onClick={handleRetry} className="w-full">
            Mint More
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Mint Transaction</CardTitle>
          <CardDescription>Review your transaction details before confirming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pi Amount:</span>
              <span className="font-semibold">{piAmount.toFixed(7)} Pi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USD Value:</span>
              <span className="text-sm">${usdValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mint Fee (0.3%):</span>
              <span className="text-sm">${mintFee.toFixed(7)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">USDP Output:</span>
              <span className="font-semibold text-green-600">{usdpOutput.toFixed(7)} USDP</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-muted-foreground">Overcollateralization (115%):</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pl-2">
                <span>Base Pi Amount:</span>
                <span>{piAmount.toFixed(7)} Pi</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pl-2">
                <span>Extra Pi Locked (15%):</span>
                <span className="text-orange-600">+{overcollateralizationAmount.toFixed(7)} Pi</span>
              </div>
              <div className="flex justify-between text-sm font-semibold mt-1 pt-1 border-t">
                <span>Total Pi Required:</span>
                <span className="text-blue-600">{piRequired.toFixed(7)} Pi</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Overcollateralization provides security by locking extra Pi as collateral for your USDP tokens.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={confirmMint} 
              disabled={isLoading}
              className="flex-1"
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Mint USDP Tokens
            </CardTitle>
            <CardDescription>
              Convert your Pi tokens to USDP stablecoin
            </CardDescription>
          </div>
          {isTestnet && <TestnetBadge />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTestnet && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              On testnet, USD-TEST will be transferred to reserve and 70% of Pi will be allocated to the liquidity pool.
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="pi-amount">Pi Amount</Label>
          <Input
            id="pi-amount"
            type="text"
            placeholder="0.0000000"
            value={amount}
            onChange={handleAmountChange}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Available: {piBalance.toFixed(7)} Pi
          </p>
        </div>

        {amount && piAmount > 0 && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pi Amount:</span>
              <span>{piAmount.toFixed(7)} Pi</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">USD Value:</span>
              <span>${usdValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mint Fee (0.3%):</span>
              <span>${mintFee.toFixed(7)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>USDP Output:</span>
              <span className="text-green-600">{usdpOutput.toFixed(7)} USDP</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Overcollateralization (115%):</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pl-2">
                <span>Base:</span>
                <span>{piAmount.toFixed(7)} Pi</span>
              </div>
              <div className="flex justify-between text-xs text-orange-600 pl-2">
                <span>Extra (15%):</span>
                <span>+{overcollateralizationAmount.toFixed(7)} Pi</span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t">
                <span>Total Pi Required:</span>
                <span className="text-blue-600">{piRequired.toFixed(7)} Pi</span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleMint} 
          disabled={isLoading || !amount || piAmount <= 0 || !hasSufficientBalance}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Mint USDP'
          )}
        </Button>

        {!hasSufficientBalance && piAmount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient Pi balance. You need {piAmount.toFixed(7)} Pi but only have {piBalance.toFixed(7)} Pi.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      {/* Secret Seed Input Dialog */}
      <SecretSeedInputDialog
        open={showSecretSeedDialog}
        onOpenChange={(open) => {
          setShowSecretSeedDialog(open);
          if (!open) {
            setShowConfirmation(false);
            setSecretSeedError(null);
          }
        }}
        onSecretSeedEntered={handleSecretSeedEntered}
        isLoading={isLoading}
        error={secretSeedError}
      />
    </Card>
  );
}
