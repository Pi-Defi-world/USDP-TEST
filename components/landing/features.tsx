'use client';

import { Shield, Zap, Lock, BarChart3 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Shield,
    title: 'Always backed',
    description: 'Every PUSD holds its value with 115% reserves. Your money stays safe.',
  },
  {
    icon: Zap,
    title: 'Instant',
    description: 'Get PUSD in seconds. Cash out anytime. No waiting, no approvals.',
  },
  {
    icon: Lock,
    title: 'Built for Pi',
    description: 'Designed from the ground up for Pi Network. Works right in your Pi Browser.',
  },
  {
    icon: BarChart3,
    title: 'Fair pricing',
    description: 'Live Pi prices mean you always get the right rate. No surprises.',
  },
];

export function LandingFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Why PUSD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-6">
            Stable money.
            <br />
            <span className="text-muted-foreground">Simple to use.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hold dollars on Pi Network. Send, save, or spend without the volatility.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group relative p-6 rounded-2xl border border-border bg-card transition-all duration-500",
                "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
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
