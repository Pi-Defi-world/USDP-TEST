'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Send, History } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  onMint: () => void;
  onRedeem: () => void;
}

export function QuickActions({ onMint, onRedeem }: QuickActionsProps) {
  const actions = [
    {
      label: 'Mint',
      icon: ArrowUpRight,
      onClick: onMint,
      variant: 'accent' as const,
    },
    {
      label: 'Redeem',
      icon: ArrowDownLeft,
      onClick: onRedeem,
      variant: 'default' as const,
    },
    {
      label: 'Send',
      icon: Send,
      href: '#',
      variant: 'default' as const,
      disabled: true,
    },
    {
      label: 'History',
      icon: History,
      href: '/stats',
      variant: 'default' as const,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action) => {
        const content = (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              action.variant === 'accent' 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-secondary text-foreground'
            }`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </div>
        );

        if (action.href) {
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`rounded-xl transition-colors hover:bg-secondary/50 ${
                action.disabled ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            className="rounded-xl transition-colors hover:bg-secondary/50 disabled:opacity-50"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
