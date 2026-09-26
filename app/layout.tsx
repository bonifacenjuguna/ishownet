import type { Metadata } from 'next';
import { Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans-loaded',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ishownet.vercel.app'),
  title: 'iShowNet — Internet Speed Test',
  description: 'iShowNet is a fast, animated internet speed test measuring ping, jitter, packet loss, download, upload, and bufferbloat.',
  applicationName: 'iShowNet',
  openGraph: {
    title: 'iShowNet — Internet Speed Test',
    description: 'Measure your internet connection with iShowNet.',
    url: 'https://ishownet.vercel.app',
    siteName: 'iShowNet',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'iShowNet — Internet Speed Test',
    description: 'Measure your internet connection with iShowNet.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ishownet-theme');if(t!=='dark-red'&&t!=='light-red'&&t!=='dark-purple'&&t!=='dark-copper')t=(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')+'-red';var p=t.split('-');document.documentElement.setAttribute('data-theme',p[0]);document.documentElement.setAttribute('data-accent',p[1]);localStorage.setItem('ishownet-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${instrumentSans.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}