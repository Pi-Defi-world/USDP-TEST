'use client';

 


import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TestnetBadge } from '@/components/TestnetBadge';
import { ReservePoolBreakdown } from '@/components/ReservePoolBreakdown';
import { PoolInfoCard } from '@/components/PoolInfoCard';
import { apiClient } from '@/lib/api/client';
import { PoolInfo, ReserveStatus, CollateralBreakdown, Stats } from '@/types';
import { TrendingUp, DollarSign, Users, Activity, Shield, Zap } from 'lucide-react';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTestnet, setIsTestnet] = useState(false);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [collateralBreakdown, setCollateralBreakdown] = useState<CollateralBreakdown | null>(null);
  const [stats, setStats] = useState({
    totalPiReserve: '0.0000000',
    totalUsdTestReserve: '0.0000000',
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

  const assetLabel = isTestnet ? 'USD-TEST' : 'USDC';

  useEffect(() => {
    // Check if we're in testnet mode
    const testnetMode = apiClient.isTestnetMode();
    setIsTestnet(testnetMode);

    const loadStats = async () => {
      try {
        setIsLoading(true);

        // Fetch stats from API
        const statsResponse = await apiClient.getStatsLegacy();
        if (statsResponse.success && statsResponse.data) {
          const statsData = statsResponse.data as Partial<Stats>;
          setStats({
            totalPiReserve: statsData.totalPiReserve || '0.0000000',
            totalUsdTestReserve: statsData.totalUsdTestReserve || '0.0000000',
            totalUsdReserve: statsData.totalUsdReserve || '0.00',
            totalUSDPSupply: statsData.totalUSDPSupply || '0.0000000',
            totalUSDPUsdValue: statsData.totalUSDPUsdValue || '0.00',
            backingRatio: statsData.backingRatio || '0.00%',
            reserveSurplus: statsData.reserveSurplus || '0.00',
            totalFeesCollected: statsData.totalFeesCollected || '0.0000000',
            totalVolume: statsData.totalVolume || '0.00',
            totalMints: statsData.totalMints || 0,
            totalRedeems: statsData.totalRedeems || 0,
            totalTransactions: statsData.totalTransactions || 0,
            totalHolders: statsData.totalHolders || 0,
            piPrice: statsData.piPrice || 0,
            isFullyBacked: statsData.isFullyBacked || false,
          });
        }

        // Fetch comprehensive wallet status (includes reserve + pool data)
        // This endpoint provides all the data we need in one call
        try {
          const walletResponse = await apiClient.getWalletStatus();
          if (walletResponse.success && walletResponse.data) {
            interface WalletStatusResponse {
              totals?: {
                totalUsdValue?: string;
                pi?: { amount?: string };
                usdTest?: { amount?: string };
              };
              reserve?: {
                balances?: {
                  pi?: { amount?: string; usdValue?: string };
                  usdTest?: { amount?: string; usdValue?: string };
                };
              };
              pool?: {
                exists?: boolean;
                poolId?: string | null;
                fee?: string | null;
                totalShares?: string | null;
                reserves?: {
                  pi?: { amount?: string; usdValue?: string };
                  usdTest?: { amount?: string; usdValue?: string };
                };
              };
            }
            
            const walletData = walletResponse.data as WalletStatusResponse;
            
            // Update total reserve value (includes reserve holdings + pool assets)
            if (walletData.totals?.totalUsdValue) {
              setStats(prev => ({
                ...prev,
                totalUsdReserve: walletData.totals.totalUsdValue || '0.00',
                totalPiReserve: walletData.totals.pi?.amount || prev.totalPiReserve,
                totalUsdTestReserve: walletData.totals.usdTest?.amount || prev.totalUsdTestReserve,
              }));
            }
            
            // Set collateral breakdown for testnet mode
            if (testnetMode && walletData.reserve && walletData.pool && walletData.totals) {
              setCollateralBreakdown({
                reserve: {
                  piAmount: walletData.reserve.balances?.pi?.amount || '0',
                  usdTestAmount: walletData.reserve.balances?.usdTest?.amount || '0',
                  piValue: walletData.reserve.balances?.pi?.usdValue || '0',
                  usdTestValue: walletData.reserve.balances?.usdTest?.usdValue || '0',
                },
                pool: {
                  piAmount: walletData.pool.reserves?.pi?.amount || '0',
                  usdTestAmount: walletData.pool.reserves?.usdTest?.amount || '0',
                  piValue: walletData.pool.reserves?.pi?.usdValue || '0',
                  usdTestValue: walletData.pool.reserves?.usdTest?.usdValue || '0',
                },
                total: {
                  piAmount: walletData.totals.pi?.amount || '0',
                  usdTestAmount: walletData.totals.usdTest?.amount || '0',
                  totalValue: walletData.totals.totalUsdValue || '0',
                  usdcRatio: 0, // Will be calculated if needed
                  piRatio: 0, // Will be calculated if needed
                },
              });
              
              // Set pool info if available
              if (walletData.pool.exists) {
                setPoolInfo({
                  exists: true,
                  poolId: walletData.pool.poolId || null,
                  fee: walletData.pool.fee || null,
                  totalShares: walletData.pool.totalShares || null,
                  reserves: walletData.pool.reserves ? [
                    {
                      asset: 'native',
                      amount: walletData.pool.reserves.pi?.amount || '0',
                    },
                    {
                      asset: 'usd-test',
                      amount: walletData.pool.reserves.usdTest?.amount || '0',
                    },
                  ] : [],
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch wallet status:', error);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to default values
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-4 sm:py-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 sm:w-64 mx-auto" />
              <Skeleton className="h-4 w-64 sm:w-96 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              USDP Statistics
            </h1>
            {isTestnet && <TestnetBadge />}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time data from the USDP stablecoin system
          </p>
        </div>

        {/* Reserve Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Reserve
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                ${isTestnet && collateralBreakdown 
                  ? collateralBreakdown.total.totalValue
                  : stats.totalUsdReserve} USD
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isTestnet && collateralBreakdown 
                  ? `${collateralBreakdown.total.piAmount} Pi + ${collateralBreakdown.total.usdTestAmount} USD-TEST`
                  : `${stats.totalPiReserve} Pi${stats.totalUsdTestReserve ? ` + ${stats.totalUsdTestReserve} USD-TEST` : ''}`}
              </p>
              {isTestnet && collateralBreakdown && (
                <p className="text-xs text-muted-foreground mt-1">
                  Reserve: {collateralBreakdown.reserve.piAmount} Pi + {collateralBreakdown.reserve.usdTestAmount} USD-TEST | Pool: {collateralBreakdown.pool.piAmount} Pi + {collateralBreakdown.pool.usdTestAmount} USD-TEST
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">USDP Supply</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUSDPSupply} USDP</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.totalUSDPUsdValue} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Backing Ratio</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.backingRatio}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.isFullyBacked ? 'Fully Backed' : 'Under-collateralized'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pi Price</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">${stats.piPrice.toFixed(6)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">${stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground mt-1">
                USD traded
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Fees Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalFeesCollected} USDP</div>
              <p className="text-xs text-muted-foreground mt-1">
                Protocol revenue
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All operations
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Holders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalHolders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique addresses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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
                <span className="text-sm font-bold text-primary">
                  ${stats.reserveSurplus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  {isTestnet ? 'Pi Testnet' : 'Pi Network'}
                </Badge>
              </div>
              {isTestnet && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Collateral Asset</span>
                  <span className="text-sm font-bold text-primary">
                    {assetLabel}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Testnet-specific: Reserve/Pool Breakdown */}
        {isTestnet && collateralBreakdown && (
          <div className="mb-8">
            <ReservePoolBreakdown breakdown={collateralBreakdown} isTestnet={isTestnet} />
          </div>
        )}

        {/* Testnet-specific: Pool Info */}
        {isTestnet && poolInfo && (
          <div className="mb-8">
            <PoolInfoCard poolInfo={poolInfo} isTestnet={isTestnet} />
          </div>
        )}
      </div>
    </div>
  );
}
