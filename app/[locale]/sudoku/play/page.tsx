'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AISudoku from '../../../components/sudoku/AISudoku';
import { useAuth } from '@/context/AuthContext';
import { getFreeRules, getProRules } from '@/utils/difficultyRules';

type Difficulty = 'medium' | 'expert' | 'pro';

export default function SudokuPlayPage() {
  const t = useTranslations('sudoku');
  const router = useRouter();
  const { profile } = useAuth();
  const [showGame, setShowGame] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Difficulty | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null);

  const isPro = profile?.subscription_tier === 'pro';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDifficultyClick = (difficulty: Difficulty) => {
    console.log('[Play Page] Difficulty clicked:', difficulty, 'isPro:', isPro);

    // Pro users skip the modal entirely
    if (isPro) {
      console.log('[Play Page] Pro user - starting game directly');
      setSelectedDifficulty(difficulty);
      setShowGame(true);
      return;
    }

    // Free users see the comparison modal
    setPendingDifficulty(difficulty);
    setShowComparisonModal(true);
  };

  const handlePlayAsFree = () => {
    if (!pendingDifficulty) return;

    // Pro difficulty is not available for free users
    if (pendingDifficulty === 'pro') return;

    console.log('[Play Page] Playing as Free with difficulty:', pendingDifficulty);
    setSelectedDifficulty(pendingDifficulty);
    setShowComparisonModal(false);
    setShowGame(true);
  };

  if (showGame) {
    console.log('[Play Page] Rendering AISudoku with selectedDifficulty:', selectedDifficulty, 'isPro:', isPro);
    return <AISudoku initialDifficulty={selectedDifficulty} isPro={isPro} />;
  }

  const difficulties: { key: Difficulty; color: string; icon: string; gradient: string }[] = [
    { key: 'medium', color: '#10b981', icon: '🎯', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { key: 'expert', color: '#f59e0b', icon: '🔥', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { key: 'pro', color: '#ef4444', icon: '💀', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  ];

  // Get the display name for the difficulty
  const getDifficultyDisplayName = (diff: Difficulty) => {
    const names: Record<Difficulty, string> = {
      medium: 'Medium',
      expert: 'Expert',
      pro: 'Pro'
    };
    return names[diff];
  };

  // Get the icon for the difficulty
  const getDifficultyIcon = (diff: Difficulty) => {
    const icons: Record<Difficulty, string> = {
      medium: '🎯',
      expert: '🔥',
      pro: '💀'
    };
    return icons[diff];
  };

  return (
    <main suppressHydrationWarning style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/Frame1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
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
        maxWidth: '800px',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {difficulties.map((diff) => (
            <div
              key={diff.key}
              onMouseEnter={() => setHoveredCard(diff.key)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                borderRadius: '24px',
                padding: '28px 20px',
                border: `2px solid ${diff.color}50`,
                boxShadow: hoveredCard === diff.key
                  ? `0 12px 40px ${diff.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                  : `0 4px 20px ${diff.color}20`,
                transform: hoveredCard === diff.key ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => handleDifficultyClick(diff.key)}
            >
              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
              }}>
                {diff.icon}
              </div>

              {/* Difficulty Name */}
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: diff.color,
                margin: '0 0 8px 0',
                textShadow: `0 2px 8px ${diff.color}60`,
              }}>
                {t(`difficulties.${diff.key}`)}
              </h2>

              {/* Difficulty Description */}
              <p style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 20px 0',
                lineHeight: 1.4,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
              }}>
                {t(`difficultyInfo.${diff.key}`)}
              </p>

              {/* Play Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDifficultyClick(diff.key);
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  background: diff.gradient,
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: `0 6px 20px ${diff.color}50, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                {t('landing.playNow')}
              </button>
            </div>
          ))}
        </div>

        {/* Features Grid - 6 boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px',
          textAlign: 'left',
        }}>
          {[
            t('landing.features.aiHints'),
            t('landing.features.difficulties'),
            t('landing.features.offline'),
            t('landing.features.autoSave'),
            t('landing.features.notes'),
            t('landing.features.tracking'),
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#ffffff',
              lineHeight: 1.4,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
              fontWeight: 500,
            }}>
              <span style={{
                color: '#10b981',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginTop: '-1px',
                filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.6))',
              }}>✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            marginTop: '20px',
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

      {/* Free vs Pro Comparison Modal */}
      {showComparisonModal && pendingDifficulty && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowComparisonModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(45, 35, 60, 0.98) 100%)',
              borderRadius: 28,
              padding: '32px 28px',
              maxWidth: 520,
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(168, 85, 247, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>
                {getDifficultyIcon(pendingDifficulty)}
              </div>
              <h2 style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
              }}>
                AG Sudoku — {getDifficultyDisplayName(pendingDifficulty)}
              </h2>
            </div>

            {/* Comparison Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 24,
            }}>
              {/* Free Column */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <h3 style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 16,
                  fontWeight: 700,
                  margin: '0 0 16px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Free
                </h3>

                {pendingDifficulty === 'pro' ? (
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 14,
                    fontStyle: 'italic',
                    padding: '20px 0',
                  }}>
                    Not available
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    {(() => {
                      const freeRules = getFreeRules(pendingDifficulty);
                      if (!freeRules) return null;
                      return (
                        <>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 10,
                            color: 'white',
                            fontSize: 14,
                          }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            {freeRules.maxErrors} {freeRules.maxErrors === 1 ? 'mistake' : 'mistakes'}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 10,
                            color: 'white',
                            fontSize: 14,
                          }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            {freeRules.maxHints} AI {freeRules.maxHints === 1 ? 'hint' : 'hints'}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'white',
                            fontSize: 14,
                          }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            Auto-save
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Pro Column */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                borderRadius: 16,
                padding: 20,
                border: '2px solid rgba(168, 85, 247, 0.4)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
              }}>
                <h3 style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 16,
                  fontWeight: 700,
                  margin: '0 0 16px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  PRO
                </h3>

                <div style={{ textAlign: 'left' }}>
                  {(() => {
                    const proRules = getProRules(pendingDifficulty);
                    return (
                      <>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          {proRules.maxErrors} {proRules.maxErrors === 1 ? 'mistake' : 'mistakes'}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          {proRules.maxHints} AI {proRules.maxHints === 1 ? 'hint' : 'hints'}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          Auto-save
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          Challenge Week
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 10,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          1v1 Challenges
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: 'white',
                          fontSize: 14,
                        }}>
                          <span style={{ color: '#a855f7' }}>✓</span>
                          Leaderboards
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              flexDirection: 'column',
            }}>
              {/* Upgrade to Pro Button */}
              <a
                href="https://alexgoiko.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'white',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                Upgrade to Pro
                <span style={{ fontSize: 14 }}>↗</span>
              </a>

              {/* Play as Free Button */}
              <button
                onClick={handlePlayAsFree}
                disabled={pendingDifficulty === 'pro'}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: pendingDifficulty === 'pro' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                  background: 'transparent',
                  border: `1px solid ${pendingDifficulty === 'pro' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.25)'}`,
                  borderRadius: 14,
                  cursor: pendingDifficulty === 'pro' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {pendingDifficulty === 'pro' ? 'Pro subscribers only' : 'Play as Free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
