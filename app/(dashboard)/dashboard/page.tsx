'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectWalletCard } from '@/components/app/connect-wallet-card';
import { BalanceCard } from '@/components/app/balance-card';
import { QuickActions } from '@/components/app/quick-actions';

export default function DashboardPage() {
  const { isAuthenticated, user, authenticate } = usePi();
  const { walletAddress, balance, fetchBalance, isLoading: walletLoading } = useWalletStore();
  const { piPrice, fetchPiPrice, isLoading: priceLoading } = usePriceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reserveStatus, setReserveStatus] = useState<ReserveStatus | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchPiPrice();
        
        if (walletAddress) {
          await fetchBalance(walletAddress);
        }

        // Fetch reserve data
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
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, walletAddress, fetchPiPrice, fetchBalance]);

  const handleRefresh = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPiPrice(),
        fetchBalance(walletAddress),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Not authenticated - show connect prompt
  if (!isAuthenticated) {
    return <ConnectWalletCard />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 mx-auto rounded-full bg-accent/20 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Balance Section */}
      <BalanceCard 
        pusdBalance={balance?.zyra?.amount || '0'}
        pusdValue={balance?.zyra?.usdValue || '0'}
        piBalance={balance?.pi?.amount || '0'}
        piValue={balance?.pi?.usdValue || '0'}
        piPrice={piPrice}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Quick Actions */}
      <QuickActions onMint={() => setActiveTab('mint')} onRedeem={() => setActiveTab('redeem')} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="mint"
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Mint
          </TabsTrigger>
          <TabsTrigger 
            value="redeem"
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Redeem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Pi Price</span>
              </div>
              <p className="font-semibold tabular-nums">
                ${piPrice?.toFixed(4) || '0.0000'}
              </p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Backing</span>
              </div>
              <p className="font-semibold tabular-nums">115%</p>
            </Card>
          </div>

          {/* Account Info */}
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
            <p className="text-xs font-mono text-foreground/80 truncate">
              {walletAddress || 'Not connected'}
            </p>
          </Card>

          {/* Transaction History */}
          <div className="pt-2">
            <TransactionHistory walletAddress={walletAddress || undefined} />
          </div>
        </TabsContent>

        <TabsContent value="mint" className="animate-fade-in">
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

        <TabsContent value="redeem" className="animate-fade-in">
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
  );
}
