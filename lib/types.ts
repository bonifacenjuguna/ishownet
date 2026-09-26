export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error';

export interface TracePoint {
  t: number; // ms since phase start
  mbps: number;
}

export type BufferbloatGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface TestResult {
  id: string;
  timestamp: number;
  region: string;
  regionLabel: string;
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
  downloadMbps: number;
  uploadMbps: number;
  idlePingMs: number;
  loadedPingMs: number;
  bufferbloatMs: number;
  bufferbloatGrade: BufferbloatGrade;
  downloadTrace: TracePoint[];
  uploadTrace: TracePoint[];
  bytesDown?: number;
  bytesUp?: number;
  downloadStreams?: number;
  uploadStreams?: number;
  downloadDurationMs?: number;
  uploadDurationMs?: number;
  ip: string | null;
  asn: string | null;
  city: string | null;
  country: string | null;
  networkType: string;
}

export interface MetaInfo {
  ip: string | null;
  asn: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postalCode: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  executedIn: string;
}
