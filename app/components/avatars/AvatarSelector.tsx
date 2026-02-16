'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Avatar definitions
export const AVATARS = [
  // Free avatars (first 6)
  { id: 'blinky', premium: false },
  { id: 'spiky', premium: false },
  { id: 'puddles', premium: false },
  { id: 'fuzzy', premium: false },
  { id: 'squiggles', premium: false },
  { id: 'professor-numbskull', premium: false },
  // Premium avatars
  { id: 'glitchy', premium: true },
  { id: 'aurora', premium: true },
  { id: 'chompy', premium: true },
  { id: 'zappy', premium: true },
  { id: 'bubbles', premium: true },
  { id: 'crystallo', premium: true },
  { id: 'fluffy-cloud', premium: true },
  { id: 'flame', premium: true },
  { id: 'twinkle', premium: true },
  { id: 'leafy', premium: true },
  { id: 'frosty', premium: true },
  { id: 'shadow', premium: true },
  { id: 'glow', premium: true },
  { id: 'sparky', premium: true },
];

const STORAGE_KEY = 'ag_sudoku_avatar';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarSelector({ isOpen, onClose, selectedAvatar, onSelect }: AvatarSelectorProps) {
  const t = useTranslations('sudoku');

  if (!isOpen) return null;

  const handleSelect = (avatarId: string) => {
    onSelect(avatarId);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, avatarId);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '480px',
        maxHeight: '85vh',
        background: 'rgba(30, 30, 40, 0.95)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
            }}>
              {t('avatars.title')}
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
            }}>
              {t('avatars.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Avatar Grid */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Free Avatars Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(16, 185, 129, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              {t('avatars.free')}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}>
              {AVATARS.filter(a => !a.premium).map((avatar) => (
                <AvatarItem
                  key={avatar.id}
                  avatar={avatar}
                  isSelected={selectedAvatar === avatar.id}
                  onSelect={handleSelect}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Premium Avatars Section */}
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(168, 85, 247, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>⭐</span>
              {t('avatars.premium')}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}>
              {AVATARS.filter(a => a.premium).map((avatar) => (
                <AvatarItem
                  key={avatar.id}
                  avatar={avatar}
                  isSelected={selectedAvatar === avatar.id}
                  onSelect={handleSelect}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface AvatarItemProps {
  avatar: { id: string; premium: boolean };
  isSelected: boolean;
  onSelect: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}

function AvatarItem({ avatar, isSelected, onSelect, t }: AvatarItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(avatar.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        background: isSelected
          ? 'rgba(168, 85, 247, 0.2)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.08)',
        border: isSelected
          ? '2px solid rgba(168, 85, 247, 0.8)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected
          ? '0 0 20px rgba(168, 85, 247, 0.4)'
          : 'none',
      }}
    >
      <img
        src={`/avatars/${avatar.id}.png`}
        alt={avatar.id}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Premium badge */}
      {avatar.premium && (
        <span style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '10px',
        }}>
          ⭐
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(168, 85, 247, 0.9)',
          color: 'white',
          fontSize: '9px',
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}>
          {t('avatars.selected')}
        </div>
      )}
    </button>
  );
}

// Helper hook for avatar management
export function useAvatar() {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('blinky');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedAvatar(saved);
      }
    }
  }, []);

  const selectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, avatarId);
    }
  };

  return { selectedAvatar, selectAvatar };
}
