'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { isPremium } from '@/utils/premium';
import { UpgradeModal } from './UpgradeModal';

interface OfflineModeCardProps {
  onEnable?: () => void;
  isEnabled?: boolean;
}

export function OfflineModeCard({ onEnable, isEnabled = false }: OfflineModeCardProps) {
  const t = useTranslations('sudoku');
  const { profile } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const userIsPro = isPremium(profile?.subscription_tier);

  const handleClick = () => {
    if (!userIsPro) {
      setShowUpgradeModal(true);
      return;
    }
    onEnable?.();
  };

  const titleText = t.has('offline.title') ? t('offline.title') : 'Offline Mode';
  const proText = t.has('offline.proRequired') ? t('offline.proRequired') : 'PRO';
  const enabledDescText = t.has('offline.enabledDescription') ? t('offline.enabledDescription') : 'Enabled - Play anywhere without internet';
  const descText = t.has('offline.description') ? t('offline.description') : 'Play puzzles without internet connection';
  const upgradeText = t.has('offline.upgradePrompt') ? t('offline.upgradePrompt') : 'Upgrade to Pro to play offline';

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '16px',
          background: userIsPro
            ? isEnabled
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${
            userIsPro
              ? isEnabled
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.08)'
          }`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: userIsPro
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          {userIsPro ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: userIsPro ? 'white' : 'rgba(255, 255, 255, 0.6)',
              marginBottom: '2px',
            }}
          >
            {titleText}
            {!userIsPro && (
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '10px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                {proText}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {userIsPro
              ? isEnabled
                ? enabledDescText
                : descText
              : upgradeText}
          </div>
        </div>

        {/* Toggle/Lock indicator */}
        <div>
          {userIsPro ? (
            <div
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: isEnabled
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255, 255, 255, 0.15)',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: isEnabled ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
