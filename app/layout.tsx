import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PiProvider } from '@/components/providers/pi-provider';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'USDP Platform',
  description: 'A production-grade USD-pegged stablecoin built on Pi Network with passkey authentication and real-time pricing',
  keywords: ['stablecoin', 'pi network', 'cryptocurrency', 'defi', 'passkey', 'authentication'],
  authors: [{ name: 'Zyra Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <Script id="pi-sdk-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.Pi) {
              window.Pi.init({ version: "2.0", sandbox: true });
            }
          `
        }} />
      </head>
      <body className={`${inter.className} pb-20 lg:pb-0`}>
        <PiProvider>
          <Navbar />
          {children}
          <Toaster />
        </PiProvider>
      </body>
    </html>
  );
}
