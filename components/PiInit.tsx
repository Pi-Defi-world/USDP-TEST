'use client';

import { useEffect } from 'react';

export default function PiInit() {
  useEffect(() => {
    let cancelled = false;

    const initPi = () => {
      try {
        const w = window as { Pi?: { init: (options: { version: string }) => void } };
        if (w && w.Pi && typeof w.Pi.init === 'function') {
          console.log('🔧 Initializing Pi SDK...');
          w.Pi.init({ version: '2.0' });
          console.log('✅ Pi SDK initialized successfully');
          return true;
        } else {
          console.log('⏳ Pi SDK not ready yet...');
        }
      } catch (err) {
        console.error('❌ Pi SDK initialization error:', err);
      }
      return false;
    };

    console.log('🚀 PiInit component mounted, checking for Pi SDK...');

    // Try immediately
    if (!initPi()) {
      console.log('⏳ Waiting for Pi SDK to load...');
      const start = Date.now();
      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }
        if (initPi()) {
          console.log('✅ Pi SDK initialized successfully!');
          clearInterval(interval);
        } else if (Date.now() - start > 8000) {
          console.warn('⚠️ Pi SDK initialization timeout after 8 seconds');
          clearInterval(interval);
        }
      }, 200);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}


