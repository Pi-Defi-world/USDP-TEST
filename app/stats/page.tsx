'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { ReserveStatus, CollateralBreakdown } from '@/types';
import { TrendingUp, DollarSign, Users, Activity, Shield, Zap, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import Link from 'next/link';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTestnet, setIsTestnet] = useState(false);
  const [reserveStatus, setReserveStatus] = useState<ReserveStatus | null>(null);
  const [collateralBreakdown, setCollateralBreakdown] = useState<CollateralBreakdown | null>(null);
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
    const testnetMode = apiClient.isTestnetMode();
    setIsTestnet(testnetMode);

    const loadStats = async () => {
      try {
        setIsLoading(true);

        const statsResponse = await apiClient.getStatsLegacy();
        if (statsResponse.success && statsResponse.data) {
          const d = statsResponse.data as {
            totalPiReserve?: string; totalUsdReserve?: string; totalUSDPSupply?: string;
            totalUSDPUsdValue?: string; backingRatio?: string; reserveSurplus?: string;
            totalFeesCollected?: string; totalVolume?: string;
            totalMints?: number; totalRedeems?: number; totalTransactions?: number; totalHolders?: number;
            piPrice?: number; isFullyBacked?: boolean;
          };
          setStats({
            totalPiReserve: d.totalPiReserve || '0.0000000',
            totalUsdReserve: d.totalUsdReserve || '0.00',
            totalUSDPSupply: d.totalUSDPSupply || '0.0000000',
            totalUSDPUsdValue: d.totalUSDPUsdValue || '0.00',
            backingRatio: d.backingRatio || '0.00%',
            reserveSurplus: d.reserveSurplus || '0.00',
            totalFeesCollected: d.totalFeesCollected || '0.0000000',
            totalVolume: d.totalVolume || '0.00',
            totalMints: d.totalMints ?? 0,
            totalRedeems: d.totalRedeems ?? 0,
            totalTransactions: d.totalTransactions ?? 0,
            totalHolders: d.totalHolders ?? 0,
            piPrice: d.piPrice ?? 0,
            isFullyBacked: d.isFullyBacked ?? false,
          });
        }

        if (testnetMode) {
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
            console.error('Failed to fetch reserve status:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AppShell title="Protocol Stats" showBack backHref="/dashboard">
      <div className="container mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Testnet Badge */}
            {isTestnet && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent text-sm">
                <Zap className="w-4 h-4" />
                <span>Running on Pi Network Testnet</span>
              </div>
            )}

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Backing</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{stats.backingRatio}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.isFullyBacked ? 'Fully backed' : 'Under-collateralized'}
                </p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">PUSD Supply</span>
                </div>
                <p className="text-xl font-bold tabular-nums">{parseFloat(stats.totalUSDPSupply).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">${stats.totalUSDPUsdValue}</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Pi Price</span>
                </div>
                <p className="text-xl font-bold tabular-nums">${stats.piPrice.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">USD</p>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <p className="text-xl font-bold tabular-nums">${stats.totalVolume}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </Card>
            </div>

            {/* Reserve Composition */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Reserve Composition</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Pi Collateral</span>
                    <span className="tabular-nums font-medium">
                      {collateralBreakdown?.total.piAmount || stats.totalPiReserve} Pi
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-accent transition-all duration-500" 
                      style={{ width: `${collateralBreakdown?.total.piRatio || 60}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{isTestnet ? 'USD-TEST' : 'USDC'}</span>
                    <span className="tabular-nums font-medium">
                      {collateralBreakdown?.total.usdTestAmount || stats.totalUsdReserve}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-foreground/30 transition-all duration-500" 
                      style={{ width: `${collateralBreakdown?.total.usdcRatio || 40}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Protocol Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalMints}</p>
                  <p className="text-xs text-muted-foreground">Total Mints</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalRedeems}</p>
                  <p className="text-xs text-muted-foreground">Total Redeems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalTransactions}</p>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalHolders}</p>
                  <p className="text-xs text-muted-foreground">Holders</p>
                </div>
              </div>
            </Card>

            {/* Protocol Revenue */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">Protocol Revenue</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums">{stats.totalFeesCollected}</p>
                <span className="text-sm text-muted-foreground">PUSD collected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                0.3% fee on mint and redeem operations
              </p>
            </Card>

            {/* System Status */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-medium mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <Badge variant="secondary" className="font-normal">
                    {isTestnet ? 'Pi Testnet' : 'Pi Mainnet'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health</span>
                  <Badge 
                    variant={stats.isFullyBacked ? 'default' : 'destructive'}
                    className="font-normal"
                  >
                    {stats.isFullyBacked ? 'Healthy' : 'At Risk'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Surplus</span>
                  <span className="text-sm font-medium text-accent tabular-nums">
                    +${stats.reserveSurplus}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
