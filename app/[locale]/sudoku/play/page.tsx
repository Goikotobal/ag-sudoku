'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AISudoku from '../../../components/sudoku/AISudoku';

type Difficulty = 'medium' | 'expert' | 'pro';

export default function SudokuPlayPage() {
  const t = useTranslations('sudoku');
  const router = useRouter();
  const [showGame, setShowGame] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Difficulty | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startGame = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowGame(true);
  };

  if (showGame) {
    return <AISudoku initialDifficulty={selectedDifficulty} />;
  }

  const difficulties: { key: Difficulty; color: string; icon: string; gradient: string }[] = [
    { key: 'medium', color: '#10b981', icon: '🎯', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { key: 'expert', color: '#f59e0b', icon: '🔥', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { key: 'pro', color: '#ef4444', icon: '💀', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  ];

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
              onClick={() => startGame(diff.key)}
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
                  startGame(diff.key);
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
    </main>
  );
}
