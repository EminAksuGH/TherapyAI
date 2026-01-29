import '../src/index.css';
import { headers } from 'next/headers';

export const metadata = {
  title: 'TherapyAI',
  description: 'Virtual mental health assistant',
};

export const dynamic = 'force-dynamic';

const getRequestLocale = async () => {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get('x-locale');
  if (localeHeader === 'tr' || localeHeader === 'en') {
    return localeHeader;
  }

  const acceptLanguage = requestHeaders.get('accept-language');
  if (!acceptLanguage) return 'en';

  const firstLang = acceptLanguage.split(',')[0]?.trim().toLowerCase();
  if (firstLang?.startsWith('tr')) return 'tr';
  return 'en';
};

export default async function RootLayout({ children }) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                    var theme = localStorage.getItem('theme');
                    if (!theme) {
                      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

