'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePi } from '@/components/providers/pi-provider';
import { Wallet, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function ConnectWalletCard() {
  const { authenticate } = usePi();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      alert('Please open this app in Pi Browser');
      return;
    }

    setIsLoading(true);
    try {
      await authenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
      alert(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-sm p-8 bg-card border-border text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-accent" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Connect your Pi Network wallet to access the PUSD dashboard.
        </p>

        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full btn-accent h-12 text-base"
        >
          {isLoading ? (
            'Connecting...'
          ) : (
            <>
              Connect Pi Wallet
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Make sure you have the Pi Browser installed
        </p>
      </Card>
    </div>
  );
}
