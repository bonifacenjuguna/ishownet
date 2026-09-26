'use client';

import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import type { SpeedUnit } from '@/lib/format';

interface HeaderProps {
  unit: SpeedUnit;
  onUnitChange: (u: SpeedUnit) => void;
}

const UNITS: SpeedUnit[] = ['Mbps', 'MB/s'];

export default function Header({ unit, onUnitChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#test" className="header-brand" aria-label="iShowNet home">
          <Logo />
        </a>

        <nav className="header-nav" aria-label="Sections">
          <a href="#results">Results</a>
          <a href="#insights">Insights</a>
          <a href="#history">History</a>
        </nav>

        <div className="header-controls">
          <div className="segmented" role="group" aria-label="Speed unit">
            {UNITS.map((u) => (
              <button key={u} className={u === unit ? 'active' : ''} aria-pressed={u === unit} onClick={() => onUnitChange(u)}>
                {u}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}