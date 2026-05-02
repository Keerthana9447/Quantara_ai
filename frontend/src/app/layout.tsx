import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Quantara AI — Quantifying Value. Decoding Liquidity.',
  description: 'AI-Powered Collateral Valuation & Resale Liquidity Engine for NBFCs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
