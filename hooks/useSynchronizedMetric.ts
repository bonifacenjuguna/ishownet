import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  tauMs?: number;
  settleTauMs?: number;
}

export function useSynchronizedMetric(initial = 0, options: Options = {}) {
  // Live samples should feel responsive while still avoiding visible jumps.
  // Final values keep the slower soft landing for a clean finish.
  const tauMs = options.tauMs ?? 120;
  const settleTauMs = options.settleTauMs ?? 700;
  const [value, setValue] = useState(initial);
  const valueRef = useRef(initial);
  const targetRef = useRef(initial);
  const tauRef = useRef(tauMs);

  const setTarget = useCallback((next: number, settling = false) => {
    if (!Number.isFinite(next) || next < 0) return;
    targetRef.current = next;
    tauRef.current = settling ? settleTauMs : tauMs;
  }, [settleTauMs, tauMs]);

  const reset = useCallback((next = 0) => {
    const safe = Number.isFinite(next) && next >= 0 ? next : 0;
    targetRef.current = safe;
    valueRef.current = safe;
    tauRef.current = tauMs;
    setValue(safe);
  }, [tauMs]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;

      const current = valueRef.current;
      const target = targetRef.current;
      const diff = target - current;
      const tau = tauRef.current;

      if (Math.abs(diff) < 0.01) {
        if (current !== target) {
          valueRef.current = target;
          setValue(target);
        }
        tauRef.current = tauMs;
      } else {
        // Live samples use a responsive transition. The locked final
        // measurement gets a slower soft landing so the gauge never
        // visually snaps to the final average.
        const alpha = 1 - Math.exp(-dt / tau);
        const next = current + diff * alpha;
        valueRef.current = next;
        setValue(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tauMs]);

  return { value, setTarget, reset };
}
