'use client';

import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

interface LoginButtonProps {
  variant?: 'default' | 'compact';
}

export function LoginButton({ variant = 'default' }: LoginButtonProps) {
  const { user, loading, signOut } = useAuth();
  const params = useParams();
  const locale = params.locale as string || 'en';

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
        }}>
          {/* Avatar */}
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              style={{
                width: variant === 'compact' ? '20px' : '28px',
                height: variant === 'compact' ? '20px' : '28px',
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
              }}
            />
          ) : (
            <div style={{
              width: variant === 'compact' ? '20px' : '28px',
              height: variant === 'compact' ? '20px' : '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: variant === 'compact' ? '10px' : '12px',
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
            maxWidth: '120px',
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
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: 'rgba(239, 68, 68, 0.9)',
            fontSize: variant === 'compact' ? '11px' : '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Not logged in - show sign in button
  const signInUrl = `https://alexgoiko.com/${locale}/auth/signin?redirect=https://sudoku.alexgoiko.com/${locale}`;

  return (
    <a
      href={signInUrl}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: variant === 'compact' ? '8px 14px' : '10px 20px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: variant === 'compact' ? '12px' : '14px',
        fontWeight: 600,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span>Sign In</span>
      <span style={{ fontSize: variant === 'compact' ? '14px' : '16px' }}>

      </span>
    </a>
  );
}
