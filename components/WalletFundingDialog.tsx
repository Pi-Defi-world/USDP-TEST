'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletStore } from '@/lib/store/walletStore';

interface WalletFundingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  onContinue?: () => void;
}

export function WalletFundingDialog({
  open,
  onOpenChange,
  walletAddress,
  onContinue,
}: WalletFundingDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { balance, fetchBalance } = useWalletStore();

  useEffect(() => {
    if (open && walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [open, walletAddress, fetchBalance]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
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

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gradient-blue" />
            Fund Your Wallet
          </DialogTitle>
          <DialogDescription>
            Your wallet has been created. Now you need to fund it with Test-Pi to perform transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-blue-950/20 border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-[#707784]">
              <strong className="text-[#E9ECEF]">Next Steps:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Copy your wallet address below</li>
                <li>Open your Pi Wallet app</li>
                <li>Send Test-Pi to your wallet address</li>
                <li>Return here and check your balance</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#E9ECEF]">Your Wallet Address</label>
            <div className="flex items-center gap-2 p-3 rounded bg-panel-light border border-[#1C1F25]">
              <p className="text-sm text-[#707784] font-mono break-all flex-1">
                {walletAddress}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-1 h-auto flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-[#707784]" />
                )}
              </Button>
            </div>
          </div>

          {balance?.pi && (
            <div className="p-3 rounded bg-panel-light border border-[#1C1F25]">
              <div className="text-sm text-[#707784] mb-1">Current Pi Balance</div>
              <div className="text-xl font-bold text-[#E9ECEF]">
                {parseFloat(balance.pi.amount || '0').toFixed(7)} Test-Pi
              </div>
            </div>
          )}

          <Alert className="bg-yellow-950/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm text-[#707784]">
              Your wallet has been seeded with a small amount of Test-Pi, but you may need more 
              to perform transactions. You can send additional Test-Pi from your Pi Wallet app.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#1C1F25]"
            >
              I&apos;ll Do This Later
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
            >
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

