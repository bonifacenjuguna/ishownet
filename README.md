# Speednet

A real, animated internet speed test: ping, jitter, packet loss, download, upload,
and bufferbloat — deployable to Vercel's free Hobby tier.

## What's real vs. approximated

- **Ping / jitter** — real round trips against an Edge Function that returns `204` instantly.
  The very first ping is discarded because it pays for DNS/TLS setup, not real latency.
- **Download / upload** — real transfers. Download streams random (incompressible) bytes
  from an Edge Function across 4 parallel connections; upload sends random payloads via
  `XMLHttpRequest` (needed for real upload-progress events; `fetch` doesn't expose them
  reliably across browsers) across 3 parallel connections. The first ~1.5s of each
  transfer (TCP slow-start) is excluded from the final number.
- **Bufferbloat** — idle ping measured first, then ping measured again *while* download
  and upload are saturating the link. The increase is graded A–F using thresholds similar
  to common bufferbloat testing tools. This is a good proxy, not a lab-grade measurement.
- **Packet loss** — approximated as the percentage of ping requests that time out or
  fail. HTTP/TCP can't see raw UDP packet loss, so treat this as an estimate.
- **IP / location** — IP and city/country come from Vercel's edge geolocation headers.
- **Network type** (Wi-Fi / Ethernet / cellular) — read from the browser's
  `navigator.connection` API where available (Chrome/Edge/Android). Safari and Firefox
  don't expose it, so it falls back to "Not reported".
- **History / trend graph** — stored in `localStorage` only. Nothing is sent to a
  server; clearing browser data clears the history.

## Design

- One ring, one job: it only ever shows the measurement in progress (or, once a test is
  done, whichever of download/upload you select from the step tabs). It locks each
  number in place when a stage finishes instead of decaying back toward zero, and always
  ends on "Test again" / "Try again" rather than an ambiguous idle state.
- Every other metric (ping, jitter, packet loss, bufferbloat, location, IP, connection
  type, data used) lives in its own card below the ring, laid out in a responsive grid
  that reflows from 4 → 2 → 1 columns.
- An "Insights" section translates the raw numbers into what they mean for video calls,
  HD/4K streaming, gaming, cloud gaming and live streaming.
- Single accent color (warm gold/copper), no theme switcher, no region picker — kept out
  because there was no way to make either look intentional. The header only has a unit
  toggle (Mbps / MB/s).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel (free)

```bash
npm install -g vercel   # if you don't have it
vercel                  # first deploy, follow the prompts
vercel --prod           # promote to production
```

Or connect the repo at vercel.com → New Project → import this repo → Deploy. No
environment variables are required.

## Project structure

```
app/
  page.tsx              the whole UI (hero ring, steps, result cards, insights, history)
  layout.tsx             fonts + global shell
  globals.css            design tokens + all component styles
  api/ping/route.ts      latency probe
  api/download/route.ts  streamed download payload
  api/upload/route.ts    upload sink
  api/meta/route.ts      IP / geo from Vercel edge headers
components/
  Header.tsx, Footer.tsx logo, nav, unit toggle, footer columns
  SpeedRing.tsx           the single measuring ring (download outer arc, upload inner arc)
  Waveform.tsx            live bar-chart while a transfer is running
  StatCard.tsx            the reusable metric card used across the results grid
  ActivityList.tsx        "what can you do with this" verdicts
  HistoryGraph.tsx, HistoryList.tsx   trend line + recent-runs table
  ResultCard.tsx          shareable PNG result card
lib/
  engine.ts               orchestrates ping → download → upload, locks final values
  edgeHandlers.ts          Edge Runtime handlers shared by the API routes
  format.ts               number formatting + activity/verdict logic
  storage.ts               localStorage history
  types.ts                 shared TypeScript types
```
