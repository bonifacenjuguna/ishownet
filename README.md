# iShowNet

A browser-based internet speed test that measures real connection performance.

**Live:** https://ishownet.vercel.app

## Measures

- Ping and jitter
- Packet loss estimate
- Download and upload throughput
- Latency while the connection is under load
- Bufferbloat grade
- Network type, IP, ASN, and edge location
- Local test history
- Practical activity guidance for calls, streaming, gaming, cloud gaming, and live streaming

## How it works

The browser runs the measurement engine directly against Cloudflare's edge network. The official Cloudflare speedtest engine measures download/upload throughput, unloaded and loaded latency, jitter, and packet loss without routing test traffic through Vercel. Connection metadata comes from Cloudflare's speed-test metadata endpoint.

Results and history stay in the browser. No account or environment variables are required.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  page.tsx
  layout.tsx
  globals.css
components/
  Header.tsx
  Footer.tsx
  Logo.tsx
  ThemeToggle.tsx
  SpeedRing.tsx
  Waveform.tsx
  StatCard.tsx
  ActivityList.tsx
  HistoryGraph.tsx
  HistoryList.tsx
  ResultCard.tsx
  icons.tsx

hooks/
  useSynchronizedMetric.ts

lib/
  engine.ts
  format.ts
  storage.ts
  types.ts
```

## Deployment

The repository is connected to Vercel. Push to `main`, let Vercel build the commit, then monitor the deployment.

## License

MIT
