'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpeedRing from '@/components/SpeedRing';
import Waveform from '@/components/Waveform';
import StatCard from '@/components/StatCard';
import ActivityList from '@/components/ActivityList';
import HistoryGraph from '@/components/HistoryGraph';
import HistoryList from '@/components/HistoryList';
import ResultCard from '@/components/ResultCard';
import {
  BoltIcon,
  BufferIcon,
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  HistoryIcon,
  JitterIcon,
  LocationIcon,
  PacketLossIcon,
  PlayIcon,
  PulseIcon,
  RefreshIcon,
  TrashIcon,
  UploadIcon,
  WifiIcon,
} from '@/components/icons';
import { runFullTest, detectNetworkType } from '@/lib/engine';
import { loadHistory, saveResult, clearHistory } from '@/lib/storage';
import {
  buildActivities,
  formatBytes,
  formatDuration,
  formatMs,
  formatSpeed,
  gradeLevel,
  speedVerdict,
  type Level,
  type SpeedUnit,
} from '@/lib/format';
import type { MetaInfo, TestPhase, TestResult } from '@/lib/types';

type Focus = 'download' | 'upload';

function pingLevel(ms: number): Level {
  return ms < 30 ? 'great' : ms < 80 ? 'ok' : 'poor';
}
function jitterLevel(ms: number): Level {
  return ms < 8 ? 'great' : ms < 25 ? 'ok' : 'poor';
}
function lossLevel(pct: number): Level {
  return pct === 0 ? 'great' : pct < 2 ? 'ok' : 'poor';
}

export default function Home() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [unit, setUnit] = useState<SpeedUnit>('Mbps');
  const [runId, setRunId] = useState(0);
  const [focus, setFocus] = useState<Focus>('download');

  // Live values. `down` / `up` hold the smoothed number while measuring and
  // are then locked to the final result, so nothing ever falls back to zero.
  const [down, setDown] = useState(0);
  const [up, setUp] = useState(0);
  const [ping, setPing] = useState<{ ms: number; jitter: number } | null>(null);
  const [downSeries, setDownSeries] = useState<number[]>([]);
  const [upSeries, setUpSeries] = useState<number[]>([]);
  const [downLocked, setDownLocked] = useState(false);
  const [upLocked, setUpLocked] = useState(false);
  const [primed, setPrimed] = useState({ download: false, upload: false });

  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [meta, setMeta] = useState<MetaInfo | null>(null);
  const [networkType, setNetworkType] = useState('Unknown');
  const [showIp, setShowIp] = useState(false);

  const runningRef = useRef(false);
  const emaRef = useRef(0);

  useEffect(() => {
    setHistory(loadHistory());
    setNetworkType(detectNetworkType());
    fetch('/api/meta', { cache: 'no-store' })
      .then((r) => r.json())
      .then((m: MetaInfo) => setMeta(m))
      .catch(() => {});
  }, []);

  async function handleRun() {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunId((n) => n + 1);
    setResult(null);
    setError(null);
    setFocus('download');
    setDown(0);
    setUp(0);
    setPing(null);
    setDownSeries([]);
    setUpSeries([]);
    setDownLocked(false);
    setUpLocked(false);
    setPrimed({ download: false, upload: false });
    setPhase('ping');
    emaRef.current = 0;

    try {
      const finalResult = await runFullTest({
        onPhase: (p) => {
          setPhase(p);
          emaRef.current = 0; // each transfer starts its own smoothing window
        },
        onPingLive: (avgMs, jitterMs) => {
          // Counts up toward the real number as each round trip comes back,
          // instead of appearing all at once when ping finishes.
          setPing({ ms: avgMs, jitter: jitterMs });
        },
        onStage: (stage, value, extra) => {
          if (stage === 'ping') setPing({ ms: value, jitter: extra ?? 0 });
          if (stage === 'download') {
            setDown(value);
            setDownLocked(true);
          }
          if (stage === 'upload') {
            setUp(value);
            setUpLocked(true);
          }
        },
        onLive: (kind, mbps) => {
          // Exponential moving average: the dial can drift up and down, but
          // it follows the trend instead of jumping to individual samples.
          emaRef.current = emaRef.current === 0 ? mbps : emaRef.current * 0.7 + mbps * 0.3;
          if (kind === 'download') {
            setDown(emaRef.current);
            setDownSeries((s) => [...s.slice(-120), mbps]);
            setPrimed((p) => (p.download ? p : { ...p, download: true }));
          } else {
            setUp(emaRef.current);
            setUpSeries((s) => [...s.slice(-120), mbps]);
            setPrimed((p) => (p.upload ? p : { ...p, upload: true }));
          }
        },
      });
      setResult(finalResult);
      setDown(finalResult.downloadMbps);
      setUp(finalResult.uploadMbps);
      setHistory(saveResult(finalResult));
      setPhase('done');
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      const friendly = /failed to fetch|networkerror|load failed/i.test(raw)
        ? 'Connection interrupted. Check your network and try again.'
        : raw || 'Something went wrong. Please try again.';
      setError(friendly);
      setPhase('error');
    } finally {
      runningRef.current = false;
    }
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const isDone = phase === 'done' && result !== null;

  const centerKind: Focus = phase === 'upload' ? 'upload' : isDone ? focus : 'download';
  const centerMbps = centerKind === 'upload' ? up : down;
  // The number eases toward its target, but snaps straight to the current
  // value (no counting-up-from-zero) on a brand-new run, whenever the ring
  // switches which metric it's showing, and the instant a stage produces its
  // first real sample — so it never reveals a stale "0" target that was only
  // there because that stage hadn't started sampling yet.
  const snapKey = `${runId}:${centerKind}:${centerKind === 'upload' ? primed.upload : primed.download}`;

  // True while a stage is actively running but hasn't produced its first
  // sample yet, so the ring can show a "still working" state instead of a
  // literal 0.0 that reads as finished or reset.
  const priming = phase === 'ping' || (phase === 'download' && !primed.download) || (phase === 'upload' && !primed.upload);

  const ringLabel = useMemo(() => {
    if (phase === 'idle') return 'Ready';
    if (phase === 'ping') return 'Measuring…';
    if (phase === 'error') return 'Test failed';
    if (phase === 'done') return centerKind === 'download' ? 'Download' : 'Upload';
    if (phase === 'download') return primed.download ? 'Download' : 'Priming download…';
    return primed.upload ? 'Upload' : 'Measuring…';
  }, [phase, centerKind, primed]);

  const verdict = isDone ? speedVerdict(result!.downloadMbps) : null;
  const activities = isDone
    ? buildActivities({
        down: result!.downloadMbps,
        up: result!.uploadMbps,
        ping: result!.pingMs,
        jitter: result!.jitterMs,
        loss: result!.packetLossPct,
      })
    : null;
  const greatCount = activities ? activities.filter((a) => a.level === 'great').length : 0;

  const locationText = [result?.city ?? meta?.city, result?.country ?? meta?.country].filter(Boolean).join(', ');
  const ipText = result?.ip ?? meta?.ip ?? null;
  const ispText = result?.isp ?? meta?.isp ?? null;
  const dataUsed = result && result.bytesDown !== undefined ? formatBytes((result.bytesDown ?? 0) + (result.bytesUp ?? 0)) : null;

  const steps: { key: 'download' | 'upload' | 'ping' | 'connection'; label: string; value: string | null; state: 'pending' | 'active' | 'done' }[] = [
    {
      key: 'download',
      label: 'Download',
      value: downLocked ? `${formatSpeed(down, unit)} ${unit}` : null,
      state: phase === 'download' ? 'active' : downLocked ? 'done' : 'pending',
    },
    {
      key: 'upload',
      label: 'Upload',
      value: upLocked ? `${formatSpeed(up, unit)} ${unit}` : null,
      state: phase === 'upload' ? 'active' : upLocked ? 'done' : 'pending',
    },
    {
      key: 'ping',
      label: 'Ping',
      value: ping ? `${formatMs(ping.ms)} ms` : null,
      state: phase === 'ping' ? 'active' : ping ? 'done' : 'pending',
    },
    {
      key: 'connection',
      label: 'Connection',
      value: networkType === 'Unknown' ? 'Not reported' : networkType,
      state: 'done',
    },
  ];

  return (
    <>
      <Header unit={unit} onUnitChange={setUnit} />

      <main>
        {/* ───────── Test ───────── */}
        <section id="test" className="container hero">
          <div className={`hero-glow ${isRunning ? 'on' : ''} ${isDone ? 'done' : ''}`} aria-hidden="true" />
          <p className="eyebrow">Internet speed test</p>
          <h1 className="hero-title">
            How fast is your <em>connection</em>, really?
          </h1>

          <SpeedRing
            down={down}
            up={up}
            centerMbps={centerMbps}
            snapKey={snapKey}
            unit={unit}
            label={ringLabel}
            scanning={priming}
            running={isRunning}
            priming={priming}
          />

          <div className="steps" role="list">
            {steps.map((s) => {
              const clickable = isDone && (s.key === 'download' || s.key === 'upload');
              const selected = isDone && s.key === focus;
              const Tag = clickable ? 'button' : 'div';
              return (
                <Tag
                  key={s.key}
                  role="listitem"
                  className={`step step-${s.key} step-${s.state} ${selected ? 'selected' : ''} ${clickable ? 'clickable' : ''}`}
                  {...(clickable ? { onClick: () => setFocus(s.key as Focus) } : {})}
                >
                  <span className="step-label">
                    {s.state === 'done' && <CheckIcon width={13} height={13} />}
                    {s.label}
                  </span>
                  <span className="step-value">
                    {s.key === 'download' && <DownloadIcon width={12} height={12} />}
                    {s.key === 'upload' && <UploadIcon width={12} height={12} />}
                    {s.value ?? (s.state === 'active' ? 'Measuring…' : '—')}
                  </span>
                </Tag>
              );
            })}
          </div>

          <div className="hero-actions">
            {(phase === 'idle' || phase === 'error') && (
              <>
                {phase === 'error' && <p className="error-msg">{error}</p>}
                <button className="btn btn-primary" onClick={handleRun}>
                  {phase === 'error' ? <RefreshIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
                  {phase === 'error' ? 'Try again' : 'Start test'}
                </button>
              </>
            )}

            {isRunning && phase !== 'ping' && (
              (phase === 'download' ? primed.download : primed.upload) ? (
                <div className="live-waveform">
                  <Waveform points={phase === 'download' ? downSeries : upSeries} tone={phase === 'download' ? 'download' : 'upload'} />
                </div>
              ) : (
                <p className="hint hint-priming">
                  {phase === 'download' ? 'Priming the connection…' : 'Measuring upload…'}
                </p>
              )
            )}
            {phase === 'ping' && <p className="hint">Checking response time before we push data…</p>}

            {isDone && verdict && (
              <>
                <div className={`verdict tone-${verdict.tone}`}>
                  <BoltIcon width={16} height={16} />
                  <strong>{verdict.title}</strong>
                  <span>· smooth for {greatCount} of {activities?.length} everyday activities</span>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={handleRun}>
                    <RefreshIcon width={18} height={18} />
                    Test again
                  </button>
                  <ResultCard result={result!} unit={unit} />
                </div>
              </>
            )}
          </div>

          <button
            className="scroll-cue"
            onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll down for detailed results"
          >
            <span>More below</span>
            <span className="scroll-cue-icon">
              <ChevronDownIcon width={18} height={18} />
            </span>
          </button>
        </section>

        {/* ───────── Results ───────── */}
        <section id="results" className="container section">
          <div className="section-head">
            <p className="eyebrow">Results</p>
            <h2>Your connection, in detail</h2>
            <p className="section-sub">Every number fills in as it is measured, then stays put.</p>
          </div>

          <div className="grid grid-4">
            <StatCard
              icon={<PulseIcon width={20} height={20} />}
              label="Ping"
              value={ping ? formatMs(ping.ms) : null}
              unit="ms"
              level={ping ? pingLevel(ping.ms) : undefined}
              hint="Round-trip time to the test server. Lower is more responsive for calls and games."
            />
            <StatCard
              icon={<PacketLossIcon width={20} height={20} />}
              label="Packet loss"
              value={isDone ? result!.packetLossPct.toFixed(1) : null}
              unit="%"
              level={isDone ? lossLevel(result!.packetLossPct) : undefined}
              hint="Requests that never came back. Anything above zero can cause glitches."
            />
            <StatCard
              icon={<JitterIcon width={20} height={20} />}
              label="Jitter"
              value={ping ? formatMs(ping.jitter, 1) : null}
              unit="ms"
              level={ping ? jitterLevel(ping.jitter) : undefined}
              hint="How much your ping wobbles. Steady is best for calls and games."
            />
            <StatCard
              icon={<BufferIcon width={20} height={20} />}
              label="Bufferbloat"
              value={isDone ? result!.bufferbloatGrade : null}
              unit={isDone ? `+${formatMs(result!.bufferbloatMs)} ms` : undefined}
              level={isDone ? gradeLevel(result!.bufferbloatGrade) : undefined}
              badge={isDone ? `Grade ${result!.bufferbloatGrade}` : undefined}
              hint="Extra delay when your line is busy. Grade A means it stays responsive under load."
            />
          </div>

          <div className="grid grid-4">
            <StatCard
              icon={<LocationIcon width={20} height={20} />}
              label="Location"
              value={locationText || null}
              hint="Where the test sees you from, based on your network."
            />
            <StatCard
              icon={<WifiIcon width={20} height={20} />}
              label="ISP"
              value={ispText}
              hint="Your internet provider, looked up from your IP address."
            />
            <StatCard
              icon={<GlobeIcon width={20} height={20} />}
              label="IP address"
              value={ipText}
              blurred={!showIp}
              hint="Tap the eye to reveal. It never leaves your browser and the test server."
              action={
                ipText ? (
                  <button className="icon-btn" onClick={() => setShowIp((v) => !v)} aria-label={showIp ? 'Hide IP address' : 'Show IP address'}>
                    {showIp ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                  </button>
                ) : undefined
              }
            />
            <StatCard
              icon={<DatabaseIcon width={20} height={20} />}
              label="Data used"
              value={dataUsed}
              hint="Total transferred during this test, download plus upload."
            />
          </div>
        </section>

        {/* ───────── Insights ───────── */}
        <section id="insights" className="container section">
          <div className="section-head">
            <p className="eyebrow">Insights</p>
            <h2>What can you actually do with it?</h2>
            <p className="section-sub">Numbers are abstract. Here is how your connection handles real life.</p>
          </div>

          <ActivityList activities={activities} />

          {isDone && (
            <div className="grid grid-3 downloads">
              {[
                { name: 'A 4 GB movie', gb: 4 },
                { name: 'A 50 GB game', gb: 50 },
                { name: 'A 1 GB backup upload', gb: 1, upload: true },
              ].map((item) => (
                <div key={item.name} className="card time-card">
                  <span className="time-name">{item.name}</span>
                  <span className="time-value">
                    {formatDuration((item.gb * 8000) / Math.max(0.01, item.upload ? result!.uploadMbps : result!.downloadMbps))}
                  </span>
                  <span className="time-sub">{item.upload ? 'at your upload speed' : 'at your download speed'}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ───────── History ───────── */}
        <section id="history" className="container section">
          <div className="section-head row">
            <div>
              <p className="eyebrow">History</p>
              <h2>Your recent tests</h2>
            </div>
            {history.length > 0 && (
              <button className="btn btn-ghost" onClick={handleClearHistory}>
                <TrashIcon width={14} height={14} />
                Clear
              </button>
            )}
          </div>

          <div className="card history-card">
            {history.length === 0 ? (
              <div className="empty">
                <HistoryIcon width={26} height={26} />
                <p>No tests yet. Your results will appear here so you can spot trends over time.</p>
              </div>
            ) : (
              <>
                <HistoryGraph history={history} unit={unit} />
                <HistoryList history={history} unit={unit} />
                <p className="fineprint">Stored only in this browser. Nothing is sent to a server.</p>
              </>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
