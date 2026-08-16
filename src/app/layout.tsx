import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GabaySJNHS | Guidance Counseling & Disciplinary Management',
  description: 'Guidance counseling management, OCR handwritten note digitization, and enrollment disciplinary clearance system for San Jose National High School.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
