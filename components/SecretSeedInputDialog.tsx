'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key, AlertCircle, Loader2 } from 'lucide-react';

interface SecretSeedInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSecretSeedEntered: (secretSeed: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Validate Stellar secret key format (starts with S, 56 characters)
const isValidSecretKey = (secret: string): boolean => {
  return /^S[0-9A-Z]{55}$/.test(secret.trim());
};

export function SecretSeedInputDialog({
  open,
  onOpenChange,
  onSecretSeedEntered,
  isLoading = false,
  error: externalError,
}: SecretSeedInputDialogProps) {
  const [secretSeed, setSecretSeed] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedSecret = secretSeed.trim();

    if (!trimmedSecret) {
      setError('Please enter your secret seed');
      return;
    }

    // Validate secret seed format
    if (!isValidSecretKey(trimmedSecret)) {
      setError('Invalid secret seed format. Secret seed must start with "S" and be 56 characters long.');
      return;
    }

    try {
      await onSecretSeedEntered(trimmedSecret);
      setSecretSeed('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process secret seed';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setSecretSeed('');
    setError(null);
    setShowSecret(false);
    onOpenChange(false);
  };

  const displayError = externalError || error;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-gradient-blue" />
            Enter Secret Seed
          </DialogTitle>
          <DialogDescription>
            Enter your secret seed to authorize this transaction. Your secret seed is never stored and is only used to sign this transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretSeed">Secret Seed</Label>
            <div className="relative">
              <Input
                id="secretSeed"
                type={showSecret ? 'text' : 'password'}
                placeholder="S..."
                value={secretSeed}
                onChange={(e) => {
                  setSecretSeed(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                autoFocus
                className="bg-panel-light border-[#1C1F25] pr-10 font-mono"
                maxLength={56}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your secret seed starts with &quot;S&quot; and is 56 characters long
            </p>
          </div>

          {displayError && (
            <Alert variant="destructive" className="bg-red-950/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-yellow-950/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Security Note:</strong> Never share your secret seed with anyone. This application does not store your secret seed.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-[#1C1F25]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !secretSeed.trim()}
              className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Authorize
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

