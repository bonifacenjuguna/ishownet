'use client';

import { useEffect, useRef, useState } from 'react';
import type { TestResult } from '@/lib/types';
import { formatSpeed, formatMs, type SpeedUnit } from '@/lib/format';
import { CopyIcon, CheckIcon, ShareIcon } from './icons';

interface ResultCardProps {
  result: TestResult;
  unit: SpeedUnit;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCard(canvas: HTMLCanvasElement, result: TestResult, unit: SpeedUnit) {
  const W = 1200;
  const H = 1500;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const gold = '#e3b34d';
  const copper = '#c6813f';
  const blue = '#3f82e0';
  const green = '#4cc38a';
  const text = '#f3f1ec';
  const dim = '#96959d';
  const faint = '#626169';
  const surface = '#111116';
  const stroke = '#292930';

  ctx.fillStyle = '#07070a';
  ctx.fillRect(0, 0, W, H);

  const bg = ctx.createRadialGradient(W * 0.18, 0, 0, W * 0.18, 0, W * 0.95);
  bg.addColorStop(0, 'rgba(227,179,77,0.18)');
  bg.addColorStop(0.45, 'rgba(63,130,224,0.05)');
  bg.addColorStop(1, 'rgba(7,7,10,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.85, H * 0.72, 0, W * 0.85, H * 0.72, W * 0.65);
  glow.addColorStop(0, 'rgba(63,130,224,0.08)');
  glow.addColorStop(1, 'rgba(7,7,10,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Fine technical grid.
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = 60; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 60; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  roundedRect(ctx, 42, 42, W - 84, H - 84, 34);
  ctx.fillStyle = 'rgba(17,17,22,0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header.
  ctx.fillStyle = text;
  ctx.font = '700 42px "Instrument Sans", sans-serif';
  ctx.fillText('iShow', 84, 128);
  ctx.fillStyle = gold;
  ctx.fillText('Net', 205, 128);

  ctx.fillStyle = gold;
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillText('CONNECTION REPORT', 84, 164);

  ctx.fillStyle = faint;
  ctx.font = '400 22px "Instrument Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(new Date(result.timestamp).toLocaleString(), W - 84, 128);
  ctx.textAlign = 'left';

  // Speed cards.
  const cardY = 214;
  const cardW = 494;
  const cardH = 300;
  const gap = 44;

  roundedRect(ctx, 84, cardY, cardW, cardH, 26);
  ctx.fillStyle = 'rgba(227,179,77,0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(227,179,77,0.36)';
  ctx.lineWidth = 2;
  ctx.stroke();

  roundedRect(ctx, 84 + cardW + gap, cardY, cardW, cardH, 26);
  ctx.fillStyle = 'rgba(63,130,224,0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(63,130,224,0.36)';
  ctx.stroke();

  ctx.fillStyle = gold;
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillText('DOWNLOAD', 116, cardY + 54);
  ctx.fillStyle = text;
  ctx.font = '700 78px "IBM Plex Mono", monospace';
  ctx.fillText(formatSpeed(result.downloadMbps, unit, 1), 116, cardY + 154);
  ctx.fillStyle = dim;
  ctx.font = '400 24px "IBM Plex Mono", monospace';
  ctx.fillText(unit, 116, cardY + 198);
  ctx.fillStyle = faint;
  ctx.font = '400 21px "Instrument Sans", sans-serif';
  ctx.fillText('Receiving data', 116, cardY + 252);

  ctx.fillStyle = blue;
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillText('UPLOAD', 622, cardY + 54);
  ctx.fillStyle = text;
  ctx.font = '700 78px "IBM Plex Mono", monospace';
  ctx.fillText(formatSpeed(result.uploadMbps, unit, 1), 622, cardY + 154);
  ctx.fillStyle = dim;
  ctx.font = '400 24px "IBM Plex Mono", monospace';
  ctx.fillText(unit, 622, cardY + 198);
  ctx.fillStyle = faint;
  ctx.font = '400 21px "Instrument Sans", sans-serif';
  ctx.fillText('Sending data', 622, cardY + 252);

  // Technical metrics.
  ctx.fillStyle = text;
  ctx.font = '600 28px "Instrument Sans", sans-serif';
  ctx.fillText('Connection quality', 84, 584);
  ctx.fillStyle = faint;
  ctx.font = '400 20px "Instrument Sans", sans-serif';
  ctx.fillText('Measured while the connection was active', 84, 616);

  const metrics: [string, string][] = [
    ['Ping', `${formatMs(result.pingMs)} ms`],
    ['Jitter', `${formatMs(result.jitterMs, 1)} ms`],
    ['Packet loss', result.packetLossPct === null ? 'Not measured' : `${result.packetLossPct.toFixed(1)}%`],
    ['Bufferbloat', `${result.bufferbloatGrade}  ·  +${formatMs(result.bufferbloatMs)} ms`],
    ['Download latency', `${formatMs(result.downloadLatencyMs)} ms`],
    ['Upload latency', `${formatMs(result.uploadLatencyMs)} ms`],
  ];

  const metricW = 494;
  const metricH = 112;
  const metricGapX = 44;
  const metricGapY = 16;
  const metricStartY = 656;

  metrics.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 84 + col * (metricW + metricGapX);
    const y = metricStartY + row * (metricH + metricGapY);

    roundedRect(ctx, x, y, metricW, metricH, 20);
    ctx.fillStyle = surface;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = faint;
    ctx.font = '500 18px "Instrument Sans", sans-serif';
    ctx.fillText(label.toUpperCase(), x + 24, y + 34);
    ctx.fillStyle = text;
    ctx.font = '650 30px "IBM Plex Mono", monospace';
    ctx.fillText(value, x + 24, y + 78);
  });

  // Footer information.
  const footerY = 1034;
  roundedRect(ctx, 84, footerY, W - 168, 300, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();

  const location = [result.city, result.country].filter(Boolean).join(', ') || result.regionLabel || 'Location unavailable';
  const network = result.asn ? `ASN ${result.asn}` : 'Network unavailable';

  ctx.fillStyle = faint;
  ctx.font = '500 18px "Instrument Sans", sans-serif';
  ctx.fillText('TEST LOCATION', 116, footerY + 50);
  ctx.fillStyle = text;
  ctx.font = '600 28px "Instrument Sans", sans-serif';
  ctx.fillText(location, 116, footerY + 88);

  ctx.fillStyle = faint;
  ctx.font = '500 18px "Instrument Sans", sans-serif';
  ctx.fillText('NETWORK', 116, footerY + 138);
  ctx.fillStyle = text;
  ctx.font = '600 26px "IBM Plex Mono", monospace';
  ctx.fillText(network, 116, footerY + 176);

  ctx.fillStyle = gold;
  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillText('ishownet.vercel.app', 116, footerY + 244);

  ctx.textAlign = 'right';
  ctx.fillStyle = green;
  ctx.font = '600 20px "Instrument Sans", sans-serif';
  ctx.fillText('Measured locally · Saved by you', W - 116, footerY + 244);
  ctx.textAlign = 'left';
}

export default function ResultCard({ result, unit }: ResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(false);
  }, [result.id, unit]);

  async function ensureRendered() {
    if (canvasRef.current && !rendered) {
      drawCard(canvasRef.current, result, unit);
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
    </div>
  );
}