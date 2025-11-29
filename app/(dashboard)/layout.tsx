'use client';

import { DashboardNavbar } from '@/components/DashboardNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-16">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
