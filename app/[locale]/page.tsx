'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoginButton } from '../components/auth/LoginButton';
import { useAuth } from '@/context/AuthContext';
import { getLevelFromXP } from '@/hooks/useProfile';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // SSO: Get auth state from shared session
  const { user, profile, loading, signOut } = useAuth();

  // Derive level info from profile XP
  const levelInfo = profile?.xp !== undefined ? getLevelFromXP(profile.xp) : null;

  // Get display name: prefer display_name, fallback to first name from full_name (max 15 chars)
  const rawDisplayName = (
    (typeof profile?.display_name === 'string' && profile.display_name.trim()) ||
    (typeof profile?.full_name === 'string' && profile.full_name.split(' ')[0]) ||
    (typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.split(' ')[0]) ||
    'Player'
  );
  const displayName = String(rawDisplayName).slice(0, 15) || 'Player';

  // Check if user is Pro
  const isPro = profile?.subscription_tier === 'pro';

  // Use profile avatar if logged in, otherwise use default
  const avatarId = profile?.avatar_id;
  const currentAvatar = (user && typeof avatarId === 'string' && avatarId.trim()) ? avatarId : 'shadow';

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
          {/* Avatar Display */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              border: isPro
                ? '3px solid rgba(168, 85, 247, 0.7)'
                : '3px solid rgba(168, 85, 247, 0.5)',
              background: isPro
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25))'
                : 'rgba(168, 85, 247, 0.15)',
              padding: '4px',
              boxShadow: isPro
                ? '0 4px 20px rgba(168, 85, 247, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)'
                : '0 4px 20px rgba(168, 85, 247, 0.3)',
              position: 'relative',
            }}
          >
            <img
              src={`/avatars/${currentAvatar}.png`}
              alt="Avatar"
              onError={(e) => {
                // Fallback to shadow avatar if the image fails to load
                e.currentTarget.src = '/avatars/shadow.png';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '12px',
              }}
            />
            {/* PRO Badge on Avatar */}
            {isPro && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: 'white',
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.5)',
                letterSpacing: '0.5px',
              }}>
                PRO
              </div>
            )}
          </div>

          {/* Title / User Info */}
          <div style={{ textAlign: 'left' }}>
            {user && !loading ? (
              <>
                {/* Logged in: Show display name */}
                <h1 style={{
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  fontWeight: 800,
                  background: isPro
                    ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f472b6 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                  margin: 0,
                }}>
                  {displayName}
                </h1>
                {/* Level display */}
                {levelInfo && (
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: 600,
                  }}>
                    Lvl {levelInfo.level} • {levelInfo.title}
                  </p>
                )}
                {/* Edit Avatar & Profile link */}
                <a
                  href="https://alexgoiko.com/profile"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    textDecoration: 'none',
                    marginTop: '4px',
                    display: 'inline-block',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                >
                  ✏️ Edit Avatar & Profile
                </a>
              </>
            ) : (
              <>
                {/* Guest: Show title */}
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
              </>
            )}
          </div>
        </div>

        {/* Login Button Section */}
        <div style={{
          marginBottom: '28px',
        }}>
          {user && !loading ? (
            // Logged in: Show "Not you?" link
            <button
              onClick={() => signOut()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 16px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              Not you? Sign out
            </button>
          ) : (
            // Guest: Show Sign In with Google
            <LoginButton variant="compact" selectedAvatar={currentAvatar} />
          )}
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
          {t('sudoku.landing.play')}
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

        {/* Bottom Links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
        }}>
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
              transition: 'color 0.2s ease',
            }}
          >
            alexgoiko.com
          </a>
        </div>
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
