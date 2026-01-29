'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';
import ThemeProvider from '../src/context/ThemeContext';
import '../src/i18n';

const getBasenameFromPath = (pathname) => {
  if (!pathname) return '';
  const firstSegment = pathname.split('/')[1];
  if (firstSegment === 'tr' || firstSegment === 'en') {
    return `/${firstSegment}`;
  }
  return '';
};

export default function ClientAppWrapper() {
  const [mounted, setMounted] = useState(false);
  const [basename, setBasename] = useState('');

  useEffect(() => {
    // Ensure we're in the browser before rendering
    if (typeof window !== 'undefined') {
      setBasename(getBasenameFromPath(window.location.pathname));
      setMounted(true);
    }
  }, []);

  // Don't render anything until we're confirmed to be in the browser
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return (
    <BrowserRouter basename={basename}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

