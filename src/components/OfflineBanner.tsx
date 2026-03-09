'use client';

import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const t = useTranslations('sudoku.offline');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(217, 119, 6, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#fef3c7',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      }}>
        {t('banner')}
      </span>
    </div>
  );
}
