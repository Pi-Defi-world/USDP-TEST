'use client';

import { Shield, Zap, Lock, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Fully Backed',
    description: 'Every PUSD is backed by overcollateralized reserves. Transparent, verifiable, and secure.',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Mint and redeem PUSD instantly. No waiting periods, no intermediaries.',
  },
  {
    icon: Lock,
    title: 'Pi Native',
    description: 'Built specifically for Pi Network. Seamless integration with the Pi ecosystem.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Pricing',
    description: 'Oracle-powered price feeds ensure accurate valuations at all times.',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4">Why PUSD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-4">
            Built for stability.
            <br />
            Designed for everyone.
          </h2>
          <p className="text-muted-foreground text-lg">
            A stablecoin protocol that prioritizes security, transparency, and user experience.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
