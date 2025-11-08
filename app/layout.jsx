import '../src/index.css';
import ThemeScript from './ThemeScript';

export const metadata = {
  title: 'TherapyAI',
  description: 'Virtual mental health assistant',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

