import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  tauMs?: number;
}

export function useSynchronizedMetric(initial = 0, options: Options = {}) {
  const tauMs = options.tauMs ?? 320;
  const [value, setValue] = useState(initial);
  const valueRef = useRef(initial);
  const targetRef = useRef(initial);

  const setTarget = useCallback((next: number) => {
    if (!Number.isFinite(next) || next < 0) return;
    targetRef.current = next;
  }, []);

  const reset = useCallback((next = 0) => {
    const safe = Number.isFinite(next) && next >= 0 ? next : 0;
    targetRef.current = safe;
    valueRef.current = safe;
    setValue(safe);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;

      const current = valueRef.current;
      const target = targetRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.01) {
        if (current !== target) {
          valueRef.current = target;
          setValue(target);
        }
      } else {
        // Frame-rate-independent exponential response. Every visible movement
        // is caused by a real target supplied by the measurement engine; the
        // frontend only interpolates between those targets.
        const alpha = 1 - Math.exp(-dt / tauMs);
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
