import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Credit costs for different operations
export const CREDIT_COSTS = {
  JOB_PROFILE: 5,        // مهندسی مشاغل
  SMART_AD_TEXT: 5,      // آگهی‌نویس - فقط متن
  SMART_AD_IMAGE: 20,    // آگهی‌نویس - با تصویر
  INTERVIEW_KIT: 5,      // دستیار مصاحبه
  ONBOARDING_PLAN: 5,    // معمار موفقیت ۹۰ روزه
  HR_DASHBOARD: 20,      // داشبورد HR
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;

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

  const hasEnoughCredits = (operation: CreditOperation): boolean => {
    return credits >= CREDIT_COSTS[operation];
  };

  const getCost = (operation: CreditOperation): number => {
    return CREDIT_COSTS[operation];
  };

  const deductForOperation = async (operation: CreditOperation): Promise<boolean> => {
    const cost = CREDIT_COSTS[operation];
    if (credits < cost) {
      return false;
    }
    return deductCredits(cost);
  };

  return { 
    credits, 
    loading, 
    deductCredits, 
    deductForOperation,
    hasEnoughCredits,
    getCost,
    refetch: fetchCredits 
  };
};
