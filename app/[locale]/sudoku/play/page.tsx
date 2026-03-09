'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AISudoku from '../../../components/sudoku/AISudoku';
import { useAuth } from '@/context/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useProfileCache } from '@/hooks/useProfileCache';
import { OfflineBanner } from '@/components/OfflineBanner';
import { OfflineFreeModal } from '@/components/OfflineFreeModal';

type Difficulty = 'medium' | 'expert' | 'pro';

export default function SudokuPlayPage() {
  const t = useTranslations('sudoku');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { profile } = useAuth();
  const { isOnline } = useOnlineStatus();
  const profileCache = useProfileCache();
  const [showGame, setShowGame] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Difficulty | null>(null);
  const [showOfflineFreeModal, setShowOfflineFreeModal] = useState(false);

  // Determine Pro status: online from profile, offline from cache
  const isPro = isOnline ? profile?.subscription_tier === 'pro' : profileCache?.isPro;

  // Check if user is offline and not Pro - show modal
  useEffect(() => {
    if (!isOnline && !isPro && profileCache) {
      setShowOfflineFreeModal(true);
    }
  }, [isOnline, isPro, profileCache]);

  // Debug logging for Pro status
  useEffect(() => {
    console.log('isPro:', isPro, 'isOnline:', isOnline, 'profile:', profile);
  }, [isPro, isOnline, profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDifficultyClick = (difficulty: Difficulty) => {
    console.log('[Play Page] handleDifficultyClick called with:', difficulty);
    // Pro difficulty only available for Pro subscribers
    if (difficulty === 'pro' && !isPro) {
      console.log('[Play Page] Pro difficulty blocked for free user');
      return;
    }

    console.log('[Play Page] Starting game with difficulty:', difficulty, 'isPro:', isPro);
    console.log('[Play Page] Current selectedDifficulty before update:', selectedDifficulty);
    setSelectedDifficulty(difficulty);
    setShowGame(true);
  };

  const handleUpgradeClick = () => {
    router.push(`https://www.alexgoiko.com/${locale}/subscribe`);
  };

  const handleBackToHome = () => {
    router.push(`/${locale}`);
  };

  if (showGame) {
    console.log('[Play Page] Rendering AISudoku with selectedDifficulty:', selectedDifficulty, 'isPro:', isPro);
    return (
      <>
        {!isOnline && isPro && <OfflineBanner />}
        <AISudoku initialDifficulty={selectedDifficulty} isPro={isPro} isOffline={!isOnline} />
      </>
    );
  }

  return (
    <>
      {/* Offline Free User Modal */}
      {showOfflineFreeModal && (
        <OfflineFreeModal
          onClose={handleBackToHome}
          onUpgrade={handleUpgradeClick}
        />
      )}

      {/* Offline Banner for Pro Users */}
      {!isOnline && isPro && <OfflineBanner />}

    <main suppressHydrationWarning style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/Frame1.png)',
      backgroundSize: 'cover',
      backgroundPosition: '30% center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Main Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '32px',
        padding: '48px 40px',
        maxWidth: '850px',
        width: '95%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '20px' }}>
          <img
            src="/images/logo-trans.avif"
            alt="AG Logo"
            style={{
              width: '90px',
              height: '90px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))',
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          margin: '0 0 12px 0',
          filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))',
        }}>
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p style={{
          color: '#ffffff',
          fontSize: '16px',
          lineHeight: 1.5,
          margin: '0 0 32px 0',
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
          fontWeight: 500,
        }}>
          {t('landing.hero')}
        </p>

        {/* Difficulty Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {/* Medium Card */}
          <div
            onMouseEnter={() => setHoveredCard('medium')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '24px',
              padding: '28px 20px',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              boxShadow: hoveredCard === 'medium'
                ? '0 12px 40px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 20px rgba(16, 185, 129, 0.2)',
              transform: hoveredCard === 'medium' ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => handleDifficultyClick('medium')}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
              🎯
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#10b981',
              margin: '0 0 12px 0',
              textShadow: '0 2px 8px rgba(16, 185, 129, 0.6)',
            }}>
              {t('difficulties.medium')}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'white',
              margin: '0 0 8px 0',
              fontWeight: 600,
            }}>
              {t('difficultySelect.mediumStats')}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 20px 0',
              fontStyle: 'italic',
            }}>
              {t('difficultySelect.mediumDesc')}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultyClick('medium');
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('difficultySelect.playNow')}
            </button>
          </div>

          {/* Expert Card */}
          <div
            onMouseEnter={() => setHoveredCard('expert')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '24px',
              padding: '28px 20px',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              boxShadow: hoveredCard === 'expert'
                ? '0 12px 40px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 20px rgba(245, 158, 11, 0.2)',
              transform: hoveredCard === 'expert' ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => handleDifficultyClick('expert')}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
              🔥
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f59e0b',
              margin: '0 0 12px 0',
              textShadow: '0 2px 8px rgba(245, 158, 11, 0.6)',
            }}>
              {t('difficulties.expert')}
            </h2>
            <div style={{
              fontSize: '14px',
              color: 'white',
              margin: '0 0 8px 0',
              fontWeight: 600,
            }}>
              {isPro ? (
                <span>{t('difficultySelect.expertStatsPro')}</span>
              ) : (
                <span>{t('difficultySelect.expertStatsFree')}</span>
              )}
            </div>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 20px 0',
              fontStyle: 'italic',
            }}>
              {t('difficultySelect.expertDesc')}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultyClick('expert');
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('difficultySelect.playNow')}
            </button>
          </div>

          {/* Pro Card */}
          <div
            onMouseEnter={() => setHoveredCard('pro')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '24px',
              padding: '28px 20px',
              border: (isPro || !isOnline)
                ? '2px solid rgba(239, 68, 68, 0.7)'
                : '2px solid rgba(239, 68, 68, 0.5)',
              boxShadow: hoveredCard === 'pro'
                ? '0 12px 40px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 4px 20px rgba(239, 68, 68, 0.2)',
              transform: hoveredCard === 'pro'
                ? ((isPro || !isOnline) ? 'translateY(-8px) scale(1.02)' : 'translateY(-4px)')
                : 'translateY(0)',
              transition: 'all 0.3s ease',
              cursor: (isPro || !isOnline) ? 'pointer' : 'not-allowed',
              position: 'relative',
              opacity: (isPro || !isOnline) ? 1 : 0.85,
            }}
            onClick={() => (isPro || !isOnline) && handleDifficultyClick('pro')}
          >
            {/* Badge - Lock for Free (online only), Star for Pro or Offline */}
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: (isPro || !isOnline)
                ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                : 'rgba(0, 0, 0, 0.6)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {(isPro || !isOnline) ? '⭐ PRO' : '🔒 PRO'}
            </div>

            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
              💀
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ef4444',
              margin: '0 0 12px 0',
              textShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
            }}>
              {t('difficulties.pro')}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'white',
              margin: '0 0 8px 0',
              fontWeight: 600,
            }}>
              {t('difficultySelect.proStats')}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 20px 0',
              fontStyle: 'italic',
            }}>
              {t('difficultySelect.proDesc')}
            </p>
            {(isPro || !isOnline) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDifficultyClick('pro');
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('difficultySelect.playNow')}
              </button>
            ) : (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.5)',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.4) 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'not-allowed',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                PRO ONLY
              </button>
            )}
          </div>
        </div>

        {/* Free vs Pro Comparison Section - Only show for non-Pro users who are online */}
        {!isPro && isOnline && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: '20px',
            padding: '28px 24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            marginBottom: '24px',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 20px 0',
              textAlign: 'center',
            }}>
              {t('difficultySelect.comparisonTitle')}
            </h3>

            {/* Comparison Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40% 30% 30%',
              gap: '0',
              fontSize: '14px',
              maxWidth: '500px',
              margin: '0 auto',
              overflowX: 'hidden',
              width: '100%',
            }}>
            {/* Header Row */}
            <div style={{ padding: '12px 8px', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              {t('difficultySelect.feature')}
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', textAlign: 'center', minWidth: 70 }}>
              {t('difficultySelect.free')}
            </div>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(168,85,247,0.4)',
              fontWeight: 700,
              textAlign: 'center',
              minWidth: 120,
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              borderRadius: '8px 8px 0 0',
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>PRO ⭐</span>
            </div>

            {/* Medium difficulty */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.mediumDiff')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#10b981' }}>
              ✅
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#10b981', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅
            </div>

            {/* Expert difficulty */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.expertDiff')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#10b981' }}>
              ✅
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#10b981', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅
            </div>

            {/* Pro difficulty */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.proDiff')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              🔒
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#10b981', fontSize: '12px', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅
            </div>

            {/* AI hints (Expert) */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.aiHintsExpert')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
              {t('difficultySelect.hintsPerGameFree')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#a855f7', fontWeight: 600, background: 'rgba(168, 85, 247, 0.05)' }}>
              {t('difficultySelect.hintsPerGamePro')}
            </div>

            {/* Challenge Week */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.challengeWeek')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#10b981' }}>
              ✅
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#10b981', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅
            </div>

            {/* 1v1 Challenges */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.challenges1v1')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              ❌
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#a855f7', fontSize: '11px', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅ Soon
            </div>

            {/* Quarterly prizes */}
            <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {t('difficultySelect.quarterlyPrizes')}
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              ❌
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(168,85,247,0.2)', textAlign: 'center', color: '#a855f7', fontSize: '11px', background: 'rgba(168, 85, 247, 0.05)' }}>
              ✅ Soon
            </div>

            {/* Avatar accessories */}
            <div style={{ padding: '10px 8px', color: 'white' }}>
              {t('difficultySelect.avatarAccessories')}
            </div>
            <div style={{ padding: '10px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              ❌
            </div>
            <div style={{ padding: '10px 16px', textAlign: 'center', color: '#a855f7', fontSize: '11px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '0 0 8px 0' }}>
              ✅ Soon
            </div>
          </div>

            {/* Upgrade Button */}
            <a
              href="https://alexgoiko.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                marginTop: '20px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                textDecoration: 'none',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
            >
              {t('difficultySelect.upgradeBtn')}
            </a>

            {/* Already Pro note */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px',
              margin: '12px 0 0 0',
              textAlign: 'center',
            }}>
              {t('difficultySelect.alreadyProNote')}
            </p>
          </div>
        )}

        {/* Pro Perks Section - Only show for Pro users */}
        {isPro && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginBottom: '24px',
            maxWidth: '400px',
            margin: '0 auto 24px auto',
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>⭐</span> {t('difficultySelect.proBenefitsTitle')}
            </h3>

            <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
              <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10b981' }}>✅</span> {t('difficultySelect.benefit1')}
              </div>
              <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10b981' }}>✅</span> {t('difficultySelect.benefit2')}
              </div>
              <div style={{ color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔜</span> {t('difficultySelect.benefit3')}
              </div>
              <div style={{ color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔜</span> {t('difficultySelect.benefit4')}
              </div>
              <div style={{ color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔜</span> {t('difficultySelect.benefit5')}
              </div>
            </div>

            <p style={{
              color: '#e9d5ff',
              fontSize: '13px',
              margin: '16px 0 0 0',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              {t('difficultySelect.thankYou')} 🙏
            </p>
          </div>
        )}

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← {t('landing.backToHome')}
        </button>
      </div>

      {/* CSS Animations */}
      {mounted && (
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.15); }
          }

          @media (max-width: 640px) {
            main > div {
              padding: 32px 20px !important;
            }
          }
        `}</style>
      )}
    </main>
    </>
  );
}
