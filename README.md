# iShowNet

A browser-based internet speed and connection-quality test powered by Cloudflare's edge network.

**Live:** https://ishownet.vercel.app

## Measures

- Ping and jitter
- Download and upload throughput
- Latency while the connection is under load
- Bufferbloat grade
- Cloudflare edge location, IP, ASN, city, and country
- Network type
- Local test history
- Practical activity guidance for calls, streaming, gaming, cloud gaming, and live streaming

Packet loss is currently not shown because Cloudflare's browser engine requires a separately configured TURN service for that measurement. iShowNet does not fake a zero value.

## How it works

The browser runs Cloudflare's official `@cloudflare/speedtest` engine directly against Cloudflare's edge network. The engine performs latency, download, upload, and loaded-latency measurements using the same measurement technology that powers Cloudflare's speed test.

The app keeps the presentation layer, history, themes, PWA experience, and practical guidance while Cloudflare handles the network measurement path.

Results and history stay in the browser. No account or environment variables are required.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deployment

The repository is connected to Vercel. Push to `main`, let Vercel build the commit, then monitor the deployment.

## License

MIT
