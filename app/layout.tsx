import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SafeShe — AI-Powered Women Safety & Prevention Platform',
  description:
    'SafeShe combines AI, real-time location intelligence and emergency response tools to help women stay safer before, during and after an incident.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body className="antialiased bg-navy-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
