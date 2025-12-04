'use client';

import React, { useState } from 'react';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
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

// Simple password validation - at least 6 characters
const validatePasswordStrength = (password: string): boolean => {
  return password.length >= 6;
};

interface PasswordSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordSet: (password: string) => Promise<void>;
  isLoading?: boolean;
}

export function PasswordSetupDialog({
  open,
  onOpenChange,
  onPasswordSet,
  isLoading = false,
}: PasswordSetupDialogProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password strength
    if (!validatePasswordStrength(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onPasswordSet(password);

      // Reset form on success - but don't close dialog here, let parent handle it
      setPassword('');
      setConfirmPassword('');
      setError(null);

      // Parent will close the dialog after successful storage
      // Don't set isSubmitting to false here - let parent handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set up password. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false); // Only set to false on error, parent handles success
      console.error('Password setup error:', err);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      setPassword('');
      setConfirmPassword('');
      setError(null);
      onOpenChange(false);
    }
  };

  const isFormValid = password.length >= 6 && password === confirmPassword;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gradient-blue" />
            Set Up PIN/Password
          </DialogTitle>
          <DialogDescription className="text-[#707784]">
            Create a PIN/password to secure your account. You&apos;ll need this to sign transactions.
            Make sure to remember it, as you&apos;ll need to re-import your account if you forget it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive" className="bg-red-950/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-950/20 border-blue-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-[#707784]">
              A PIN/password will be used to encrypt and protect your secret key. This is the primary authentication method.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#E9ECEF]">PIN/Password (min. 6 characters)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your PIN/password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || isLoading}
              autoFocus
              autoComplete="new-password"
              className="bg-panel-light border-[#1C1F25]"
            />
            <p className="text-xs text-[#707784]">
              This will be used to encrypt your secret key. Make sure to remember it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#E9ECEF]">Confirm PIN/Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your PIN/password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || isLoading}
              autoComplete="new-password"
              className="bg-panel-light border-[#1C1F25]"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !isFormValid}
              className="w-full bg-gradient-blue glow-blue-hover btn-press"
            >
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Set Up PIN/Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full border-[#1C1F25]"
              disabled={isSubmitting || isLoading}
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

