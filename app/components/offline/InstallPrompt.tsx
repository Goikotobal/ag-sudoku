'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { isPremium } from '@/utils/premium';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const t = useTranslations('sudoku');
  const { profile } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const userIsPro = isPremium(profile?.subscription_tier);

  useEffect(() => {
    // Only show to Pro users
    if (!userIsPro) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [userIsPro]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[InstallPrompt] PWA installed successfully');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  const installPromptText = t.has('offline.installPrompt') ? t('offline.installPrompt') : 'Install AG Sudoku';
  const installDescText = t.has('offline.installDescription') ? t('offline.installDescription') : 'Add to your home screen for the best offline experience';
  const installBtnText = t.has('offline.installButton') ? t('offline.installButton') : 'Install App';
  const dismissBtnText = t.has('offline.dismissButton') ? t('offline.dismissButton') : 'Maybe Later';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        background: 'rgba(30, 30, 45, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}
        >
          +
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: '0 0 4px 0',
              fontSize: '16px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {installPromptText}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {installDescText}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {installBtnText}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {dismissBtnText}
        </button>
      </div>
    </div>
  );
}
