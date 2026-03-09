'use client';

import { useTranslations } from 'next-intl';

type OfflineFreeModalProps = {
  onClose: () => void;
  onUpgrade: () => void;
};

export function OfflineFreeModal({ onClose, onUpgrade }: OfflineFreeModalProps) {
  const t = useTranslations('sudoku.offline');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '2px solid rgba(168, 85, 247, 0.6)',
        borderRadius: '24px',
        padding: '40px 36px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))',
        }}>
          🧩
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '16px',
        }}>
          {t('freeTitle')}
        </h2>

        {/* Body */}
        <p style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '32px',
        }}>
          {t('freeBody')}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            onClick={onUpgrade}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            ⭐ {t('upgradeToPro')}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
