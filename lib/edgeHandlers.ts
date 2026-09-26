// Shared Edge Runtime handlers used by the /api routes.

const CHUNK_SIZE = 64 * 1024; // 64KB per streamed chunk
const POOL_SIZE = 16 * 1024 * 1024; // 16MB of randomness, generated once per server instance
// The client currently requests 8MB per download fetch (see engine.ts). No single
// response may ever exceed POOL_SIZE — see the correctness note below — so this cap
// tracks the pool size directly rather than being an independent constant that could
// drift out of sync with it.
const MAX_DOWNLOAD_BYTES = POOL_SIZE;

// Generating cryptographically-random bytes is real CPU work. Doing it fresh for
// every 64KB chunk, on every pull, across 4 concurrent streams, is expensive enough
// to bottleneck the function under load — which shows up to the client as bursty,
// erratic throughput (fast, then a stall, then a catch-up burst) instead of a smooth
// number. Generating one pool once (per cold start) and serving chunks as cheap
// memory copies from it removes that bottleneck entirely.
//
// Correctness constraint: a response must never contain a repeated block. Reusing
// the pool works because we serve it as one *contiguous, non-wrapping* slice per
// request — every byte in a given response is distinct. If a response were ever
// allowed to wrap past the end of the pool, the wrapped portion would be a byte-for-
// byte duplicate of an earlier portion of the *same* response: an 8MB request against
// a 4MB pool, for instance, would have its second half exactly equal its first half —
// a massive, trivially compressible redundancy that defeats the entire point of using
// "random" payload in the first place (the response declares Content-Encoding:
// identity, but that only stops *our own* server from compressing it; it doesn't
// guarantee every intermediary honors that header). downloadHandler enforces this by
// clamping every request to at most POOL_SIZE bytes, so a wrap can never happen.
let sharedPool: Uint8Array | null = null;
function getPool(): Uint8Array {
  if (!sharedPool) {
    const pool = new Uint8Array(POOL_SIZE);
    for (let offset = 0; offset < POOL_SIZE; offset += 65536) {
      crypto.getRandomValues(pool.subarray(offset, Math.min(offset + 65536, POOL_SIZE)));
    }
    sharedPool = pool;
  }
  return sharedPool;
}

/** A `size`-byte, non-wrapping slice of `pool` starting at `start`.
 *  Always a zero-copy view — no allocation at all. Callers must guarantee
 *  `start + size <= pool.length`; see the correctness note above. */
function chunkFromPool(pool: Uint8Array, start: number, size: number): Uint8Array {
  return pool.subarray(start, start + size);
}

/** GET /api/ping — smallest possible round trip, used for latency + jitter. */
export async function pingHandler(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
      'x-speednet-ts': Date.now().toString(),
    },
  });
}

/**
 * GET /api/download?bytes=N — streams N bytes (default 10MB, capped at POOL_SIZE)
 * of random-looking data so it can't be compressed away, letting the client
 * measure real throughput from the Response stream.
 */
export async function downloadHandler(req: Request) {
  const url = new URL(req.url);
  const requested = Number(url.searchParams.get('bytes') ?? 10 * 1024 * 1024);
  const total = Math.max(0, Math.min(isNaN(requested) ? 10 * 1024 * 1024 : requested, MAX_DOWNLOAD_BYTES));
  const pool = getPool();

  let sent = 0;
  // Random start offset, but constrained so [cursor, cursor + total) never runs
  // past the end of the pool — every byte in the response is then guaranteed
  // distinct (see the correctness note on chunkFromPool above).
  const cursor = Math.floor(Math.random() * (pool.length - total + 1));
  // Pull-based: a chunk is produced only when the client is ready for more,
  // so memory stays flat and aborting mid-test is instant.
  const stream = new ReadableStream({
    pull(controller) {
      if (sent >= total) {
        controller.close();
        return;
      }
      const size = Math.min(CHUNK_SIZE, total - sent);
      controller.enqueue(chunkFromPool(pool, cursor + sent, size));
      sent += size;
    },
    cancel() {
      // Client aborted early (hit the test's deadline) — nothing to clean up,
      // the pool is shared and immutable.
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(total),
      'Content-Encoding': 'identity',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * POST /api/upload — reads and discards the request body, reporting how
 * many bytes it received. The client measures its own send-side timing;
 * this just needs to drain the stream as fast as possible.
 */
export async function uploadHandler(req: Request) {
  const reader = req.body?.getReader();
  let received = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) received += value.byteLength;
      }
    } catch {
      // The client aborts the request right at the test's deadline by design —
      // treat that as a normal end of stream instead of an unhandled failure.
    }
  }
  return new Response(JSON.stringify({ received }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/**
 * Vercel's edge geolocation headers cover city/region/country/coordinates, but not
 * ISP or ASN — there's no header for that. Getting an actual ISP name means asking
 * a public IP-intelligence service. ipapi.co's free tier needs no API key and
 * returns an `org` field that's usually the ISP/carrier name.
 *
 * Known limitation: this call is made from the server, so it goes out from Vercel's
 * shared edge egress IPs rather than the visitor's own — under real traffic, many
 * visitors' lookups end up sharing that same pool of egress IPs, and free-tier
 * services like this rate-limit by source IP. Expect this to intermittently return
 * null under load rather than treating a null ISP as a bug. A short timeout and a
 * try/catch keep a slow or rate-limited lookup from ever blocking the rest of the
 * page's info.
 */
// The page fetches /api/meta once on load and the engine fetches it again when a
// test starts — normally within seconds of each other, for the same IP. Caching
// briefly avoids doubling the external lookup's exposure to its own rate limit.
// Best-effort only: edge isolates are ephemeral, so this only helps when the same
// instance happens to serve both requests, and does no harm when it doesn't.
const ISP_CACHE_TTL_MS = 5 * 60 * 1000;
const ISP_CACHE_MAX_ENTRIES = 500;
const ispCache = new Map<string, { isp: string | null; expiresAt: number }>();

async function lookupIsp(ip: string | null): Promise<string | null> {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) return null;

  const cached = ispCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.isp;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  let isp: string | null = null;
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      isp = typeof data.org === 'string' && data.org.trim() ? data.org.trim() : null;
    }
  } catch {
    isp = null;
  } finally {
    clearTimeout(timer);
  }

  if (ispCache.size >= ISP_CACHE_MAX_ENTRIES) {
    const oldest = ispCache.keys().next().value;
    if (oldest !== undefined) ispCache.delete(oldest);
  }
  ispCache.set(ip, { isp, expiresAt: Date.now() + ISP_CACHE_TTL_MS });
  return isp;
}

/** GET /api/meta — IP / ISP / geo, read from Vercel's edge geolocation headers
 *  plus an ISP lookup (see lookupIsp above). */
export async function metaHandler(req: Request) {
  const h = req.headers;
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const isp = await lookupIsp(ip);
  const geo = {
    ip,
    isp,
    city: h.get('x-vercel-ip-city') ? decodeURIComponent(h.get('x-vercel-ip-city')!) : null,
    region: h.get('x-vercel-ip-country-region') ?? null,
    country: h.get('x-vercel-ip-country') ?? null,
    postalCode: h.get('x-vercel-ip-postal-code') ?? null,
    timezone: h.get('x-vercel-ip-timezone') ?? null,
    latitude: h.get('x-vercel-ip-latitude') ?? null,
    longitude: h.get('x-vercel-ip-longitude') ?? null,
    executedIn: process.env.VERCEL_REGION ?? 'dev',
  };
  return new Response(JSON.stringify(geo), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
