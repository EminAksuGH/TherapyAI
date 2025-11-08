'use client';

import dynamicImport from 'next/dynamic';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

// Dynamically import with SSR disabled to prevent server-side rendering errors
const ClientApp = dynamicImport(
  () => import('../ClientAppWrapper'),
  { 
    ssr: false,
    loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  }
);

export default function CatchAllPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return <ClientApp />;
}

