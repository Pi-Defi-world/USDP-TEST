'use client';

import { useEffect, useState, useRef } from 'react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'PUSD Price', value: 1, prefix: '$', decimals: 2, subtext: 'Stable peg' },
  { label: 'Total Supply', value: 0, suffix: '', decimals: 0, subtext: 'PUSD minted' },
  { label: 'Backing Ratio', value: 115, suffix: '%', decimals: 0, subtext: 'Overcollateralized' },
  { label: 'Protocol Fee', value: 0.3, suffix: '%', decimals: 1, subtext: 'Mint & redeem' },
];

export function LandingStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="stats" className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Protocol</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Transparent by design
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className={cn(
                "text-center space-y-2 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {isVisible ? (
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix || ''} 
                    suffix={stat.suffix || ''} 
                    decimals={stat.decimals}
                    duration={1500}
                  />
                ) : (
                  '-'
                )}
              </p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Reserve breakdown */}
        <div 
          className={cn(
            "mt-20 max-w-lg mx-auto transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">Reserve Composition</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pi Collateral</span>
                  <span className="font-mono font-medium">60%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full bg-accent transition-all duration-1000 ease-out",
                      isVisible ? "w-[60%]" : "w-0"
                    )}
                    style={{ transitionDelay: '600ms' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">USD Reserves</span>
                  <span className="font-mono font-medium">40%</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full bg-foreground/20 transition-all duration-1000 ease-out",
                      isVisible ? "w-[40%]" : "w-0"
                    )}
                    style={{ transitionDelay: '800ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
