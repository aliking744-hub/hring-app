import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCredits = async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_credits');
      
      if (error) throw error;
      setCredits(data ?? 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const deductCredits = async (amount: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('deduct_credits', { amount });
      
      if (error) throw error;
      
      if (data) {
        await fetchCredits(); // Refresh credits after deduction
      }
      
      return data ?? false;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  };

  return { credits, loading, deductCredits, refetch: fetchCredits };
};
