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

const siteUrl = 'https://ishownet.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL('https://ishownet.vercel.app'),
  title: 'Internet Speed Test — Download, Upload & Ping | iShowNet',
  description:
    'Test your internet connection for download speed, upload speed, ping, jitter, packet loss and bufferbloat. Free browser-based speed test.',
  applicationName: 'iShowNet',
  openGraph: {
    title: 'Internet Speed Test — Download, Upload & Ping | iShowNet',
    description:
      'Test download, upload, ping, jitter, packet loss and bufferbloat in your browser with iShowNet.',
    url: 'https://ishownet.vercel.app',
    siteName: 'iShowNet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internet Speed Test — Download, Upload & Ping | iShowNet',
    description:
      'Test download, upload, ping, jitter, packet loss and bufferbloat in your browser with iShowNet.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ishownet-theme');if(t!=='dark-red'&&t!=='light-red'&&t!=='dark-purple'&&t!=='dark-copper')t=(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')+'-red';var p=t.split('-');document.documentElement.setAttribute('data-theme',p[0]);document.documentElement.setAttribute('data-accent',p[1]);localStorage.setItem('ishownet-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${instrumentSans.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}
