import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { 
  UserContext, 
  UserType, 
  SubscriptionTier, 
  CompanyRole 
} from '@/types/multiTenant';

interface UserContextState {
  context: UserContext | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const UserContextContext = createContext<UserContextState | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserContext = async () => {
    if (!user) {
      setContext(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Check if admin
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdmin = !!adminRole;

      // Fetch company membership
      const { data: membership } = await supabase
        .from('company_members')
        .select(`
          role,
          company_id,
          companies (
            subscription_tier
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const userContext: UserContext = {
        userId: user.id,
        email: user.email ?? null,
        userType: (profile?.user_type as UserType) ?? 'individual',
        subscriptionTier: profile?.subscription_tier as SubscriptionTier ?? null,
        isAdmin,
        companyId: membership?.company_id ?? null,
        companyRole: membership?.role as CompanyRole ?? null,
        companyTier: (membership?.companies as any)?.subscription_tier as SubscriptionTier ?? null,
        credits: profile?.monthly_credits ?? 50,
        usedCredits: profile?.used_credits ?? 0,
      };

      setContext(userContext);
    } catch (error) {
      console.error('Error fetching user context:', error);
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserContext();
  }, [user]);

  return (
    <UserContextContext.Provider value={{ context, loading, refetch: fetchUserContext }}>
      {children}
    </UserContextContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContextContext);
  if (ctx === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return ctx;
};
