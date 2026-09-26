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

The browser talks to small same-origin Edge endpoints for ping, download, upload, and connection metadata. Throughput uses adaptive parallel requests and measures sustained transfer performance rather than displaying invented frontend values.

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
  api/
    ping/route.ts
    download/route.ts
    upload/route.ts
    meta/route.ts

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
  edgeHandlers.ts
  constants.ts
  format.ts
  storage.ts
  types.ts
```

## Deployment

The repository is connected to Vercel. Push to `main`, let Vercel build the commit, then monitor the deployment.

## License

MIT
