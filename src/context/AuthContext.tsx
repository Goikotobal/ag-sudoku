'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  email: string;
  subscription_tier?: string;
  stripe_customer_id?: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  avatar_id?: string;
  color_id?: string;
  loadout_json?: Record<string, unknown>;
  xp?: number;
  level?: number;
  challenge_attempts_today?: number;
  challenge_attempts_reset_date?: string;
  challenge_qualified_until?: string;
  challenge_best_time?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;  // ← ADD THIS
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,  // ← ADD THIS
  loading: true,
  signInWithGoogle: async () => { },
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);  // ← ADD THIS
  const [loading, setLoading] = useState(true);

  // ← ADD THIS: Fetch profile when user changes
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    const supabase = createClient();
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
      });
  }, [user?.id]);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);  // ← ADD THIS
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signInWithGoogle, signOut }}>  {/* ← ADD profile */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
