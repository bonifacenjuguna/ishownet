'use client';

import { useRef, useState } from 'react';
import SpeedTest from '@cloudflare/speedtest';

interface CloudflareResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  downloadLatencyMs: number;
  uploadLatencyMs: number;
}

function toMbps(bps: number): number {
  return bps / 1_000_000;
}

function safeNumber(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export default function CloudflareCompare() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CloudflareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const testRef = useRef<SpeedTest | null>(null);

  async function runComparison() {
    if (running) return;

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const test = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: 'latency', numPackets: 12 },
          { type: 'download', bytes: 100_000_000, count: 3 },
          { type: 'upload', bytes: 50_000_000, count: 3 },
        ],
        measureDownloadLoadedLatency: true,
        measureUploadLoadedLatency: true,
        bandwidthMinRequestDuration: 100,
      });

      testRef.current = test;

      await new Promise<void>((resolve, reject) => {
        test.onFinish = () => resolve();
        test.onError = (message) => reject(new Error(message));
        test.play();
      });

      const results = test.results;

      setResult({
        downloadMbps: safeNumber(toMbps(results.getDownloadBandwidth())),
        uploadMbps: safeNumber(toMbps(results.getUploadBandwidth())),
        pingMs: safeNumber(results.getUnloadedLatency()),
        jitterMs: safeNumber(results.getUnloadedJitter()),
        downloadLatencyMs: safeNumber(results.getDownLoadedLatency()),
        uploadLatencyMs: safeNumber(results.getUpLoadedLatency()),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cloudflare comparison failed.');
    } finally {
      testRef.current = null;
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
            Run a separate browser test against Cloudflare&apos;s edge network.
            This does not replace your iShowNet result — it gives us a second
            measurement path to compare.
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
            <div>
              <strong>{result.jitterMs.toFixed(1)} ms</strong>
              <span>Jitter</span>
            </div>
            <div>
              <strong>{result.downloadLatencyMs.toFixed(1)} ms</strong>
              <span>Loaded download</span>
            </div>
            <div>
              <strong>{result.uploadLatencyMs.toFixed(1)} ms</strong>
              <span>Loaded upload</span>
            </div>
          </div>
        )}

        <p className="fineprint">
          Cloudflare&apos;s engine runs the measurement directly from your browser
          against Cloudflare&apos;s edge network. Results are for comparison only.
        </p>
      </div>
    </section>
  );
}
