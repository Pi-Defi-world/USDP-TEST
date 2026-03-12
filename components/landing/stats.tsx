'use client';

import { useEffect, useState } from 'react';

const stats = [
  { label: 'PUSD Price', value: '$1.00', subtext: 'Stable peg' },
  { label: 'Total Supply', value: '0', subtext: 'PUSD minted' },
  { label: 'Backing Ratio', value: '115%', subtext: 'Overcollateralized' },
  { label: 'Protocol Fee', value: '0.3%', subtext: 'Mint & redeem' },
];

export function LandingStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="stats" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4">Protocol</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Transparent by design
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center space-y-2"
            >
              <p className="money-lg text-foreground">
                {mounted ? stat.value : '-'}
              </p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Visual element - simplified reserve breakdown */}
        <div className="mt-16 max-w-lg mx-auto">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Reserve Composition</span>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pi Collateral</span>
                  <span className="font-mono">60%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-accent w-[60%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">USD Reserves</span>
                  <span className="font-mono">40%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/30 w-[40%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
