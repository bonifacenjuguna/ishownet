/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      // Test payload routes must never be cached by the CDN or the browser,
      // or measured throughput becomes meaningless.
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ],
};

export default nextConfig;
