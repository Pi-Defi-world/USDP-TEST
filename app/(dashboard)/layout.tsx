'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { useAuthStore } from '@/lib/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Protect all dashboard routes - redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Don't render content if not authenticated (prevents flash)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
