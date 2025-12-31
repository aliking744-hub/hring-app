import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type CompassRole = 'ceo' | 'deputy' | 'manager';

interface CompassUserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  title: string | null;
}

interface CompassAuthContextType {
  user: User | null;
  session: Session | null;
  profile: CompassUserProfile | null;
  role: CompassRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isCeo: boolean;
  isDeputy: boolean;
  isManager: boolean;
}

const CompassAuthContext = createContext<CompassAuthContextType | undefined>(undefined);

export const useCompassAuth = () => {
  const context = useContext(CompassAuthContext);
  if (!context) {
    throw new Error('useCompassAuth must be used within a CompassAuthProvider');
  }
  return context;
};

export const CompassAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CompassUserProfile | null>(null);
  const [role, setRole] = useState<CompassRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, title')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch compass role
      const { data: roleData } = await supabase
        .from('compass_user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData) {
        setRole(roleData.role as CompassRole);
      }
    } catch (error) {
      console.error('Error fetching compass user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const value = {
    user,
    session,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    isCeo: role === 'ceo',
    isDeputy: role === 'deputy',
    isManager: role === 'manager',
  };

  return <CompassAuthContext.Provider value={value}>{children}</CompassAuthContext.Provider>;
};
