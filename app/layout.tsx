import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PiNetworkProvider } from '@/context/PiNetworkContext';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Zyra Platform - Pi-Backed Stablecoin',
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
        <meta httpEquiv="Permissions-Policy" content="publickey-credentials-create=*" />
        <meta httpEquiv="Permissions-Policy" content="publickey-credentials-get=*" />
      </head>
      <body className={inter.className}>
        <PiNetworkProvider>
          {children}
          <Toaster />
        </PiNetworkProvider>
      </body>
    </html>
  );
}
