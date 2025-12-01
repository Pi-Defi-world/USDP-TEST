'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PoolInfo } from '@/types';
import { ExternalLink, TrendingUp } from 'lucide-react';

interface PoolInfoCardProps {
  poolInfo: PoolInfo;
  isTestnet?: boolean;
}

export function PoolInfoCard({ poolInfo, isTestnet }: PoolInfoCardProps) {
  const assetLabel = isTestnet ? 'USD-TEST' : 'USDC';

  if (!poolInfo.exists) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader>
          <CardTitle>Liquidity Pool</CardTitle>
          <CardDescription>Pool information and reserves</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Pool has not been initialized yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const piReserve = poolInfo.reserves.find(r => r.asset === 'native');
  const usdTestReserve = poolInfo.reserves.find(r => r.asset.includes('USDTEST') || r.asset.includes('USD-TEST'));

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Liquidity Pool</CardTitle>
            <CardDescription>Pool information and reserves</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pool ID</span>
            {poolInfo.poolId && (
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                {poolInfo.poolId}
              </span>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Pool Reserves</h3>
          <div className="space-y-2">
            {piReserve && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pi:</span>
                <span className="text-sm font-medium">{piReserve.amount} Pi</span>
              </div>
            )}
            {usdTestReserve && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{assetLabel}:</span>
                <span className="text-sm font-medium">{usdTestReserve.amount} {assetLabel}</span>
              </div>
            )}
            {poolInfo.reserves.length === 0 && (
              <p className="text-sm text-muted-foreground">No reserves found</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Total Shares</span>
            <span className="text-sm font-bold">{poolInfo.totalShares}</span>
          </div>
        </div>

        {isTestnet && poolInfo.poolId && (
          <div className="border-t pt-4">
            <a
              href={`https://testnet.minepi.com/explorer/pool/${poolInfo.poolId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


