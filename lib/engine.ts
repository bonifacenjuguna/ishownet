import type { TestPhase, TestResult } from './types';

const META_URL = 'https://speed.cloudflare.com/meta';

type Callbacks = {
  onPhase?: (phase: TestPhase) => void;
  onLive?: (phase: 'download' | 'upload', mbps: number) => void;
  onPingLive?: (avgMs: number, jitterMs: number) => void;
  onStage?: (stage: 'ping' | 'download' | 'upload', value: number, extra?: number) => void;
};

type Results = {
  getUnloadedLatency: () => number | undefined;
  getUnloadedJitter: () => number | null | undefined;
  getDownLoadedLatency: () => number | undefined;
  getUpLoadedLatency: () => number | undefined;
  getDownloadBandwidth: () => number | undefined;
  getUploadBandwidth: () => number | undefined;
  getPacketLoss: () => number | undefined;
  getDownloadBandwidthPoints: () => Array<{ transferSize: number }>;
  getUploadBandwidthPoints: () => Array<{ transferSize: number }>;
};

type Engine = {
  results: Results;
  onResultsChange: (payload: { type: string }) => void;
  onPhaseChange: (payload: { measurement: { type: string } }) => void;
  onFinish: (results: Results) => void;
  onError: (message: string) => void;
  play: () => void;
};

async function fetchMeta() {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(META_URL, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return {};
      return await response.json() as {
        clientIp?: string;
        asn?: number;
        colo?: string;
        country?: string;
        city?: string;
      };
    } finally {
      window.clearTimeout(timer);
    }
  } catch {
    return {};
  }
}

function networkType(): string {
  const nav = navigator as Navigator & { connection?: { type?: string; effectiveType?: string } };
  const type = nav.connection?.type;
  if (type === 'wifi') return 'Wi-Fi';
  if (type === 'ethernet') return 'Ethernet';
  if (type === 'cellular') return 'Cellular';
  return nav.connection?.effectiveType?.toUpperCase() ?? 'Unknown';
}

function grade(delta: number): TestResult['bufferbloatGrade'] {
  if (delta < 5) return 'A';
  if (delta < 30) return 'B';
  if (delta < 60) return 'C';
  if (delta < 200) return 'D';
  return 'F';
}

function transferred(points: Array<{ transferSize: number }>): number {
  return points.reduce((sum, point) => sum + Math.max(0, point.transferSize || 0), 0);
}

export function runFullTest(callbacks: Callbacks = {}): Promise<TestResult> {
  return new Promise(async (resolve, reject) => {
    callbacks.onPhase?.('ping');

    try {
      const [{ default: SpeedTest }, meta] = await Promise.all([
        import('@cloudflare/speedtest'),
        fetchMeta(),
      ]);

      const engine = new SpeedTest({
        autoStart: false,
        logMeasurementApiUrl: null,
        logAimApiUrl: null,
      }) as unknown as Engine;

      let sawDownload = false;
      let sawUpload = false;
      let lastDown = 0;
      let lastUp = 0;
      let lastPing = 0;
      let lastJitter = 0;

      const publish = () => {
        const r = engine.results;
        const down = r.getDownloadBandwidth();
        const up = r.getUploadBandwidth();
        const ping = r.getUnloadedLatency();
        const jitter = r.getUnloadedJitter();

        if (typeof down === 'number' && down > 0) {
          lastDown = down / 1e6;
          callbacks.onLive?.('download', lastDown);
        }
        if (typeof up === 'number' && up > 0) {
          lastUp = up / 1e6;
          callbacks.onLive?.('upload', lastUp);
        }
        if (typeof ping === 'number' && ping > 0) {
          lastPing = ping;
          lastJitter = typeof jitter === 'number' ? jitter : lastJitter;
          callbacks.onPingLive?.(lastPing, lastJitter);
        }
      };

      engine.onPhaseChange = ({ measurement }) => {
        if (measurement.type === 'latency' && !sawDownload) {
          callbacks.onPhase?.('ping');
        } else if (measurement.type === 'download' && !sawUpload) {
          sawDownload = true;
          callbacks.onPhase?.('download');
        } else if (measurement.type === 'upload' && !sawUpload) {
          sawUpload = true;
          if (lastDown > 0) callbacks.onStage?.('download', lastDown);
          callbacks.onPhase?.('upload');
        }
      };

      engine.onResultsChange = publish;

      engine.onError = (message) => reject(new Error(message || 'Cloudflare speed test failed.'));

      engine.onFinish = (r) => {
        const ping = r.getUnloadedLatency() ?? lastPing;
        const jitter = r.getUnloadedJitter();
        const down = (r.getDownloadBandwidth() ?? lastDown * 1e6) / 1e6;
        const up = (r.getUploadBandwidth() ?? lastUp * 1e6) / 1e6;
        const downLatency = r.getDownLoadedLatency() ?? ping;
        const upLatency = r.getUpLoadedLatency() ?? ping;
        const loss = r.getPacketLoss();

        if (!ping || !down || !up) {
          reject(new Error('Cloudflare did not return a complete speed test result.'));
          return;
        }

        const finalJitter = typeof jitter === 'number' ? jitter : lastJitter;
        const bufferbloat = Math.max(0, Math.max(downLatency, upLatency) - ping);

        callbacks.onStage?.('ping', ping, finalJitter);
        callbacks.onStage?.('download', down);
        callbacks.onStage?.('upload', up);
        callbacks.onPhase?.('done');

        resolve({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          regionLabel: meta.colo ? `Cloudflare edge · ${meta.colo}` : 'Cloudflare edge',
          pingMs: ping,
          jitterMs: finalJitter,
          packetLossPct: typeof loss === 'number' ? loss * 100 : 0,
          downloadMbps: down,
          uploadMbps: up,
          downloadLatencyMs: downLatency,
          uploadLatencyMs: upLatency,
          bufferbloatMs: bufferbloat,
          bufferbloatGrade: grade(bufferbloat),
          bytesDown: transferred(r.getDownloadBandwidthPoints()),
          bytesUp: transferred(r.getUploadBandwidthPoints()),
          ip: meta.clientIp ?? null,
          asn: typeof meta.asn === 'number' ? String(meta.asn) : null,
          city: meta.city ?? null,
          country: meta.country ?? null,
          networkType: networkType(),
        });
      };

      engine.play();
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Could not start the Cloudflare speed test.'));
    }
  });
}

export function detectNetworkType(): string {
  return networkType();
}
