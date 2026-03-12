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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and security</p>
      </div>

      {/* Testnet Configuration Section */}
      {isTestnet && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              <CardTitle>Testnet Configuration</CardTitle>
              <TestnetBadge />
            </div>
            <CardDescription>
              Testnet-specific settings and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Network</Label>
                <p className="text-sm text-muted-foreground mt-1">Pi Testnet</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Testnet Label</Label>
                <p className="text-sm text-muted-foreground font-mono mt-1">{usdTestAssetCode}</p>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                On testnet, all assets are for development only. The production system uses an off-chain USD
                reserve (cash + T-bills) to back USDP; there is no 70/30 Pi/USDC pool in the current design.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!isTestnet && (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account and network settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You are connected to mainnet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
