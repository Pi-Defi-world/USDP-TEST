'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { usePriceStore } from '@/lib/store/priceStore';
import { MintForm } from '@/components/MintForm';
import { RedeemForm } from '@/components/RedeemForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { apiClient } from '@/lib/api/client';
import { ReserveStatus } from '@/types';
import { TrendingUp, Shield, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectWalletCard } from '@/components/app/connect-wallet-card';
import { BalanceCard } from '@/components/app/balance-card';
import { QuickActions } from '@/components/app/quick-actions';
import { MetricCard } from '@/components/ui/metric-card';

export default function DashboardPage() {
  const { isAuthenticated, user, authenticate } = usePi();
  const { walletAddress, balance, fetchBalance, isLoading: walletLoading } = useWalletStore();
  const { piPrice, fetchPiPrice, isLoading: priceLoading } = usePriceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reserveStatus, setReserveStatus] = useState<ReserveStatus | null>(null);
  
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await fetchPiPrice();
      
      if (walletAddress) {
        await fetchBalance(walletAddress);
      }

      try {
        const reserveResponse = await apiClient.getReserveStatus();
        if (reserveResponse.success && reserveResponse.data) {
          setReserveStatus(reserveResponse.data as ReserveStatus);
        }
      } catch (error) {
        console.error('Failed to fetch reserve status:', error);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [walletAddress, fetchPiPrice, fetchBalance]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const initialLoad = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    initialLoad();
  }, [isAuthenticated, loadData]);

  // Pull to refresh handlers
  useEffect(() => {
    if (!isAuthenticated) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;
      currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min((currentY - startY) * 0.5, 80));
      setPullDistance(distance);
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60) {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAuthenticated, isPulling, pullDistance, loadData]);

  const handleRefresh = async () => {
    if (!walletAddress) return;
    
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return <ConnectWalletCard />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200',
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ top: pullDistance - 40 }}
      >
        <div className={cn(
          'w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-lg',
          isRefreshing && 'animate-spin'
        )}>
          <ArrowDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            pullDistance > 60 && 'rotate-180'
          )} />
        </div>
      </div>

      <div 
        className="space-y-6 pb-8 animate-fade-in"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {/* Balance Section */}
        <BalanceCard 
          pusdBalance={balance?.usdp?.amount || '0'}
          pusdValue={balance?.usdp?.usdValue || '0'}
          piBalance={balance?.pi?.amount || '0'}
          piValue={balance?.pi?.usdValue || '0'}
          piPrice={piPrice}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />

        {/* Quick Actions */}
        <QuickActions onMint={() => setActiveTab('mint')} onRedeem={() => setActiveTab('redeem')} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-11">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="mint"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Mint
            </TabsTrigger>
            <TabsTrigger 
              value="redeem"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Redeem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Pi Price"
                value={piPrice?.toFixed(4) || '0.0000'}
                prefix="$"
                size="sm"
              />
              <MetricCard
                label="Collateral Ratio"
                value="115"
                suffix="%"
                size="sm"
                variant="accent"
              />
            </div>

            {/* Wallet Info */}
            <Card className="p-4 bg-card border-border">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Wallet</p>
              <p className="text-sm font-mono text-foreground/90 truncate">
                {walletAddress || 'Not connected'}
              </p>
            </Card>

            {/* Transaction History */}
            <div className="pt-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Recent Activity
              </h3>
              <TransactionHistory walletAddress={walletAddress || undefined} />
            </div>
          </TabsContent>

          <TabsContent value="mint" className="animate-fade-in min-h-[400px]">
            {walletAddress ? (
              <MintForm 
                walletAddress={walletAddress} 
                onTransactionComplete={handleRefresh}
              />
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">
                  Connect your wallet to mint PUSD
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="redeem" className="animate-fade-in min-h-[400px]">
            {walletAddress ? (
              <RedeemForm 
                walletAddress={walletAddress} 
                onTransactionComplete={handleRefresh}
              />
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">
                  Connect your wallet to redeem PUSD
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
