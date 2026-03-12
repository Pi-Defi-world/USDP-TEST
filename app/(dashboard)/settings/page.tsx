'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { usePi } from '@/components/providers/pi-provider';
import { Label } from '@/components/ui/label';
import { AlertCircle, Network, LogOut, User, Shield, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const isTestnet = apiClient.isTestnetMode();
  const { user, signOut, isAuthenticated } = usePi();
  const router = useRouter();
  const usdTestAssetCode = process.env.NEXT_PUBLIC_USD_TEST_ASSET_CODE || 'USDTEST';

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Account Section */}
      {isAuthenticated && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription className="text-sm">
                  {user?.username || 'Connected'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Network className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Network</CardTitle>
              <CardDescription className="text-sm">
                {isTestnet ? 'Preview mode' : 'Live'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {isTestnet && (
          <CardContent className="pt-0 space-y-4">
            <Alert className="border-accent/20 bg-accent/5">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm text-muted-foreground">
                You are using preview mode. Assets here are not real money.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Security Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">How it works</CardTitle>
              <CardDescription className="text-sm">
                PUSD is always backed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Reserve ratio</span>
              <span className="font-medium">100%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">0.3%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Help</CardTitle>
              <CardDescription className="text-sm">
                Learn more about PUSD
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/developers">For developers</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/help/testnet">Getting started</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        PUSD v1.0.0
      </div>
    </div>
  );
}
