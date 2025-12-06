'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Settings,
  FileText,
  ChevronRight,
  Copy,
  MessageCircle,
  LogOut,
  Loader2,
  User,
  Wallet,
  Coins,
  Shield,
  Check,
} from 'lucide-react';
import { usePi } from '@/components/providers/pi-provider';
import { useWalletStore } from '@/lib/store/walletStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PassphraseVerification } from '@/components/PassphraseVerification';

export default function ProfilePage() {
  const { user, isAuthenticated, authenticate, signOut } = usePi();
  const { user: authUser } = useAuthStore();
  const { walletAddress, balance, fetchBalance, setWalletAddress } = useWalletStore();
  const { toast } = useToast();
  const [showPassphraseVerification, setShowPassphraseVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get wallet address from authenticated user data (primary source)
  const userWalletAddress = authUser?.walletAddress && authUser.walletAddress.trim() !== '' 
    ? authUser.walletAddress 
    : walletAddress || null;

  // Sync wallet address from authStore to walletStore
  useEffect(() => {
    if (authUser?.walletAddress && authUser.walletAddress.trim() !== '') {
      setWalletAddress(authUser.walletAddress);
    }
  }, [authUser?.walletAddress, setWalletAddress]);

  useEffect(() => {
    if (isAuthenticated && userWalletAddress) {
      fetchBalance(userWalletAddress);
    }
  }, [isAuthenticated, userWalletAddress, fetchBalance]);

  const handleCopyWalletAddress = () => {
    if (userWalletAddress) {
      navigator.clipboard.writeText(userWalletAddress);
      setCopied(true);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePiConnect = async () => {
    setIsLoading(true);
    try {
      await authenticate();
    } catch (error) {
      console.error("Pi authentication failed:", error);
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassphraseVerified = (_walletAddress: string) => {
    setShowPassphraseVerification(false);
    toast({
      title: "Wallet Verified",
      description: "Your wallet has been successfully verified",
    });
  };

  const mainNavItems = [
    { title: "Create Wallet", description: "Generate a new wallet for USDP", icon: Wallet, href: "/account-service", showChevron: true },
    { title: "Mint USDP", description: "Convert Pi to USDP", icon: Coins, href: "/mint", showChevron: true },
    { title: "Burn USDP", description: "Convert USDP to Pi", icon: Wallet, href: "/redeem", showChevron: true },
    { title: "Transactions", description: "View transaction history", icon: FileText, href: "/transactions", showChevron: true },
    { title: "Settings", description: "Account and app settings", icon: Settings, href: "/settings", showChevron: true },
  ];

  const additionalMenuItems = [
    { title: "Privacy Policy", description: "Learn about our privacy practices", icon: FileText, href: "/privacy", showChevron: true },
    { title: "Contact Us", description: "Get help and support", icon: MessageCircle, href: "/contact", showChevron: true },
  ];

  const avatarUrl = user?.username 
    ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`
    : `https://api.dicebear.com/7.x/pixel-art/svg?seed=user`;

  return (
    <div className="min-h-screen bg-[#000000] page-transition pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E9ECEF]">Profile</h1>
          {!isAuthenticated && (
            <Button 
              size="sm" 
              onClick={handlePiConnect} 
              disabled={isLoading}
              className="bg-gradient-blue glow-blue-hover btn-press"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
              Connect Pi
            </Button>
          )}
        </div>

        {/* Account Overview */}
        <Card className="bg-panel border-[#1C1F25] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
              <User className="h-5 w-5 text-gradient-blue" />
              Account Overview
            </CardTitle>
            <CardDescription className="text-[#707784]">Summary of your Pi profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gradient-blue">
                <Image
                  src={avatarUrl}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg text-[#E9ECEF] truncate">
                  {isLoading ? "Authenticating..." : user?.username ? `@${user.username}` : "Unauthenticated"}
                </div>
                {userWalletAddress ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-[#707784] font-mono break-all flex-1">
                      {userWalletAddress}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyWalletAddress}
                      className="p-1 h-auto flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#707784]" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-[#707784]">
                    No wallet address. Create a wallet to get started.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Section */}
        <Card className="bg-panel border-[#1C1F25] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
              <Wallet className="h-5 w-5 text-gradient-blue" />
              Your Balances
            </CardTitle>
            <CardDescription className="text-[#707784]">Your USDP and Pi balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-blue/20 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-gradient-blue" />
                  </div>
                  <div>
                    <div className="text-xs text-[#707784]">USDP Balance</div>
                    <div className="text-xl font-bold text-gradient-blue">
                      {parseFloat(balance?.zyra?.amount || balance?.usdp?.amount || '0').toFixed(7)}
                    </div>
                    <div className="text-xs text-[#707784]">
                      ${balance?.zyra?.usdValue || balance?.usdp?.usdValue || '0.00'} USD
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-blue/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-gradient-blue" />
                  </div>
                  <div>
                    <div className="text-xs text-[#707784]">Pi Balance</div>
                    <div className="text-xl font-bold text-[#E9ECEF]">
                      {parseFloat(balance?.pi?.amount || '0').toFixed(7)}
                    </div>
                    <div className="text-xs text-[#707784]">
                      ${balance?.pi?.usdValue || '0.00'} USD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        {userWalletAddress && (
          <Card className="bg-panel border-[#1C1F25] mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Wallet className="h-5 w-5 text-gradient-blue" />
                Wallet Connection
              </CardTitle>
              <CardDescription className="text-[#707784]">Manage your connected wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-[#1C1F25] rounded-lg bg-panel-light">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E9ECEF] mb-1">Connected Wallet</p>
                    <p className="text-xs text-[#707784] font-mono break-all">
                      {userWalletAddress}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyWalletAddress}
                      className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {!showPassphraseVerification && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPassphraseVerification(true)}
                    className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Passphrase
                  </Button>
                )}
                {showPassphraseVerification && user?.username && (
                  <div className="p-4 border border-[#1C1F25] rounded-lg bg-panel-light">
                    <PassphraseVerification
                      username={user.username}
                      walletAddress={userWalletAddress}
                      onVerified={handlePassphraseVerified}
                      onCancel={() => setShowPassphraseVerification(false)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-[#E9ECEF]">Navigation</h2>
          {mainNavItems.map((item) => (
            <Link key={item.title} href={item.href} className="block w-full">
              <div className="bg-panel rounded-xl p-4 hover:bg-panel-light transition-colors border border-[#1C1F25]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <item.icon className="h-5 w-5 text-gradient-blue flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#E9ECEF] truncate">{item.title}</div>
                      <div className="text-xs text-[#707784] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  {item.showChevron && <ChevronRight className="h-4 w-4 text-[#707784] flex-shrink-0 ml-2" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More */}
        <div className="space-y-3 mb-6">
          <h2 className="text-lg font-semibold text-[#E9ECEF]">More</h2>
          {additionalMenuItems.map((item) => (
            <Link key={item.title} href={item.href} className="block w-full">
              <div className="bg-panel rounded-xl p-4 hover:bg-panel-light transition-colors border border-[#1C1F25]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <item.icon className="h-5 w-5 text-[#707784] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#E9ECEF] truncate">{item.title}</div>
                      <div className="text-xs text-[#707784] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  {item.showChevron && <ChevronRight className="h-4 w-4 text-[#707784] flex-shrink-0 ml-2" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Disconnect Button */}
        {isAuthenticated && (
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between p-4 bg-panel rounded-xl hover:bg-panel-light transition-colors border border-[#1C1F25] text-red-400"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <LogOut className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-red-400 truncate">Disconnect Pi Account</div>
                <div className="text-xs text-[#707784] mt-0.5">Logout from your Pi account</div>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
