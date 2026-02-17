'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const priceId = selectedPlan === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: '⭐', text: 'All 20 Monster Avatars', available: true },
    { icon: '🎨', text: 'Premium Colors & Frames', available: false },
    { icon: '📊', text: 'Advanced Statistics', available: false },
    { icon: '🏆', text: 'Leaderboard Rankings', available: false },
    { icon: '🚫', text: 'Ad-Free Experience', available: false },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(30, 30, 45, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(168, 85, 247, 0.15)',
          zIndex: 1001,
          padding: '32px 24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AG Games Premium
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Unlock the full experience
          </p>
        </div>

        {/* Sign in prompt for guests */}
        {!user && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <div style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 600 }}>
              Sign in to upgrade
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginTop: '4px' }}>
              You need an account to subscribe
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            style={{
              background: selectedPlan === 'monthly'
                ? 'rgba(168, 85, 247, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedPlan === 'monthly'
                ? '2px solid rgba(168, 85, 247, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '20px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              Monthly
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
            }}>
              €2.49
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              per month
            </div>
          </button>

          {/* Yearly */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            style={{
              position: 'relative',
              background: selectedPlan === 'yearly'
                ? 'rgba(168, 85, 247, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedPlan === 'yearly'
                ? '2px solid rgba(168, 85, 247, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '20px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            {/* Save badge */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
            }}>
              Save 33%
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}>
              Yearly
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
            }}>
              €19.99
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              per year
            </div>
          </button>
        </div>

        {/* Benefits */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '16px',
          }}>
            What you get
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{benefit.icon}</span>
                <span style={{
                  flex: 1,
                  fontSize: '14px',
                  color: benefit.available ? 'white' : 'rgba(255, 255, 255, 0.5)',
                }}>
                  {benefit.text}
                </span>
                {!benefit.available && (
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(168, 85, 247, 0.8)',
                    background: 'rgba(168, 85, 247, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ef4444',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleSubscribe}
            disabled={loading || !user}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: user
                ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: user ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1,
              boxShadow: user ? '0 4px 20px rgba(168, 85, 247, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Loading...' : 'Subscribe Now'}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Maybe Later
          </button>
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
        }}>
          Cancel anytime • Secure payment via Stripe
        </div>
      </div>
    </>
  );
}
