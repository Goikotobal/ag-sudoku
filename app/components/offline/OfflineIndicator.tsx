'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTranslations } from 'next-intl';

interface OfflineIndicatorProps {
  variant?: 'banner' | 'badge';
}

export function OfflineIndicator({ variant = 'badge' }: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const t = useTranslations('sudoku');

  if (isOnline && !wasOffline) return null;

  if (variant === 'banner') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px 16px',
          background: isOnline
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 9999,
          animation: 'slideInDown 0.3s ease-out',
        }}
      >
        {isOnline
          ? t.has('offline.backOnline') ? t('offline.backOnline') : 'Back online - syncing...'
          : t.has('offline.playingOffline') ? t('offline.playingOffline') : 'You are offline - playing locally'}
      </div>
    );
  }

  // Badge variant
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '12px',
        background: isOnline
          ? 'rgba(16, 185, 129, 0.15)'
          : 'rgba(245, 158, 11, 0.15)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        fontSize: '11px',
        fontWeight: 600,
        color: isOnline ? '#10b981' : '#f59e0b',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isOnline ? '#10b981' : '#f59e0b',
          animation: isOnline ? 'none' : 'pulse 2s infinite',
        }}
      />
      {isOnline
        ? (t.has('offline.statusOnline') ? t('offline.statusOnline') : 'Online')
        : (t.has('offline.statusOffline') ? t('offline.statusOffline') : 'Offline')}
    </div>
  );
}
