import type { BufferbloatGrade, TestPhase, TestResult, TracePoint } from './types';

const API = '/api';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Sequential small round trips. Returns avg RTT, jitter, and % of pings that failed/timed out.
 *  `onSample`, when given, fires after every successful round trip with the running
 *  average and jitter so far, so the UI can count up live instead of waiting for all of them. */
async function measurePing(
  count: number,
  timeoutMs = 2000,
  discardFirst = false,
  onSample?: (avgMs: number, jitterMs: number) => void,
  maxTotalMs = Infinity
) {
  const samples: number[] = [];
  let lost = 0;
  let attempted = 0;
  const loopStart = performance.now();

  for (let i = 0; i < count; i++) {
    if (performance.now() - loopStart > maxTotalMs) break; // hard budget: never let this stage hang
    attempted += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const start = performance.now();
    try {
      await fetch(`${API}/ping?_=${Date.now()}-${i}`, { cache: 'no-store', signal: controller.signal });
      const rtt = performance.now() - start;
      // The very first request pays for DNS + TLS, which isn't real latency.
      if (!(discardFirst && i === 0)) {
        samples.push(rtt);
        if (onSample && samples.length) {
          const runningAvg = samples.reduce((a, b) => a + b, 0) / samples.length;
          let runningJitterSum = 0;
          for (let j = 1; j < samples.length; j++) runningJitterSum += Math.abs(samples[j] - samples[j - 1]);
          const runningJitter = samples.length > 1 ? runningJitterSum / (samples.length - 1) : 0;
          onSample(runningAvg, runningJitter);
        }
      }
    } catch {
      lost += 1;
    } finally {
      clearTimeout(timer);
    }
  }

  const avg = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  let jitterSum = 0;
  for (let i = 1; i < samples.length; i++) jitterSum += Math.abs(samples[i] - samples[i - 1]);
  const jitter = samples.length > 1 ? jitterSum / (samples.length - 1) : 0;
  const lossPct = attempted > 0 ? (lost / attempted) * 100 : 0;
  return { avg, jitter, lossPct };
}

interface ThroughputResult {
  mbps: number;
  bytes: number;
  trace: TracePoint[];
  /** How many parallel streams the ramp settled on. */
  streamsUsed: number;
  /** Total wall-clock time this measurement actually ran for. */
  durationMs: number;
}

/** Time-weighted average of trace samples at/after `cutoffT`. Each sample is weighted
 *  by the real elapsed time since the previous sample — not assumed to be exactly the
 *  200ms tick interval — so ordinary timer jitter between ticks can't skew the result
 *  the way a plain average-of-rates would. Falls back to `fallback` (the whole-test
 *  overall average) if there aren't enough steady-state samples to trust. */
function timeWeightedAverage(trace: TracePoint[], cutoffT: number, fallback: number): number {
  const steadyCount = trace.filter((p) => p.t >= cutoffT).length;
  if (steadyCount < 4) return fallback;

  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < trace.length; i++) {
    if (trace[i].t < cutoffT) continue;
    const prevT = i === 0 ? cutoffT : trace[i - 1].t;
    const weight = Math.max(1, trace[i].t - prevT);
    weightedSum += trace[i].mbps * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : fallback;
}

// --- Adaptive stream count + adaptive duration -----------------------------------
//
// Rather than guessing a fixed number of parallel streams and a fixed test length,
// we ramp concurrency up in stages and watch whether it's actually helping:
//   2 streams → is throughput still climbing significantly? → 4 → 8 → 16
// The moment adding streams stops meaningfully increasing throughput, we stop
// escalating and stay at that level for the rest of the test — that's "settled."
// What we learned during the ramp (how fast the connection is, how noisy the
// samples were) then decides how long the rest of the test should run: short for
// a slow connection, longer for a fast one, longer still if the samples looked
// unstable and could use more averaging.
const RAMP_LEVELS = [2, 4, 8, 16];
const RAMP_STEP_MS = 900; // how long we sample each concurrency level before judging it
const GROWTH_THRESHOLD = 0.15; // need >15% improvement over the previous level to justify escalating further
const MIN_SETTLED_WINDOW_MS = 2500; // always measure at least this long once streams have settled
const INSTABILITY_CV_THRESHOLD = 0.3; // coefficient of variation across ramp samples above this counts as "unstable"
const INSTABILITY_EXTENSION = 1.4; // stretch the planned duration by this much when unstable

function classifyDurationMs(mbps: number): number {
  if (mbps < 10) return 5000; // slow connection — a short test is plenty and gets the person an answer fast
  if (mbps < 100) return 7000;
  if (mbps < 500) return 10000;
  return 12000; // fast connection — needs longer to get a statistically solid steady-state average
}

/**
 * Runs `spawnWorker` copies concurrently, ramping the count up per `RAMP_LEVELS`
 * while it's still helping, then holding steady for an adaptively-chosen duration.
 * `spawnWorker` should loop transferring data, calling `addBytes` as it goes, until
 * `shouldStop()` returns true — it does not receive or need to know about a deadline.
 */
async function measureAdaptive(
  spawnWorker: (addBytes: (n: number) => void, shouldStop: () => boolean) => Promise<void>,
  onSample?: (mbps: number) => void
): Promise<ThroughputResult> {
  const start = performance.now();
  let totalBytes = 0;
  let windowBytes = 0;
  let windowStart = start;
  const trace: TracePoint[] = [];
  let stop = false;
  const shouldStop = () => stop;
  const addBytes = (n: number) => {
    totalBytes += n;
    windowBytes += n;
  };

  const sampleTimer = setInterval(() => {
    const now = performance.now();
    const seconds = (now - windowStart) / 1000;
    const mbps = seconds > 0 ? (windowBytes * 8) / 1e6 / seconds : 0;
    trace.push({ t: now - start, mbps });
    onSample?.(mbps);
    windowBytes = 0;
    windowStart = now;
  }, 200);

  const workers: Promise<void>[] = [];
  function ensureStreams(n: number) {
    while (workers.length < n) workers.push(spawnWorker(addBytes, shouldStop));
  }

  // --- Ramp phase ---
  let prevLevelMbps = 0;
  let settledStreams = RAMP_LEVELS[0];
  const rampSamples: number[] = [];

  for (let i = 0; i < RAMP_LEVELS.length; i++) {
    const level = RAMP_LEVELS[i];
    ensureStreams(level);
    const bytesAtStepStart = totalBytes;
    const stepStart = performance.now();
    await sleep(RAMP_STEP_MS);
    const bytesDelta = totalBytes - bytesAtStepStart;
    const elapsedS = (performance.now() - stepStart) / 1000;
    const levelMbps = elapsedS > 0 ? (bytesDelta * 8) / 1e6 / elapsedS : 0;
    rampSamples.push(levelMbps);
    settledStreams = level;

    const grewSignificantly = i === 0 || levelMbps >= prevLevelMbps * (1 + GROWTH_THRESHOLD);
    prevLevelMbps = levelMbps;
    if (!grewSignificantly) break; // diminishing returns from more concurrency — stay right here
  }

  // --- Decide total duration from what the ramp just measured ---
  let totalDurationMs = classifyDurationMs(prevLevelMbps);
  if (rampSamples.length >= 2) {
    const mean = rampSamples.reduce((a, b) => a + b, 0) / rampSamples.length;
    const variance = rampSamples.reduce((a, b) => a + (b - mean) ** 2, 0) / rampSamples.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    if (cv > INSTABILITY_CV_THRESHOLD) totalDurationMs = Math.round(totalDurationMs * INSTABILITY_EXTENSION);
  }

  // Streams are settled and won't change again from here — everything from this
  // point on is fair game for the final steady-state average.
  const settleMarkT = performance.now() - start;
  const deadline = start + Math.max(settleMarkT + MIN_SETTLED_WINDOW_MS, totalDurationMs);

  // --- Settled phase: keep running at `settledStreams` for the remaining budget ---
  while (performance.now() < deadline) await sleep(100);

  stop = true;
  await Promise.all(workers);
  clearInterval(sampleTimer);

  const elapsed = (performance.now() - start) / 1000;
  const overall = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
  const mbps = timeWeightedAverage(trace, settleMarkT, overall);

  return { mbps, bytes: totalBytes, trace, streamsUsed: settledStreams, durationMs: elapsed * 1000 };
}

// Matches the backend's random-data pool exactly (see edgeHandlers.ts) — the pool is
// sized so a single response can never wrap and repeat, so requesting right up to
// that size is safe and minimizes how often a fast, highly-parallel download needs
// to re-request.
const DOWNLOAD_CHUNK_BYTES = 16 * 1024 * 1024;

async function measureDownload(onSample?: (mbps: number) => void): Promise<ThroughputResult> {
  const url = `${API}/download`;

  return measureAdaptive(async (addBytes, shouldStop) => {
    while (!shouldStop()) {
      const controller = new AbortController();
      // Generous absolute safety net against a genuinely hung request — independent
      // of the adaptive deadline, which isn't known in advance inside this worker.
      const hangGuard = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(`${url}?bytes=${DOWNLOAD_CHUNK_BYTES}&_=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const reader = res.body?.getReader();
        if (!reader) break;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) addBytes(value.byteLength);
          if (shouldStop()) {
            controller.abort();
            break;
          }
        }
      } catch {
        // Aborted on stop, or a transient failure: back off briefly so we never spin.
        if (!shouldStop()) await sleep(120);
      } finally {
        clearTimeout(hangGuard);
      }
    }
  }, onSample);
}

async function measureUpload(onSample?: (mbps: number) => void): Promise<ThroughputResult> {
  const url = `${API}/upload`;
  const chunkSize = 4 * 1024 * 1024;
  const payload = new Uint8Array(chunkSize);
  for (let offset = 0; offset < chunkSize; offset += 65536) {
    crypto.getRandomValues(payload.subarray(offset, Math.min(offset + 65536, chunkSize)));
  }

  return measureAdaptive(async (addBytes, shouldStop) => {
    while (!shouldStop()) {
      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        let lastLoaded = 0;
        xhr.open('POST', url, true);
        xhr.upload.onprogress = (e) => {
          const delta = e.loaded - lastLoaded;
          lastLoaded = e.loaded;
          if (delta > 0) addBytes(delta);
          // There's no per-request deadline to hang a timer off anymore (the total
          // duration isn't known until the ramp finishes), so we check here — this
          // fires frequently during an active send, giving prompt stop response.
          if (shouldStop()) xhr.abort();
        };
        xhr.onloadend = () => {
          clearInterval(watchdog);
          resolve();
        };
        // onprogress alone could go quiet for a while on a very slow link; this
        // watchdog guarantees we still notice a stop request within ~300ms regardless.
        const watchdog = setInterval(() => {
          if (shouldStop()) xhr.abort();
        }, 300);
        xhr.send(payload);
      });
    }
  }, onSample);
}

function gradeBufferbloat(deltaMs: number): BufferbloatGrade {
  if (deltaMs < 5) return 'A';
  if (deltaMs < 30) return 'B';
  if (deltaMs < 60) return 'C';
  if (deltaMs < 200) return 'D';
  return 'F';
}

interface NetworkConnectionLike {
  type?: string;
  effectiveType?: string;
}

export function detectNetworkType(): string {
  const nav = navigator as Navigator & {
    connection?: NetworkConnectionLike;
    mozConnection?: NetworkConnectionLike;
    webkitConnection?: NetworkConnectionLike;
  };
  const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  if (conn?.type) {
    if (conn.type === 'wifi') return 'Wi-Fi';
    if (conn.type === 'ethernet') return 'Ethernet';
    if (conn.type === 'cellular') return 'Cellular';
    return conn.type;
  }
  if (conn?.effectiveType) return conn.effectiveType.toUpperCase();
  return 'Unknown';
}

export interface EngineCallbacks {
  onPhase?: (phase: TestPhase) => void;
  /** Raw instantaneous throughput samples (~5 per second). */
  onLive?: (phase: 'download' | 'upload', mbps: number) => void;
  /** Fired repeatedly while ping is measuring, so the number can count up live instead of appearing all at once. */
  onPingLive?: (avgMs: number, jitterMs: number) => void;
  /** Fired once per stage with its locked, final value. */
  onStage?: (stage: 'ping' | 'download' | 'upload', value: number, extra?: number) => void;
}

export async function runFullTest(cb: EngineCallbacks = {}): Promise<TestResult> {
  // Independent of any measurement, so it runs the whole time in the background
  // instead of adding its own delay after the transfers are already done.
  const metaPromise = fetch('/api/meta', { cache: 'no-store' })
    .then((r) => r.json())
    .catch(() => null);

  cb.onPhase?.('ping');
  const idlePing = await measurePing(8, 1800, true, (avg, jitter) => cb.onPingLive?.(avg, jitter), 4500);
  if (idlePing.avg === 0) throw new Error('Could not reach the test server. Check your connection and try again.');
  cb.onStage?.('ping', idlePing.avg, idlePing.jitter);

  // Latency under load is sampled while each transfer is saturating the link. These run
  // in the background and are only awaited once the upload test is done, so they never
  // stall the handoff from download to upload (or the download itself).
  cb.onPhase?.('download');
  const loadedDuringDown = sleep(1800).then(() => measurePing(6, 1800, false, undefined, 4500));
  const download = await measureDownload((m) => cb.onLive?.('download', m));
  if (download.bytes === 0) throw new Error('Download test failed. Check your connection and try again.');
  cb.onStage?.('download', download.mbps);

  cb.onPhase?.('upload');
  const loadedDuringUp = sleep(1800).then(() => measurePing(6, 1800, false, undefined, 4500));
  const upload = await measureUpload((m) => cb.onLive?.('upload', m));
  cb.onStage?.('upload', upload.mbps);

  // These background latency-under-load samples are almost always already
  // finished by now (they started early and run alongside the transfers), but
  // cap the wait so a slow/congested network can never leave the "Test again"
  // button hanging — fall back to the idle ping if the cap is hit.
  const fallbackPing = { avg: idlePing.avg, jitter: idlePing.jitter, lossPct: idlePing.lossPct };
  const capped = <T>(p: Promise<T>, fallback: T, ms: number) =>
    Promise.race([p, sleep(ms).then(() => fallback)]);
  const [loadedDown, loadedUp] = await Promise.all([
    capped(loadedDuringDown, fallbackPing, 2000),
    capped(loadedDuringUp, fallbackPing, 2000),
  ]);
  const loadedAvg = Math.max(loadedDown.avg, loadedUp.avg);
  const bufferbloatMs = Math.max(0, loadedAvg - idlePing.avg);
  const packetLossPct = Math.max(idlePing.lossPct, loadedDown.lossPct, loadedUp.lossPct);

  let meta: { ip: string | null; isp: string | null; city: string | null; country: string | null } = {
    ip: null,
    isp: null,
    city: null,
    country: null,
  };
  const metaData = await capped(metaPromise, null, 800);
  if (metaData) meta = { ip: metaData.ip, isp: metaData.isp, city: metaData.city, country: metaData.country };

  cb.onPhase?.('done');

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    region: 'auto',
    regionLabel: 'Closest edge',
    pingMs: idlePing.avg,
    jitterMs: idlePing.jitter,
    packetLossPct,
    downloadMbps: download.mbps,
    uploadMbps: upload.mbps,
    idlePingMs: idlePing.avg,
    loadedPingMs: loadedAvg,
    bufferbloatMs,
    bufferbloatGrade: gradeBufferbloat(bufferbloatMs),
    downloadTrace: download.trace,
    uploadTrace: upload.trace,
    bytesDown: download.bytes,
    bytesUp: upload.bytes,
    downloadStreams: download.streamsUsed,
    uploadStreams: upload.streamsUsed,
    downloadDurationMs: download.durationMs,
    uploadDurationMs: upload.durationMs,
    ip: meta.ip,
    isp: meta.isp,
    city: meta.city,
    country: meta.country,
    networkType: detectNetworkType(),
  };
}
