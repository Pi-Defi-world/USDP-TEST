'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Wallet, Shield, TrendingUp, Zap, Coins, ArrowDownCircle, Check, Globe, Lock, Clock, Users, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E9ECEF] leading-tight">
              Make money movement your{' '}
              <span className="text-gradient-blue">competitive edge</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#707784] max-w-2xl mx-auto">
              Join the Pi Network ecosystem building with USDP for near-instant, low-cost, 
              global stablecoin transactions backed by Pi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" asChild className="bg-gradient-blue glow-blue-hover btn-press text-white px-8">
                <Link href="/mint">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light px-8">
                <Link href="/stats">View Stats</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Value Proposition */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E9ECEF]">
              USDP is building a new internet financial system, making money movement 
              around the world as seamless as sending an email.
            </h2>
            <p className="text-lg text-[#707784] max-w-3xl mx-auto">
              Powered by Pi Network and trusted by the Pi community, our platform connects 
              traditional finance and digital assets to create a secure, always-on digital 
              economy — unlocking opportunities for people and businesses globally.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features - Three Column */}
      {/* <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-blue/20 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-gradient-blue" />
                </div>
                <CardTitle className="text-[#E9ECEF] text-xl">Pi-Backed Stablecoin</CardTitle>
                <CardDescription className="text-[#707784]">
                  The leading digital dollar on Pi Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-[#707784]">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>115% overcollateralization with Pi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>1:1 USD peg maintained</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Real-time Pi price integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-blue/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-gradient-blue" />
                </div>
                <CardTitle className="text-[#E9ECEF] text-xl">Instant Transactions</CardTitle>
                <CardDescription className="text-[#707784]">
                  Fast, secure, and always available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-[#707784]">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Real-time settlement, 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Move money around the world instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Low-cost transactions on Pi Network</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-blue/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-gradient-blue" />
                </div>
                <CardTitle className="text-[#E9ECEF] text-xl">Secure & Trusted</CardTitle>
                <CardDescription className="text-[#707784]">
                  Built on Pi Network blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-[#707784]">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Passkey authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Multi-signature security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span>Transparent and auditable</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Use Cases Section */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] text-center mb-12">
              Welcome to finance without friction
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payments */}
              <Card className="bg-panel border-[#1C1F25]">
                <CardHeader>
                  <CardTitle className="text-[#E9ECEF] flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gradient-blue" />
                    Payments built for business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Real-time settlement, 24/7. Move money around the world any time, near instantly.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Build for global scale. Move money with a system connected by Pi Network.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Put security first. Transact with secure, compliant stablecoins.
                    </span>
                  </div>
                  <div className="pt-4">
                    <Link href="/mint">
                      <Button variant="outline" className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Currency Access */}
              <Card className="bg-panel border-[#1C1F25]">
                <CardHeader>
                  <CardTitle className="text-[#E9ECEF] flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gradient-blue" />
                    Deliver access to sought-after currency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Real dollars. USDP is available across the Pi Network ecosystem.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Readily available. Give your customers access to redeemable digital currencies.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Fully reserved. USDP is backed 100% by Pi collateral.
                    </span>
                  </div>
                  <div className="pt-4">
                    <Link href="/redeem">
                      <Button variant="outline" className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Services */}
              <Card className="bg-panel border-[#1C1F25]">
                <CardHeader>
                  <CardTitle className="text-[#E9ECEF] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gradient-blue" />
                    A highly liquid foundation for trading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Reliable USDP availability and related liquidity services.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      Seamless cross-chain rebalancing. Move funds efficiently.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-gradient-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#707784]">
                      One-to-one redeemability. Swap USDP for Pi, any amount at any time.
                    </span>
                  </div>
                  <div className="pt-4">
                    <Link href="/stats">
                      <Button variant="outline" className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] text-center mb-4">
              Stay ahead of the curve with our comprehensive platform
            </h2>
            <p className="text-center text-[#707784] mb-12 max-w-2xl mx-auto">
              Enterprise-grade infrastructure supporting the new internet financial system on Pi Network.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">Mint USDP</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Convert Pi to USDP stablecoin with overcollateralization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/mint">
                    <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto">
                      Learn more →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowDownCircle className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">Redeem USDP</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Convert USDP back to Pi tokens instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/redeem">
                    <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto">
                      Learn more →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">Live Statistics</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Real-time data and analytics for the USDP ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/stats">
                    <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto">
                      Learn more →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">Transaction History</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Complete record of all your USDP operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/transactions">
                    <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto">
                      Learn more →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">Passkey Security</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Secure authentication using WebAuthn standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto" disabled>
                    Learn more →
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-panel border-[#1C1F25] hover:border-gradient-blue transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-6 w-6 text-gradient-blue" />
                    <CardTitle className="text-[#E9ECEF]">24/7 Availability</CardTitle>
                  </div>
                  <CardDescription className="text-[#707784]">
                    Always-on network operating around the clock
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="text-gradient-blue hover:text-blue-400 p-0 h-auto" disabled>
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Network Benefits */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] text-center mb-4">
              Our network is built around your success
            </h2>
            <p className="text-center text-[#707784] mb-12 max-w-2xl mx-auto">
              USDP helps businesses, developers, and consumers transact with confidence in the Pi Network ecosystem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-blue/20 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-gradient-blue" />
                </div>
                <h3 className="text-xl font-semibold text-[#E9ECEF]">Globally connected</h3>
                <p className="text-[#707784]">
                  Tap into a network powered by USDP that moves money around the world almost instantly. 
                  With deep liquidity on Pi Network, you can reach customers, markets, and opportunities globally.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-blue/20 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gradient-blue" />
                </div>
                <h3 className="text-xl font-semibold text-[#E9ECEF]">Always on</h3>
                <p className="text-[#707784]">
                  With stablecoins like USDP, our network operates around the clock, eliminating traditional 
                  banking hours and settlement delays. Move funds in seconds, reduce costs, and keep your 
                  business running in real time.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-blue/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-gradient-blue" />
                </div>
                <h3 className="text-xl font-semibold text-[#E9ECEF]">Built for growth</h3>
                <p className="text-[#707784]">
                  Enterprise-grade APIs, compliance-ready infrastructure, and deep Pi Network integrations 
                  allow your business to expand at scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <Card className="bg-panel border-[#1C1F25] max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl text-[#E9ECEF]">Live Statistics</CardTitle>
              <CardDescription className="text-[#707784]">
                Real-time data from the USDP stablecoin system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-blue">
                    $1.00
                  </div>
                  <div className="text-sm text-[#707784]">
                    USDP Price (USD)
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-blue">
                    115%
                  </div>
                  <div className="text-sm text-[#707784]">
                    Backing Ratio
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient-blue">
                    0.3%
                  </div>
                  <div className="text-sm text-[#707784]">
                    Mint/Redeem Fee
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF]">
              Move money smarter
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="bg-gradient-blue glow-blue-hover btn-press text-white px-8">
                <Link href="/mint">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light px-8">
                <Link href="/stats">View Stats</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1C1F25] bg-panel mt-12 sm:mt-16 lg:mt-24">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center text-[#707784] text-sm">
            <p>&copy; 2024 USDP Platform. Built on Pi Network.</p>
            <p className="mt-2">
              A production-grade USD-pegged stablecoin powered by Pi Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
