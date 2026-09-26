'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

type Theme = 'dark' | 'light';
type Accent = 'copper' | 'purple' | 'red';
type Preset = `${Theme}-${Accent}`;

const STORAGE_KEY = 'ishownet-theme';

function syncThemeColor(preset: Preset) {
  const [theme, accent] = preset.split('-') as [Theme, Accent];
  const color = theme === 'light' ? '#f7f6f2' : accent === 'purple' ? '#7c3aed' : accent === 'copper' ? '#e3b34d' : '#07070a';
  document.getElementById('theme-color')?.setAttribute('content', color);
}
const PRESETS: Preset[] = ['dark-red', 'light-red', 'dark-purple', 'dark-copper'];

function isPreset(value: string | null): value is Preset {
  return value !== null && PRESETS.includes(value as Preset);
}

function readStoredTheme(): Preset | null {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return isPreset(value) ? value : null;
}

export default function ThemeToggle() {
  const [preset, setPreset] = useState<Preset | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    const preferredTheme: Theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const preferred: Preset = stored ?? `${preferredTheme}-red`;
    setPreset(preferred);
    const [theme, accent] = preferred.split('-') as [Theme, Accent];
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);
    syncThemeColor(preferred);
    window.localStorage.setItem(STORAGE_KEY, preferred);
  }, []);

  function toggle() {
    if (!preset) return;
    const currentIndex = PRESETS.indexOf(preset);
    const next = PRESETS[(currentIndex + 1) % PRESETS.length];
    setPreset(next);
    const [theme, accent] = next.split('-') as [Theme, Accent];
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);
    syncThemeColor(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const nextPreset = preset ? PRESETS[(PRESETS.indexOf(preset) + 1) % PRESETS.length] : 'dark-red';
  const nextLabel = nextPreset.replace('-', ' + ');

  return (
    <button type="button" className="theme-toggle" onClick={toggle}
      aria-label={`Switch to ${nextLabel} theme`} title={`Next: ${nextLabel}`}>
      <SunIcon className="icon-sun" width={17} height={17} />
      <MoonIcon className="icon-moon" width={17} height={17} />
    </button>
  );
}