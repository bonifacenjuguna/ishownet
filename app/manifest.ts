import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'iShowNet — Internet Speed Test',
    short_name: 'iShowNet',
    description: 'Free browser-based internet speed and connection quality test.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070a',
    theme_color: '#ef233c',
    lang: 'en',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
