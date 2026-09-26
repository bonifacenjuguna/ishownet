import type { TestResult } from './types';

const KEY = 'ishownet:history:v1';
const MAX_ENTRIES = 20;

export function loadHistory(): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TestResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult): TestResult[] {
  const history = loadHistory();
  const next = [result, ...history].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable; keep the current result in memory.
  }
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore storage failures.
  }
}
