'use client';

import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Stats', href: '/stats' },
    { label: 'Developers', href: '/developers' },
  ],
  resources: [
    { label: 'Documentation', href: '/developers' },
    { label: 'Help Center', href: '/help/testnet' },
  ],
  legal: [
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">PUSD</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              The stablecoin protocol for Pi Network.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="font-medium mb-4 text-sm">Product</p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="font-medium mb-4 text-sm">Resources</p>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-medium mb-4 text-sm">Legal</p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Built on Pi Network Testnet
          </p>
          <p className="text-sm text-muted-foreground">
            This is a demonstration platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
