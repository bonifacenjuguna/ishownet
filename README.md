# iShowNet

A real, animated internet speed test for measuring ping, jitter, packet loss, download, upload, and bufferbloat.

**Live:** https://ishownet.vercel.app

## What it measures

- **Ping / jitter** — real round trips against an Edge Function that returns `204` instantly. The first ping is discarded because it pays for DNS/TLS setup, not real latency.
- **Download / upload** — real transfers. Download requests a fixed 16 MiB random (incompressible) payload from an Edge Function across adaptive parallel connections; upload sends random payloads via `XMLHttpRequest` across 3 parallel connections. The first ~1.5s of each transfer (TCP slow-start) is excluded from the final number.
- **Bufferbloat** — idle ping is measured first, then ping is measured again while download and upload saturate the link. The increase is graded A–F using thresholds similar to common bufferbloat testing tools. This is a proxy, not a lab-grade measurement.
- **Packet loss** — approximated as the percentage of ping requests that time out or fail. HTTP/TCP cannot see raw UDP packet loss, so treat this as an estimate.
- **IP / location** — IP and city/country come from Vercel edge geolocation headers. The network identifier is exposed as an ASN, not an ISP name.
- **Network type** — read from the browser's `navigator.connection` API where available. Safari and Firefox may fall back to "Not reported".
- **History / trend graph** — stored in `localStorage` only. Nothing is sent to a server; clearing browser data clears the history.

## Design

- One ring, one job: it shows the measurement in progress or, after a test, the selected download/upload result.
- Metrics such as ping, jitter, packet loss, bufferbloat, location, IP, connection type, and data used live in responsive result cards.
- An **Insights** section translates the measurements into practical activities such as calls, streaming, gaming, cloud gaming, and live streaming.
- A unit toggle supports Mbps and MB/s.
- The interface supports dark and light themes.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
vercel --prod
```

Or import this repository into Vercel and deploy. No environment variables are required.

## Project structure

```
app/
  page.tsx              main UI
  layout.tsx            metadata, fonts, and global shell
  globals.css           design tokens and component styles
  api/ping/route.ts     latency probe
  api/download/route.ts streamed download payload
  api/upload/route.ts   upload sink
  api/meta/route.ts     IP / geo from Vercel edge headers
components/
  Header.tsx, Footer.tsx, Logo.tsx, ThemeToggle.tsx
  SpeedRing.tsx, Waveform.tsx, StatCard.tsx
  ActivityList.tsx, HistoryGraph.tsx, HistoryList.tsx
  ResultCard.tsx        shareable result card
lib/
  engine.ts             test orchestration
  edgeHandlers.ts       Edge Runtime handlers
  constants.ts          shared measurement protocol constants
  format.ts             formatting and activity logic
  storage.ts             local history
  types.ts               shared TypeScript types
```

## License

MIT
