'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';
import ThemeProvider from '../src/context/ThemeContext';

// Disable server-side rendering since React Router handles routing client-side
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

