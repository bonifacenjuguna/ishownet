// EDGE HANDLERS
// Shared by the API route wrappers. Keeping the handlers here makes the measurement
// endpoints tiny and keeps their behavior consistent across the app.

import { DOWNLOAD_CHUNK_BYTES, DOWNLOAD_SIZE_BYTES } from './constants';

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
  const chunk = new Uint8Array(DOWNLOAD_CHUNK_BYTES);
  crypto.getRandomValues(chunk);
  const stream = new ReadableStream({
    pull(controller) {
      for (let i = 0; i < DOWNLOAD_SIZE_BYTES / DOWNLOAD_CHUNK_BYTES; i++) controller.enqueue(chunk);
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': DOWNLOAD_SIZE_BYTES.toString(),
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
    asn: h.get('x-vercel-ip-asn') || null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}