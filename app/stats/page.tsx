'use client';

 


import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Users, Activity, Shield, Zap } from 'lucide-react';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPiReserve: '0.0000000',
    totalUsdReserve: '0.00',
    totalUSDPSupply: '0.0000000',
    totalUSDPUsdValue: '0.00',
    backingRatio: '0.00%',
    reserveSurplus: '0.00',
    totalFeesCollected: '0.0000000',
    totalVolume: '0.00',
    totalMints: 0,
    totalRedeems: 0,
    totalTransactions: 0,
    totalHolders: 0,
    piPrice: 0,
    isFullyBacked: false,
  });

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalPiReserve: '206.4231410',
        totalUsdReserve: '41.34',
        totalUSDPSupply: '4.9940000',
        totalUSDPUsdValue: '4.99',
        backingRatio: '827.79%',
        reserveSurplus: '36.35',
        totalFeesCollected: '0.0060000',
        totalVolume: '2.00',
        totalMints: 4,
        totalRedeems: 4,
        totalTransactions: 15,
        totalHolders: 1,
        piPrice: 0.2002595454545454,
        isFullyBacked: true,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                  <CardHeader className="space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            USDP Statistics
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Real-time data from the USDP stablecoin system
          </p>
        </div>

        {/* Reserve Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pi Reserve</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPiReserve} Pi</div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalUsdReserve} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">USDP Supply</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUSDPSupply} USDP</div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalUSDPUsdValue} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backing Ratio</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.backingRatio}</div>
              <p className="text-xs text-muted-foreground">
                {stats.isFullyBacked ? 'Fully Backed' : 'Under-collateralized'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pi Price</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.piPrice.toFixed(6)}</div>
              <p className="text-xs text-muted-foreground">
                Real-time price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground">
                USD traded
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeesCollected} USDP</div>
              <p className="text-xs text-muted-foreground">
                Protocol revenue
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                All operations
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Holders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHolders}</div>
              <p className="text-xs text-muted-foreground">
                Unique addresses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle>Transaction Breakdown</CardTitle>
              <CardDescription>
                Mint and redeem operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Mints</span>
                </div>
                <span className="text-sm font-bold">{stats.totalMints}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Redeems</span>
                </div>
                <span className="text-sm font-bold">{stats.totalRedeems}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backing Status</span>
                <Badge variant={stats.isFullyBacked ? 'default' : 'destructive'}>
                  {stats.isFullyBacked ? 'Healthy' : 'At Risk'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reserve Surplus</span>
                <span className="text-sm font-bold text-green-600">
                  ${stats.reserveSurplus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  Pi Testnet
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
