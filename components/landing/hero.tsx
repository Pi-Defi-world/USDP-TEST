'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
      
      {/* Gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
            <span className="text-muted-foreground">Live on Pi Network Testnet</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
            The stablecoin
            <br />
            <span className="text-muted-foreground">for Pi Network</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto text-pretty leading-relaxed">
            PUSD is a fully-backed, transparent stablecoin pegged to the US dollar. 
            Mint, redeem, and transact with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="btn-accent w-full sm:w-auto text-base px-8 h-12">
              <Link href="/dashboard">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 h-12">
              <Link href="/stats">
                View Protocol Stats
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-mono">1:1</span>
              <span>USD Peg</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-mono">115%</span>
              <span>Collateralized</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-mono">0.3%</span>
              <span>Fee</span>
            </div>
          </div>
        </div>

        {/* Floating UI preview */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="glass rounded-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Balance</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Live</span>
            </div>
            <div className="space-y-1">
              <p className="money-lg">$0.00</p>
              <p className="text-sm text-muted-foreground">0.0000 PUSD</p>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full">Deposit</Button>
              <Button className="w-full btn-accent">Mint</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
