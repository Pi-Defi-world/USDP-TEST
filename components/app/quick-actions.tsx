'use client';

import { ArrowUpRight, ArrowDownLeft, Send, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onMint: () => void;
  onRedeem: () => void;
}

export function QuickActions({ onMint, onRedeem }: QuickActionsProps) {
  const actions = [
    {
      label: 'Get PUSD',
      icon: ArrowDownLeft,
      onClick: onMint,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      label: 'Cash out',
      icon: ArrowUpRight,
      onClick: onRedeem,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      label: 'Send',
      icon: Send,
      href: '#',
      disabled: true,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    {
      label: 'Stats',
      icon: Clock,
      href: '/stats',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const content = (
          <div className="flex flex-col items-center gap-2.5 py-1">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200',
              action.iconBg,
              !action.disabled && 'group-hover:scale-105 group-active:scale-95'
            )}>
              <action.icon className={cn('w-5 h-5', action.iconColor)} />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </div>
        );

        if (action.href) {
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'group rounded-2xl transition-all duration-200 hover:bg-muted/50 active:bg-muted',
                action.disabled && 'opacity-40 pointer-events-none'
              )}
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
            className={cn(
              'group rounded-2xl transition-all duration-200 hover:bg-muted/50 active:bg-muted',
              'disabled:opacity-40 disabled:pointer-events-none'
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
