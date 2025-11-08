'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';
import ThemeProvider from '../../src/context/ThemeContext';

export const dynamic = 'force-dynamic';

export default function CatchAllPage() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

