'use client';

import { useState } from 'react';

interface CloudflareResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const DOWNLOAD_BYTES = 10_000_000;
const UPLOAD_BYTES = 10_000_000;
const RUNS = 3;
const REQUEST_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  consume?: (response: Response) => Promise<void>,
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    if (consume) await consume(response);
    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Cloudflare request timed out.');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

async function measureDownload(): Promise<number[]> {
  const rates: number[] = [];

  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    let bytes = 0;
    const response = await fetchWithTimeout(
      `https://speed.cloudflare.com/__down?bytes=${DOWNLOAD_BYTES}&_=${Date.now()}-${i}`,
      { cache: 'no-store' },
      async (response) => {
        if (!response.ok || !response.body) {
          throw new Error('Cloudflare download request failed.');
        }

        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
        }
      },
    );

    const seconds = (performance.now() - start) / 1000;
    if (seconds > 0 && bytes > 0) {
      rates.push((bytes * 8) / 1_000_000 / seconds);
    }
  }

  return rates;
}

async function measureUpload(): Promise<number[]> {
  const payload = new Uint8Array(UPLOAD_BYTES);
  const rates: number[] = [];

  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();

    const response = await fetchWithTimeout(
      `https://speed.cloudflare.com/__up?_=${Date.now()}-${i}`,
      {
        method: 'POST',
        body: payload,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Cloudflare upload request failed.');
    }

    const seconds = (performance.now() - start) / 1000;
    if (seconds > 0) {
      rates.push((UPLOAD_BYTES * 8) / 1_000_000 / seconds);
    }
  }

  return rates;
}

async function measurePing(): Promise<number> {
  const samples: number[] = [];

  for (let i = 0; i < 8; i++) {
    const start = performance.now();
    const response = await fetchWithTimeout(
      `https://speed.cloudflare.com/__down?bytes=0&_=${Date.now()}-ping-${i}`,
      { cache: 'no-store' },
    );

    if (response.ok) samples.push(performance.now() - start);
  }

  return median(samples);
}

export default function CloudflareCompare() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CloudflareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runComparison() {
    if (running) return;

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const pingMs = await measurePing();
      const download = await measureDownload();
      const upload = await measureUpload();

      if (!download.length || !upload.length || !pingMs) {
        throw new Error('Cloudflare did not return enough measurements.');
      }

      setResult({
        downloadMbps: median(download),
        uploadMbps: median(upload),
        pingMs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cloudflare comparison failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="container section cf-compare-section">
      <div className="card cf-compare-card">
        <div className="cf-compare-copy">
          <p className="eyebrow">Secondary measurement</p>
          <h2>Compare with Cloudflare</h2>
          <p>
            Run a separate browser test directly against Cloudflare&apos;s edge
            network. It does not replace your iShowNet result; it gives us a
            second measurement path to compare.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={runComparison}
          disabled={running}
        >
          {running ? 'Testing Cloudflare…' : 'Run comparison'}
        </button>

        {error && <p className="error-msg">{error}</p>}

        {result && (
          <div className="cf-compare-results">
            <div>
              <strong>{result.downloadMbps.toFixed(1)} Mbps</strong>
              <span>Download</span>
            </div>
            <div>
              <strong>{result.uploadMbps.toFixed(1)} Mbps</strong>
              <span>Upload</span>
            </div>
            <div>
              <strong>{result.pingMs.toFixed(1)} ms</strong>
              <span>Ping</span>
            </div>
          </div>
        )}

        <p className="fineprint">
          This comparison transfers up to about 60 MB. Cloudflare&apos;s
          network selects the edge location through its anycast/BGP routing.
        </p>
      </div>
    </section>
  );
}
