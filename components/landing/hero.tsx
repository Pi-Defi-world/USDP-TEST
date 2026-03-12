'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
      
      {/* Gradient orb - subtle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-[128px]" />
      
      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 text-sm mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-muted-foreground">Now live on Pi Network</span>
          </div>

          {/* Headline */}
          <h1 
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="text-foreground">The stablecoin</span>
            <br />
            <span className="text-muted-foreground/80">for Pi Network</span>
          </h1>

          {/* Subheadline */}
          <p 
            className={cn(
              "text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed mb-10 transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            PUSD is a fully-backed, transparent stablecoin pegged to the US dollar. 
            Mint, redeem, and transact with confidence.
          </p>

          {/* CTA Buttons */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 h-12 rounded-xl">
              <Link href="/dashboard">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 h-12 rounded-xl">
              <Link href="/stats">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div 
            className={cn(
              "mt-16 flex items-center justify-center gap-6 sm:gap-10 text-sm transition-all duration-700 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xl font-semibold text-foreground">$1</span>
              <span className="text-muted-foreground text-xs">Always</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xl font-semibold text-foreground">115%</span>
              <span className="text-muted-foreground text-xs">Backed</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xl font-semibold text-foreground">0.3%</span>
              <span className="text-muted-foreground text-xs">Flat fee</span>
            </div>
          </div>
        </div>

        {/* Floating UI preview */}
        <div 
          className={cn(
            "mt-20 max-w-sm mx-auto transition-all duration-1000 delay-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl" />
            
            {/* Card */}
            <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-black/5">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Your Balance</span>
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Live
                </span>
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-4xl font-bold tracking-tight font-mono">$0.00</p>
                <p className="text-sm text-muted-foreground font-mono">0.0000 PUSD</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full h-11 rounded-xl text-sm font-medium">
                  Deposit
                </Button>
                <Button className="w-full h-11 rounded-xl text-sm font-medium">
                  Mint
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
