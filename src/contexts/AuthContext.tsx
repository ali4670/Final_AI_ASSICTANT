import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username?: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInAsGuest: () => Promise<{ error: Error | null }>;
  updateProfile: (data: { username?: string; avatar_url?: string; phone?: string }) => Promise<{ error: Error | null }>;
  changePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle case where Supabase is not configured
    if (!supabase) {
      console.warn('Supabase is not configured. Please add environment variables.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(session?.user?.email === 'guest@neurostudy.ai');
      setIsAdmin(session?.user?.email === 'aliopooopp3@gmail.com' || session?.user?.user_metadata?.is_admin === true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(session?.user?.email === 'guest@neurostudy.ai');
      setIsAdmin(session?.user?.email === 'aliopooopp3@gmail.com' || session?.user?.user_metadata?.is_admin === true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, phone?: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
            phone: phone || '',
          }
        }
      });
      
      if (error) {
        // Check for rate limit error
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { error: new Error('Too many requests. Please wait a moment and try again.') };
        }
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('rate limit') || err.message.includes('too many requests')) {
        return { error: new Error('Too many requests. Please wait a moment and try again.') };
      }
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Check for rate limit error
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          return { error: new Error('Too many login attempts. Please wait a moment and try again.') };
        }
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('rate limit') || err.message.includes('too many requests')) {
        return { error: new Error('Too many login attempts. Please wait a moment and try again.') };
      }
      return { error: err };
    }
  };

  const signInWithGithub = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signInAsGuest = async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const GUEST_EMAIL = 'guest@neurostudy.ai';
    const GUEST_PWD = 'NeuroGuestLogin2026!';
    
    try {
      // Try to sign in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: GUEST_EMAIL,
        password: GUEST_PWD
      });

      // If user doesn't exist, create the guest account once
      if (loginError && loginError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: GUEST_EMAIL,
          password: GUEST_PWD,
          options: { data: { username: 'Guest_Explorer' } }
        });
        return { error: signUpError };
      }

      return { error: loginError };
    } catch (error: any) {
      return { error };
    }
  };

  const updateProfile = async (data: { username?: string; avatar_url?: string; phone?: string }) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: data
      });
      if (authError) throw authError;

      // 2. Sync with public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          phone: data.phone
        })
        .eq('id', user?.id);
      
      if (profileError) throw profileError;

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isGuest,
    isAdmin,
    loading,
    signUp,
    signIn,
    signInWithGithub,
    signInAsGuest,
    updateProfile,
    changePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
