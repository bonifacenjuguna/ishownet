'use client';

import { useEffect, useRef, useState } from 'react';
import type { TestResult } from '@/lib/types';
import { formatSpeed, formatMs, type SpeedUnit } from '@/lib/format';
import { CopyIcon, CheckIcon, ShareIcon } from './icons';

interface ResultCardProps {
  result: TestResult;
  unit: SpeedUnit;
}

async function drawCard(canvas: HTMLCanvasElement, result: TestResult, unit: SpeedUnit) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#07070a';
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'rgba(63,169,198,0.08)');
  grad.addColorStop(0.5, 'rgba(198,129,63,0.10)');
  grad.addColorStop(1, 'rgba(232,67,44,0.10)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.fillStyle = '#c6813f';
  ctx.font = '600 34px "Instrument Sans", sans-serif';
  ctx.fillText('ISHOWNET', 80, 130);

  ctx.fillStyle = '#8b8a8f';
  ctx.font = '400 24px "Instrument Sans", sans-serif';
  ctx.fillText(new Date(result.timestamp).toLocaleString(), 80, 168);

  ctx.fillStyle = '#f3f1ec';
  ctx.font = '600 160px "IBM Plex Mono", monospace';
  ctx.fillText(formatSpeed(result.downloadMbps, unit, 1), 80, 420);
  ctx.fillStyle = '#96959d';
  ctx.font = '400 40px "IBM Plex Mono", monospace';
  ctx.fillText(`${unit} download`, 84, 470);

  ctx.fillStyle = '#f3f1ec';
  ctx.font = '600 90px "IBM Plex Mono", monospace';
  ctx.fillText(formatSpeed(result.uploadMbps, unit, 1), 80, 610);
  ctx.fillStyle = '#96959d';
  ctx.font = '400 32px "IBM Plex Mono", monospace';
  ctx.fillText(`${unit} upload`, 84, 650);

  const stats: [string, string][] = [
    ['Ping', `${formatMs(result.pingMs)} ms`],
    ['Jitter', `${formatMs(result.jitterMs, 1)} ms`],
    ['Packet loss', `${result.packetLossPct.toFixed(1)}%`],
    ['Bufferbloat', `${result.bufferbloatGrade} · +${formatMs(result.bufferbloatMs)}ms`],
  ];

  let y = 760;
  ctx.font = '400 30px "Instrument Sans", sans-serif';
  for (const [label, value] of stats) {
    ctx.fillStyle = '#8b8a8f';
    ctx.fillText(label, 80, y);
    ctx.fillStyle = '#f3f1ec';
    ctx.textAlign = 'right';
    ctx.fillText(value, W - 80, y);
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(80, y + 24);
    ctx.lineTo(W - 80, y + 24);
    ctx.stroke();
    y += 74;
  }

  ctx.fillStyle = '#8b8a8f';
  ctx.font = '400 26px "Instrument Sans", sans-serif';
  const location = [result.city, result.country].filter(Boolean).join(', ');
  ctx.fillText(location || result.regionLabel, 80, H - 90);
  ctx.textAlign = 'right';
  ctx.fillText(result.regionLabel, W - 80, H - 90);
  ctx.textAlign = 'left';
}

export default function ResultCard({ result, unit }: ResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(false);
  }, [result.id]);

  async function ensureRendered() {
    if (canvasRef.current && !rendered) {
      await drawCard(canvasRef.current, result, unit);
      setRendered(true);
    }
  }

  async function handleDownload() {
    await ensureRendered();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ishownet-${result.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function handleCopyLink() {
    const summary = `iShowNet result: ${formatSpeed(result.downloadMbps, unit)} ${unit} down / ${formatSpeed(
      result.uploadMbps,
      unit
    )} ${unit} up, ${formatMs(result.pingMs)}ms ping (${result.regionLabel})`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable; no-op.
    }
  }

  return (
    <div className="card-actions">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button className="action" onClick={handleDownload}>
        <ShareIcon width={16} height={16} />
        Save result card
      </button>
      <button className="action" onClick={handleCopyLink}>
        {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
        {copied ? 'Copied' : 'Copy summary'}
      </button>
      <style jsx>{`
        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--stroke);
          color: var(--text);
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .action:hover {
          border-color: var(--brand);
          color: var(--brand);
        }
      `}</style>
    </div>
  );
}