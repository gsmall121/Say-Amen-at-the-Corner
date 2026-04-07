import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Say Amen at the Corner | Golf Pool 2026',
  description: 'The premier golf major pool for the 2026 season. Pick your players, track scores, and compete with friends across all four majors.',
  keywords: 'golf pool, major championship, Masters, US Open, The Open, PGA Championship',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen grass-bg">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
