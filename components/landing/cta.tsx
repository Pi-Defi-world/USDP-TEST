'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-6">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Connect your Pi wallet and start minting PUSD in seconds. No complex setup required.
          </p>
          <Button size="lg" asChild className="btn-accent text-base px-8 h-12">
            <Link href="/dashboard">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
