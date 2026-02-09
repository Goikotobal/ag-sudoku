'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Main Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '32px',
        padding: '48px 40px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        textAlign: 'center',
        animation: mounted ? 'fadeInUp 0.6s ease' : 'none',
      }}>
        {/* Back to Website Button */}
        <a
          href="https://alexgoiko.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '12px',
          }}
        >
          ← alexgoiko.com
        </a>

        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/images/logo-trans.avif"
            alt="AG Logo"
            style={{
              width: '130px',
              height: '130px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.5))',
            }}
          />
        </div>

        {/* Welcome Text */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          margin: '0 0 16px 0',
          filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))',
        }}>
          AG Games
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '18px',
          lineHeight: 1.6,
          margin: '0 0 40px 0',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        }}>
          {t('sudoku.subtitle')}
        </p>

        {/* Play Sudoku Button - Main CTA */}
        <button
          onClick={() => router.push(`/${locale}/sudoku/play`)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            padding: '20px 32px',
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
            transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>🎮</span>
          {t('nav.sudoku')} - {t('sudoku.landing.playNow')}
        </button>

        {/* Game Preview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '32px',
        }}>
          {[
            { label: t('sudoku.difficulties.medium'), color: '#10b981', icon: '🎯' },
            { label: t('sudoku.difficulties.expert'), color: '#f59e0b', icon: '🔥' },
            { label: t('sudoku.difficulties.pro'), color: '#ef4444', icon: '💀' },
          ].map((diff, index) => (
            <div
              key={index}
              style={{
                padding: '16px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: `1px solid ${diff.color}40`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{diff.icon}</div>
              <div style={{
                color: diff.color,
                fontSize: '13px',
                fontWeight: 600,
                textShadow: `0 1px 4px ${diff.color}40`,
              }}>
                {diff.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          marginTop: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {[
            t('sudoku.features.aiHints'),
            t('sudoku.features.languages'),
            t('sudoku.features.autoSave'),
            t('sudoku.features.offline')
          ].map((feature, i) => (
            <span
              key={i}
              style={{
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#ffffff',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '500px',
      }}>
        {[
          { code: 'en', label: 'EN' },
          { code: 'es', label: 'ES' },
          { code: 'eu', label: 'EU' },
          { code: 'fr', label: 'FR' },
          { code: 'it', label: 'IT' },
          { code: 'de', label: 'DE' },
          { code: 'pt', label: 'PT' },
          { code: 'ja', label: '日本' },
          { code: 'tl', label: 'TL' },
          { code: 'ko', label: '한국' },
          { code: 'zh', label: '中文' },
          { code: 'hi', label: 'हिन्' },
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => router.push(`/${lang.code}/sudoku/play`)}
            style={{
              padding: '8px 12px',
              background: locale === lang.code
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              border: locale === lang.code
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: locale === lang.code ? '#10b981' : 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* CSS Animations */}
      {mounted && (
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      )}
    </main>
  );
}
