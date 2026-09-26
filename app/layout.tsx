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
const siteTitle = 'Internet Speed Test — Download, Upload & Ping | iShowNet';
const siteDescription =
  'Test your internet connection for download speed, upload speed, ping, jitter, packet loss and bufferbloat. Free browser-based speed test.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | iShowNet',
  },
  description: siteDescription,
  applicationName: 'iShowNet',
  keywords: [
    'internet speed test',
    'speed test',
    'free internet speed test',
    'online internet speed test',
    'internet speed checker',
    'network speed test',
    'WiFi speed test',
    'ping test',
    'latency test',
    'jitter test',
    'packet loss test',
    'bufferbloat test',
    'download speed test',
    'upload speed test',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'iShowNet',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'iShowNet — Internet Speed Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/twitter-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'iShowNet',
              url: siteUrl,
              description:
                'A browser-based internet speed and connection quality test for download, upload, ping, jitter, packet loss and bufferbloat.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web Browser',
              browserRequirements: 'Requires JavaScript and a modern web browser.',
              isAccessibleForFree: true,
              featureList: [
                'Internet speed test',
                'Download speed measurement',
                'Upload speed measurement',
                'Ping and latency measurement',
                'Jitter measurement',
                'Packet loss estimate',
                'Bufferbloat measurement',
                'Connection quality analysis',
              ],
            }),
          }}
        />
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
