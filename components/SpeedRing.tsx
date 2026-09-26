'use client';

import { useEffect, useRef, useState } from 'react';
import { formatSpeed, type SpeedUnit } from '@/lib/format';

interface SpeedRingProps {
  down: number; // mbps, drives the outer arc
  up: number; // mbps, drives the inner arc
  centerMbps: number; // mbps shown in the big number
  snapKey: string; // when this changes the number jumps instead of easing
  unit: SpeedUnit;
  label: string;
  scanning: boolean;
  running: boolean;
  priming?: boolean; // true while a stage is active but has no sample yet — shows dots, never "0.0"
}

const SIZE = 240;
const C = SIZE / 2;
const R_OUT = 108;
const R_IN = 84;
const WIDTH_OUT = 14;
const WIDTH_IN = 11;
const CIRC_OUT = 2 * Math.PI * R_OUT;
const CIRC_IN = 2 * Math.PI * R_IN;

/** Log-ish scale so 5 Mbps and 500 Mbps both read sensibly on the same dial. */
function fraction(mbps: number): number {
  const cap = Math.max(1000, mbps * 1.1);
  return Math.max(0, Math.min(1, Math.log10(1 + mbps) / Math.log10(1 + cap)));
}

function useEasedNumber(target: number, snapKey: string): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const targetRef = useRef(target);
  const keyRef = useRef(snapKey);
  targetRef.current = target;

  useEffect(() => {
    if (keyRef.current !== snapKey) {
      keyRef.current = snapKey;
      valueRef.current = targetRef.current;
      setValue(targetRef.current);
    }
  }, [snapKey]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const diff = targetRef.current - valueRef.current;
      if (Math.abs(diff) < 0.01) {
        if (valueRef.current !== targetRef.current) {
          valueRef.current = targetRef.current;
          setValue(valueRef.current);
        }
      } else {
        valueRef.current += diff * 0.14;
        setValue(valueRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return value;
}

export default function SpeedRing({ down, up, centerMbps, snapKey, unit, label, scanning, running, priming }: SpeedRingProps) {
  const shown = useEasedNumber(centerMbps, snapKey);
  const display = formatSpeed(shown, unit, 1);

  return (
    <div className={`ring-wrap ${running ? 'is-running' : ''}`} role="img" aria-label={priming ? label : `${label}: ${display} ${unit}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="ring-svg">
        <defs>
          <linearGradient id="gradDown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--copper)" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--hot)" />
          </linearGradient>
          <linearGradient id="gradUp" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--cold)" />
            <stop offset="100%" stopColor="var(--good)" />
          </linearGradient>
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={C} cy={C} r={R_OUT} fill="none" stroke="var(--track)" strokeWidth={WIDTH_OUT} />
        <circle cx={C} cy={C} r={R_IN} fill="none" stroke="var(--track)" strokeWidth={WIDTH_IN} />

        {scanning && (
          <g className="ring-scan">
            <circle
              cx={C}
              cy={C}
              r={R_OUT}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={WIDTH_OUT}
              strokeLinecap="round"
              strokeDasharray={`${CIRC_OUT * 0.16} ${CIRC_OUT}`}
              opacity={0.9}
            />
          </g>
        )}

        <circle
          cx={C}
          cy={C}
          r={R_OUT}
          fill="none"
          stroke="url(#gradDown)"
          strokeWidth={WIDTH_OUT}
          strokeLinecap="round"
          strokeDasharray={CIRC_OUT}
          strokeDashoffset={CIRC_OUT * (1 - fraction(down))}
          transform={`rotate(-90 ${C} ${C})`}
          filter="url(#ringGlow)"
          className="ring-arc"
          opacity={down > 0 ? 1 : 0}
        />
        <circle
          cx={C}
          cy={C}
          r={R_IN}
          fill="none"
          stroke="url(#gradUp)"
          strokeWidth={WIDTH_IN}
          strokeLinecap="round"
          strokeDasharray={CIRC_IN}
          strokeDashoffset={CIRC_IN * (1 - fraction(up))}
          transform={`rotate(-90 ${C} ${C})`}
          filter="url(#ringGlow)"
          className="ring-arc"
          opacity={up > 0 ? 1 : 0}
        />
      </svg>

      <div className="ring-center">
        {priming ? (
          <div className="ring-loading" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <span className="ring-value">{display}</span>
            <span className="ring-unit">{unit}</span>
          </>
        )}
        <span className={`ring-phase ${running ? 'is-live' : ''}`}>{label}</span>
      </div>
    </div>
  );
}
