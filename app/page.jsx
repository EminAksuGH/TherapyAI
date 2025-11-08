'use client';

import dynamicImport from 'next/dynamic';
import { useEffect, useState } from 'react';

// Disable server-side rendering since React Router handles routing client-side
export const dynamic = 'force-dynamic';

// Dynamically import with SSR disabled to prevent server-side rendering errors
const ClientApp = dynamicImport(
  () => import('./ClientAppWrapper'),
  { 
    ssr: false,
    loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  }
);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return <ClientApp />;
}

