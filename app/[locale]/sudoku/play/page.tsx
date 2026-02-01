'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AISudoku from '../../../components/sudoku/AISudoku';

export default function SudokuPlayPage() {
  const t = useTranslations('sudoku');
  const router = useRouter();
  const [showGame, setShowGame] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'medium' | 'expert' | 'pro'>('medium');
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (showGame) {
    return <AISudoku onQuit={() => setShowGame(false)} />;
  }

  const features = [
    t('landing.features.aiHints'),
    t('landing.features.difficulties'),
    t('landing.features.offline'),
    t('landing.features.autoSave'),
    t('landing.features.notes'),
    t('landing.features.tracking')
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
      {/* Modal Container - Glassmorphism */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '32px',
        padding: '48px 40px',
        maxWidth: '520px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/images/logo-trans.avif"
            alt="AG Logo"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))',
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          margin: '0 0 16px 0',
          filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))',
        }}>
          {t('title')}
        </h1>

        {/* AI Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#ffffff',
          padding: '8px 20px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}>
          <span style={{
            animation: 'pulse 2s infinite',
            fontSize: '16px',
          }}>✨</span>
          {t('subtitle')}
        </div>

        {/* Description */}
        <p style={{
          color: '#ffffff',
          fontSize: '17px',
          lineHeight: 1.6,
          margin: '0 0 32px 0',
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)',
          fontWeight: 500,
        }}>
          {t('landing.description')}
        </p>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          {features.map((feature, index) => (
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

        {/* Difficulty Selector */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
        }}>
          {(['medium', 'expert', 'pro'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                flex: 1,
                padding: '14px 12px',
                background: selectedDifficulty === diff
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#ffffff',
                border: selectedDifficulty === diff
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                boxShadow: selectedDifficulty === diff
                  ? '0 4px 16px rgba(16, 185, 129, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.15)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {t(`difficulties.${diff}`)}
            </button>
          ))}
        </div>

        {/* Play Now Button */}
        <button
          onClick={() => setShowGame(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            padding: '18px 28px',
            fontSize: '20px',
            fontWeight: 700,
            color: 'white',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: isHovered
              ? '0 12px 32px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 24px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.3s ease',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {t('landing.playNow')}
        </button>

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

        {/* Difficulty Info */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }}></span>
          <span>
            <strong>{t(`difficulties.${selectedDifficulty}`)}:</strong>{' '}
            {t(`difficultyInfo.${selectedDifficulty}`)}
          </span>
        </div>
      </div>

      {/* CSS Animations - only render after mount to avoid hydration mismatch */}
      {mounted && (
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }

          @media (max-width: 768px) {
            main > div {
              padding: 32px 24px !important;
            }
            main > div h1 {
              font-size: 36px !important;
            }
            main > div > div:nth-child(5) {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      )}
    </main>
  );
}
