'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SudokuLandingPage() {
  const t = useTranslations('sudoku');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const difficulties = [
    {
      id: 'medium',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: '🎯',
    },
    {
      id: 'expert',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '🔥',
    },
    {
      id: 'pro',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: '💀',
    },
  ];

  const handlePlayNow = (difficulty: string) => {
    // Store selected difficulty in localStorage for the game to read
    localStorage.setItem('ag-sudoku-selected-difficulty', difficulty);
    router.push(`/${locale}/sudoku/play`);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/Frame1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
        maxWidth: '800px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/images/logo-trans.avif"
            alt="AG Sudoku Logo"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.5))',
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          margin: '0 0 16px 0',
          filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))',
          lineHeight: 1.1,
        }}>
          {t('landing.hero', { defaultValue: 'Challenge Your Mind' })}
        </h1>

        {/* Subtitle */}
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 600,
          color: '#ffffff',
          margin: '0 0 24px 0',
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
          opacity: 0.95,
        }}>
          {t('subtitle')} • {t('title')}
        </h2>

        {/* Description */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 'clamp(16px, 2vw, 18px)',
          lineHeight: 1.7,
          maxWidth: '600px',
          margin: '0 auto',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        }}>
          {t('landing.description')}
        </p>
      </div>

      {/* Difficulty Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1000px',
        width: '100%',
        marginBottom: '48px',
      }}>
        {difficulties.map((diff, index) => (
          <div
            key={diff.id}
            onMouseEnter={() => setHoveredCard(diff.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px 28px',
              border: `2px solid ${hoveredCard === diff.id ? diff.color : 'rgba(255, 255, 255, 0.2)'}`,
              transition: 'all 0.3s ease',
              transform: hoveredCard === diff.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
              boxShadow: hoveredCard === diff.id
                ? `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${diff.color}40`
                : '0 8px 32px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              animation: mounted ? `slideInUp 0.5s ease ${index * 0.1}s both` : 'none',
            }}
            onClick={() => handlePlayNow(diff.id)}
          >
            {/* Card Icon */}
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}>
              {diff.icon}
            </div>

            {/* Difficulty Name */}
            <h3 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: diff.color,
              margin: '0 0 12px 0',
              textShadow: `0 2px 8px ${diff.color}60`,
            }}>
              {t(`difficulties.${diff.id}`)}
            </h3>

            {/* Difficulty Info */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 24px 0',
              lineHeight: 1.5,
              minHeight: '42px',
            }}>
              {t(`difficultyInfo.${diff.id}`)}
            </p>

            {/* Play Button */}
            <button
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
                background: diff.gradient,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${diff.color}50`,
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${diff.color}70`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${diff.color}50`;
              }}
            >
              {t('landing.playNow')}
            </button>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '1000px',
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#10b981',
          margin: '0 0 20px 0',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
        }}>
          ✨ Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
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
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <span style={{
                color: '#10b981',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>✓</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 500,
              }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <button
        onClick={() => router.push('/')}
        style={{
          marginTop: '32px',
          padding: '14px 28px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← {t('landing.backToHome')}
      </button>

      {/* CSS Animations */}
      {mounted && (
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            main > div:nth-child(2) {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      )}
    </main>
  );
}
