// EDGE HANDLERS
// Shared by the API route wrappers. Keeping the handlers here makes the measurement
// endpoints tiny and keeps their behavior consistent across the app.

export const runtime = 'edge';

export async function handlePing() {
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'x-ishownet-ts': Date.now().toString(),
    },
  });
}

export async function handleDownload() {
  const size = 2 * 1024 * 1024;
  const chunk = new Uint8Array(64 * 1024);
  crypto.getRandomValues(chunk);
  const stream = new ReadableStream({
    pull(controller) {
      for (let i = 0; i < 16; i++) controller.enqueue(chunk);
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

export async function handleUpload(request: Request) {
  await request.arrayBuffer();
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

export async function handleMeta(request: Request) {
  const h = request.headers;
  return Response.json({
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    city: h.get('x-vercel-ip-city') || null,
    country: h.get('x-vercel-ip-country') || null,
    region: h.get('x-vercel-ip-country-region') || null,
    latitude: h.get('x-vercel-ip-latitude') || null,
    longitude: h.get('x-vercel-ip-longitude') || null,
    isp: h.get('x-vercel-ip-asn') || null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}