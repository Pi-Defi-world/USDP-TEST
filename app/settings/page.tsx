'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';
import { TestnetBadge } from '@/components/TestnetBadge';
import { Label } from '@/components/ui/label';
import { AlertCircle, Network } from 'lucide-react';

export default function SettingsPage() {
  const isTestnet = apiClient.isTestnetMode();
  const usdTestAssetCode = process.env.NEXT_PUBLIC_USD_TEST_ASSET_CODE || 'USDTEST';

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || localStorage.getItem('pi_access_token');
  };

  const loadPasskeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/passkeys', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setPasskeys(data.data.passkeys || []);
      } else {
        setError(data.error || 'Failed to load passkeys');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passkeys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    if (passkeys.length <= 1) {
      toast({
        title: 'Cannot Delete',
        description: 'You must have at least one passkey. Please register another passkey first.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this passkey? You will not be able to use this device to log in anymore.')) {
      return;
    }

    setDeletingId(credentialId);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: 'Delete Failed',
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/auth/passkeys/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Passkey Deleted',
          description: 'The passkey has been successfully deleted.',
        });
        await loadPasskeys();
      } else {
        toast({
          title: 'Delete Failed',
          description: data.error || 'Failed to delete passkey',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Failed to delete passkey',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadPasskeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings and security</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Passkeys</CardTitle>
          </div>
          <CardDescription>
            Manage your passkeys for different devices. Each device can have its own passkey for secure authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : passkeys.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No passkeys found. This should not happen. Please contact support.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        {passkey.deviceName || 'Unknown Device'}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {formatDate(passkey.createdAt)}</span>
                        </div>
                        {passkey.lastUsedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Last used: {formatDate(passkey.lastUsedAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 font-mono">
                        ID: {passkey.credentialId.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePasskey(passkey.credentialId)}
                    disabled={deletingId === passkey.credentialId || passkeys.length <= 1}
                  >
                    {deletingId === passkey.credentialId ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {passkeys.length <= 1 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have only one passkey. Register another passkey on a different device before deleting this one.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

