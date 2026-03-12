'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { usePriceStore } from '@/lib/store/priceStore';
import { MintForm } from '@/components/MintForm';
import { RedeemForm } from '@/components/RedeemForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PositionHealth } from '@/components/PositionHealth';
import { TestnetBadge } from '@/components/TestnetBadge';
import { ReservePoolBreakdown } from '@/components/ReservePoolBreakdown';
import { apiClient } from '@/lib/api/client';
import { ReserveStatus, CollateralBreakdown } from '@/types';
import { Wallet, TrendingUp, DollarSign, Shield, LogOut, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isAuthenticated, user } = usePi();
  const { walletAddress, balance, fetchBalance, isLoading: walletLoading } = useWalletStore();
  const { piPrice, fetchPiPrice, isLoading: priceLoading } = usePriceStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isTestnet, setIsTestnet] = useState(false);
  const [reserveStatus, setReserveStatus] = useState<ReserveStatus | null>(null);
  const [collateralBreakdown, setCollateralBreakdown] = useState<CollateralBreakdown | null>(null);

  useEffect(() => {
    // Check if we're in testnet mode
    const testnetMode = apiClient.isTestnetMode();
    setIsTestnet(testnetMode);

    // If not authenticated with Pi, show message but don't redirect (let user connect wallet)
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Load initial data
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Pi price
        await fetchPiPrice();
        
        // Fetch balance if wallet address is available
        if (walletAddress) {
          await fetchBalance(walletAddress);
        }

        // Fetch testnet-specific data if in testnet mode
        if (testnetMode) {
          try {
            // Fetch reserve status
            const reserveResponse = await apiClient.getReserveStatus();
            if (reserveResponse.success && reserveResponse.data) {
              const status = reserveResponse.data as ReserveStatus;
              setReserveStatus(status);
              
              // Create collateral breakdown from reserve status
              if (status.reserve && status.pool && status.total) {
                setCollateralBreakdown({
                  reserve: {
                    piAmount: status.reserve.piBalance || '0',
                    usdTestAmount: status.reserve.usdTestBalance || '0',
                    piValue: status.reserve.piValue || '0',
                    usdTestValue: status.reserve.usdTestValue || '0',
                  },
                  pool: {
                    piAmount: status.pool.piAmount || '0',
                    usdTestAmount: status.pool.usdTestAmount || '0',
                    piValue: status.pool.piValue || '0',
                    usdTestValue: status.pool.usdTestValue || '0',
                  },
                  total: {
                    piAmount: status.total.piAmount || '0',
                    usdTestAmount: status.total.usdTestAmount || '0',
                    totalValue: status.total.totalValue || '0',
                    usdcRatio: status.total.usdcRatio || 0,
                    piRatio: status.total.piRatio || 0,
                  },
                });
              }
            }
          } catch (error) {
            console.error('Failed to fetch reserve status:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, walletAddress, fetchPiPrice, fetchBalance]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      
      // Refresh Pi price
      await fetchPiPrice();
      
      // Refresh balance if wallet address is available
      if (walletAddress) {
        await fetchBalance(walletAddress);
      }

      // Refresh testnet-specific data if in testnet mode
      if (isTestnet) {
        try {
          const reserveResponse = await apiClient.getReserveStatus();
          if (reserveResponse.success && reserveResponse.data) {
            const status = reserveResponse.data as ReserveStatus;
            setReserveStatus(status);
            
            if (status.reserve && status.pool && status.total) {
              setCollateralBreakdown({
                reserve: {
                  piAmount: status.reserve.piBalance || '0',
                  usdTestAmount: status.reserve.usdTestBalance || '0',
                  piValue: status.reserve.piValue || '0',
                  usdTestValue: status.reserve.usdTestValue || '0',
                },
                pool: {
                  piAmount: status.pool.piAmount || '0',
                  usdTestAmount: status.pool.usdTestAmount || '0',
                  piValue: status.pool.piValue || '0',
                  usdTestValue: status.pool.usdTestValue || '0',
                },
                total: {
                  piAmount: status.total.piAmount || '0',
                  usdTestAmount: status.total.usdTestAmount || '0',
                  totalValue: status.total.totalValue || '0',
                  usdcRatio: status.total.usdcRatio || 0,
                  piRatio: status.total.piRatio || 0,
                },
              });
            }
          }
        } catch (error) {
          console.error('Failed to refresh reserve status:', error);
        }
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your Pi Network wallet to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Use the &quot;Connect Wallet&quot; button in the navigation bar to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back!
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your ZYRA stablecoin portfolio
          </p>
        </div>
        {isTestnet && <TestnetBadge />}
      </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pi Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance?.pi?.amount || '0.0000000'} Pi
              </div>
              <p className="text-xs text-muted-foreground">
                ${balance?.pi?.usdValue || '0.00'} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ZYRA Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance?.zyra?.amount || '0.0000000'} ZYRA
              </div>
              <p className="text-xs text-muted-foreground">
                ${balance?.zyra?.usdValue || '0.00'} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pi Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${piPrice?.toFixed(6) || '0.000000'} USD
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Position Health Dashboard */}
            {walletAddress && (
              <PositionHealth 
                walletAddress={walletAddress}
                onActionClick={(action) => {
                  // Navigate to mint/redeem tab based on action type
                  const tab = action.type === 'ADD_COLLATERAL' ? 'mint' : 'redeem';
                  // This would require state management to switch tabs
                  console.log('Action clicked:', action);
                }}
              />
            )}

            {/* Testnet-specific: Reserve/Pool Breakdown */}
            {isTestnet && collateralBreakdown && (
              <ReservePoolBreakdown breakdown={collateralBreakdown} isTestnet={isTestnet} />
            )}

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your wallet details and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Wallet Address</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {walletAddress || 'Not connected'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Status</Label>
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <TransactionHistory 
              walletAddress={walletAddress || undefined}
            />
          </TabsContent>

          <TabsContent value="mint" className="space-y-6">
            {walletAddress ? (
              <MintForm 
                walletAddress={walletAddress} 
                onTransactionComplete={handleRefresh}
              />
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Please connect your wallet to mint ZYRA tokens
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="redeem" className="space-y-6">
            {walletAddress ? (
              <RedeemForm 
                walletAddress={walletAddress} 
                onTransactionComplete={handleRefresh}
              />
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Please connect your wallet to redeem ZYRA tokens
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}