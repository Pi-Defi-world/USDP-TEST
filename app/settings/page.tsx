'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api/client';
import { TestnetBadge } from '@/components/TestnetBadge';
import { Label } from '@/components/ui/label';
import { AlertCircle, Network } from 'lucide-react';

export default function SettingsPage() {
  const isTestnet = apiClient.isTestnetMode();
  const usdTestAssetCode = process.env.NEXT_PUBLIC_USD_TEST_ASSET_CODE || 'USDTEST';


  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings and security</p>
      </div>

      {/* Testnet Configuration Section */}
      {isTestnet && (
        <Card className="mt-4 sm:mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Testnet Configuration</CardTitle>
              <TestnetBadge />
            </div>
            <CardDescription>
              Testnet-specific settings and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Network</Label>
                <p className="text-sm text-muted-foreground mt-1">Pi Testnet</p>
              </div>
              <div>
                <Label className="text-sm font-medium">USD-TEST Asset</Label>
                <p className="text-sm text-muted-foreground font-mono mt-1">{usdTestAssetCode}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Pool Allocation</Label>
                <p className="text-sm text-muted-foreground mt-1">70% Pi to Pool</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Reserve Allocation</Label>
                <p className="text-sm text-muted-foreground mt-1">30% Pi to Reserve</p>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                On testnet, USD-TEST is used instead of USDC. The system automatically manages liquidity pools
                and reserve balances. 70% of Pi collateral is allocated to the liquidity pool, while 30% remains
                in the reserve.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

