'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  pusdBalance: string;
  pusdValue: string;
  piBalance: string;
  piValue: string;
  piPrice: number | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function BalanceCard({
  pusdBalance,
  pusdValue,
  piBalance,
  piValue,
  piPrice,
  onRefresh,
  isLoading,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCrypto = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.0000';
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const totalUsdValue = (parseFloat(pusdValue) || 0) + (parseFloat(piValue) || 0);

  return (
    <Card className="p-6 bg-card border-border overflow-hidden relative">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors',
                isLoading && 'animate-spin'
              )}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total Value */}
        <div className="mb-6">
          <p className="money-lg">
            {showBalance ? `$${formatNumber(totalUsdValue.toString())}` : '••••••'}
          </p>
        </div>

        {/* Asset Breakdown */}
        <div className="space-y-3">
          {/* PUSD */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">P</span>
              </div>
              <div>
                <p className="font-medium text-sm">PUSD</p>
                <p className="text-xs text-muted-foreground">Stablecoin</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm tabular-nums">
                {showBalance ? formatCrypto(pusdBalance) : '••••'}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${showBalance ? formatNumber(pusdValue) : '••••'}
              </p>
            </div>
          </div>

          {/* Pi */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                <span className="text-xs font-bold">Pi</span>
              </div>
              <div>
                <p className="font-medium text-sm">Pi</p>
                <p className="text-xs text-muted-foreground">
                  ${piPrice?.toFixed(4) || '0.0000'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm tabular-nums">
                {showBalance ? formatCrypto(piBalance) : '••••'}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${showBalance ? formatNumber(piValue) : '••••'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
