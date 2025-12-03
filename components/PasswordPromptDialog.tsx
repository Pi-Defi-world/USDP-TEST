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
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

interface PasswordPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordEntered: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function PasswordPromptDialog({
  open,
  onOpenChange,
  onPasswordEntered,
  isLoading = false,
  error: externalError,
}: PasswordPromptDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter your PIN/password');
      return;
    }

    try {
      await onPasswordEntered(password);
      setPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decrypt wallet';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onOpenChange(false);
  };

  const displayError = externalError || error;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gradient-blue" />
            Enter PIN/Password
          </DialogTitle>
          <DialogDescription>
            Enter your PIN/password to decrypt your wallet and authorize this transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">PIN/Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your PIN/password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              autoFocus
              className="bg-panel-light border-[#1C1F25]"
            />
          </div>

          {displayError && (
            <Alert variant="destructive" className="bg-red-950/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

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
              disabled={isLoading || !password.trim()}
              className="flex-1 bg-gradient-blue glow-blue-hover btn-press"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
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

