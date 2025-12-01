export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Wallet, Shield, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">

      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-100">
              Pi-Backed Stablecoin
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A production-grade USD-pegged stablecoin built on Pi Network with 
              passkey authentication and real-time pricing
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/stats">View Stats</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Pi Authentication</CardTitle>
              <CardDescription>
                Secure authentication with Pi Network SDK. Connect your wallet to get started.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">USD Pegged</CardTitle>
              <CardDescription>
                Maintains 1:1 USD value with real-time Pi price integration and overcollateralization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Real-time Pricing</CardTitle>
              <CardDescription>
                Dynamic pricing with oracle integration from multiple exchanges for accurate valuations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Instant Transactions</CardTitle>
              <CardDescription>
                Atomic minting and redemption with multi-signature security on Pi Network.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-24">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Live Statistics</CardTitle>
              <CardDescription>
                Real-time data from the USDP stablecoin system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    $1.00
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    USDP Price (USD)
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    115%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Backing Ratio
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    0.3%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Mint/Redeem Fee
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 USDP Platform. Built on Pi Network Testnet.</p>
            <p className="mt-2 text-sm">
              This is a demonstration platform. Do not use for production purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
