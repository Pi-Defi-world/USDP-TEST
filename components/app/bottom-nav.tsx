'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp, Wallet, PiggyBank, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/save', icon: PiggyBank, label: 'Save' },
  { href: '/dashboard/reserve', icon: Wallet, label: 'Reserve' },
  { href: '/stats', icon: TrendingUp, label: 'Stats' },
  { href: '/settings', icon: MoreHorizontal, label: 'More' },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      
      // Always show at top or bottom of page
      if (currentScrollY < 50 || currentScrollY > maxScroll - 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        // Scrolling down - hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        // Scrolling up - show
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={cn(
        'bottom-nav lg:hidden transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="px-4 pb-2">
        <nav className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (pathname?.startsWith(item.href) && item.href !== '/dashboard') ||
                (item.href === '/dashboard' && pathname === '/dashboard');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-xl transition-all duration-200',
                    isActive 
                      ? 'text-accent bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 mb-1 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} />
                  <span className={cn(
                    'text-[10px] font-medium',
                    isActive && 'text-accent'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
