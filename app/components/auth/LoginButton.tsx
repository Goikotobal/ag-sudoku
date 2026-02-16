'use client';

import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

interface LoginButtonProps {
  variant?: 'default' | 'compact';
  selectedAvatar?: string;
}

// Google icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function LoginButton({ variant = 'default', selectedAvatar }: LoginButtonProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = useTranslations('sudoku');

  if (loading) {
    return (
      <div style={{
        padding: variant === 'compact' ? '6px 12px' : '10px 20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: variant === 'compact' ? '12px' : '14px',
      }}>
        ...
      </div>
    );
  }

  if (user) {
    const displayName = user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] ||
                        'Player';

    // Use monster avatar if selected, otherwise Google avatar, otherwise initial
    const avatarSrc = selectedAvatar
      ? `/avatars/${selectedAvatar}.png`
      : user.user_metadata?.avatar_url;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: variant === 'compact' ? '6px 12px' : '8px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Avatar */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              style={{
                width: variant === 'compact' ? '24px' : '32px',
                height: variant === 'compact' ? '24px' : '32px',
                borderRadius: selectedAvatar ? '8px' : '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: variant === 'compact' ? '24px' : '32px',
              height: variant === 'compact' ? '24px' : '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: variant === 'compact' ? '11px' : '13px',
              fontWeight: 700,
              color: 'white',
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name */}
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: variant === 'compact' ? '12px' : '14px',
            fontWeight: 600,
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          style={{
            padding: variant === 'compact' ? '6px 10px' : '8px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: variant === 'compact' ? '11px' : '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {t('auth.signOut')}
        </button>
      </div>
    );
  }

  // Not logged in - show Google sign in button
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      <button
        onClick={signInWithGoogle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: variant === 'compact' ? '10px 16px' : '12px 24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: variant === 'compact' ? '13px' : '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
        }}
      >
        <GoogleIcon />
        <span>{t('auth.signInGoogle')}</span>
      </button>
      <span style={{
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '11px',
      }}>
        {t('auth.saveProgress')}
      </span>
    </div>
  );
}
