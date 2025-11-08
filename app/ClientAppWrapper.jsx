'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';
import ThemeProvider from '../src/context/ThemeContext';

export default function ClientAppWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure we're in the browser before rendering
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  // Don't render anything until we're confirmed to be in the browser
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

