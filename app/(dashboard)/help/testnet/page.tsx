'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestnetBadge } from '@/components/TestnetBadge';
import { AlertTriangle, Info, HelpCircle, CheckCircle } from 'lucide-react';

export default function TestnetHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Testnet Help</h1>
          <TestnetBadge />
        </div>
        <p className="text-muted-foreground">
          Learn about testnet operations, USD-TEST, and pool functionality
        </p>
      </div>

      <div className="space-y-6">
        {/* What is Testnet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is Testnet?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The testnet is a testing environment that simulates the mainnet USDP stablecoin system.
              It allows developers and users to test functionality without using real assets.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Testnet tokens have no real value. Do not use testnet for production purposes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* USD-TEST vs USDC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              USD-TEST vs USDC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">USD-TEST</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Synthetic token created on Pi Testnet</li>
                  <li>Hardcoded 1:1 peg with USD ($1.00 per token)</li>
                  <li>Used instead of USDC on testnet</li>
                  <li>No real value - for testing only</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">USDC (Mainnet)</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Real USD Coin on Stellar Network</li>
                  <li>Used on mainnet for collateral</li>
                  <li>Has real value</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Liquidity Pool Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Pool Allocation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  On testnet, the system uses a liquidity pool to manage collateral:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>70% of Pi</strong> collateral is allocated to the liquidity pool</li>
                  <li><strong>30% of Pi</strong> remains in the reserve</li>
                  <li>USD-TEST is transferred to the reserve during minting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How It Works</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>When you mint USDP, Pi is split: 70% to pool, 30% to reserve</li>
                  <li>USD-TEST is transferred to the reserve</li>
                  <li>When you redeem, if reserve has insufficient Pi, the system swaps USD-TEST for Pi from the pool</li>
                  <li>The pool maintains liquidity for trading and swaps</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reserve Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Reserve Structure</CardTitle>
            <CardDescription>Understanding reserve vs pool balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Reserve</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 30% of Pi collateral</li>
                  <li>• USD-TEST tokens</li>
                  <li>• Primary collateral storage</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Pool</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 70% of Pi collateral</li>
                  <li>• USD-TEST for swaps</li>
                  <li>• Liquidity for trading</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The dashboard shows both reserve and pool balances separately, as well as combined totals.
              This helps you understand how your collateral is distributed.
            </p>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Pool Not Initialized</h3>
                <p className="text-sm text-muted-foreground">
                  If you see "Pool has not been initialized yet", the pool may not exist yet.
                  This is normal for new testnet deployments. The pool will be created automatically
                  when the first mint operation occurs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Missing Pool Data</h3>
                <p className="text-sm text-muted-foreground">
                  If pool information doesn't appear, check that the backend is running and
                  the pool endpoint is accessible. The frontend will gracefully handle missing pool data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">USD-TEST Not Showing</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure that <code className="bg-muted px-1 rounded">NEXT_PUBLIC_NETWORK=testnet</code> is set
                  in your environment variables, or that your hostname includes "testnet".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required configuration for testnet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_NETWORK=testnet</div>
                <div className="text-muted-foreground mt-1"># Set to 'testnet' or 'mainnet'</div>
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_SERVER_URL=http://localhost:3001</div>
                <div className="text-muted-foreground mt-1"># Backend API URL</div>
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_USD_TEST_ASSET_CODE=USDTEST</div>
                <div className="text-muted-foreground mt-1"># USD-TEST asset code (optional)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

