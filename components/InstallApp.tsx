'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
}

export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    setIos(isIOS());

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!promptEvent) return;

    const currentPrompt = promptEvent;
    setPromptEvent(null);

    await currentPrompt.prompt();
    const { outcome } = await currentPrompt.userChoice;

    if (outcome === 'dismissed') {
      // The current browser prompt is consumed. A future beforeinstallprompt
      // event can make the install UI available again.
      setPromptEvent(null);
    }
  }

  if (installed || (!promptEvent && !ios)) return null;

  return (
    <section className="container section install-section" aria-labelledby="install-heading">
      <div className="install-card">
        <div className="install-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="1.4" y="1.4" width="29.2" height="29.2" rx="9" fill="currentColor" opacity=".1" />
            <path d="M4 16h3l2-8 2 16 2-12 2 8 2-6 2 2h4.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="23.5" cy="16" r="2" fill="currentColor" />
          </svg>
        </div>

        <div className="install-copy">
          <p className="eyebrow">Install iShowNet</p>
          <h2 id="install-heading">Keep your speed test one tap away</h2>
          <p>
            Install iShowNet like an app for a cleaner, app-style launch without needing to open a browser tab first.
          </p>
        </div>

        {promptEvent ? (
          <button className="btn btn-primary install-button" onClick={handleInstall}>
            Install iShowNet
          </button>
        ) : (
          <div className="install-ios">
            <strong>Add to Home Screen</strong>
            <span>In Safari, tap Share, then choose “Add to Home Screen”.</span>
          </div>
        )}
      </div>
    </section>
  );
}
