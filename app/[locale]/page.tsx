'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoginButton } from '../components/auth/LoginButton';
import { AvatarSelector, useAvatar } from '../components/avatars/AvatarSelector';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const { selectedAvatar, selectAvatar } = useAvatar();

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
        padding: '40px 36px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 80px rgba(16, 185, 129, 0.15)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        textAlign: 'center',
        animation: mounted ? 'fadeInUp 0.6s ease' : 'none',
      }}>
        {/* Header with Avatar and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Clickable Avatar */}
          <button
            onClick={() => setShowAvatarSelector(true)}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              border: '3px solid rgba(168, 85, 247, 0.5)',
              background: 'rgba(168, 85, 247, 0.15)',
              padding: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
            }}
          >
            <img
              src={`/avatars/${selectedAvatar}.png`}
              alt="Your avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </button>

          {/* Title */}
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-1px',
              margin: 0,
            }}>
              AG Sudoku
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13px',
              margin: '4px 0 0 0',
            }}>
              {t('sudoku.subtitle')}
            </p>
          </div>
        </div>

        {/* Login Button Section */}
        <div style={{
          marginBottom: '28px',
        }}>
          <LoginButton variant="compact" selectedAvatar={selectedAvatar} />
        </div>

        {/* Play Sudoku Button - Main CTA */}
        <button
          onClick={() => router.push(`/${locale}/sudoku/play`)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            padding: '18px 28px',
            fontSize: '18px',
            fontWeight: 700,
            color: 'white',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: isHovered
              ? '0 12px 32px rgba(16, 185, 129, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 24px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '22px' }}>🎮</span>
          {t('sudoku.landing.playNow')}
        </button>

        {/* Difficulty Preview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginTop: '24px',
        }}>
          {[
            { label: t('sudoku.difficulties.medium'), color: '#10b981', icon: '🎯' },
            { label: t('sudoku.difficulties.expert'), color: '#f59e0b', icon: '🔥' },
            { label: t('sudoku.difficulties.pro'), color: '#ef4444', icon: '💀' },
          ].map((diff, index) => (
            <div
              key={index}
              style={{
                padding: '14px 10px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '10px',
                border: `1px solid ${diff.color}40`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{diff.icon}</div>
              <div style={{
                color: diff.color,
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {diff.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px',
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
                padding: '5px 12px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '16px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
              }}
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Back to Website */}
        <a
          href="https://alexgoiko.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'color 0.2s ease',
          }}
        >
          ← alexgoiko.com
        </a>
      </div>

      {/* Language Selector */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px',
        maxWidth: '400px',
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
            onClick={() => router.push(`/${lang.code}`)}
            style={{
              padding: '6px 10px',
              background: locale === lang.code
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(255, 255, 255, 0.08)',
              border: locale === lang.code
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: locale === lang.code ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Avatar Selector Modal */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        selectedAvatar={selectedAvatar}
        onSelect={selectAvatar}
      />

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
