export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error';

export type BufferbloatGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface TestResult {
  id: string;
  timestamp: number;
  regionLabel: string;
  pingMs: number;
  jitterMs: number;
  packetLossPct: number | null;
  downloadMbps: number;
  uploadMbps: number;
  downloadLatencyMs: number;
  uploadLatencyMs: number;
  bufferbloatMs: number;
  bufferbloatGrade: BufferbloatGrade;
  bytesDown?: number;
  bytesUp?: number;
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
  country: string | null;
}
