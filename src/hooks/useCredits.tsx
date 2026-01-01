import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Diamond costs for different AI operations
export const DIAMOND_COSTS = {
  // Simple Text Generation - 5 Diamonds
  JOB_PROFILE: 5,
  SMART_AD_TEXT: 5,
  INTERVIEW_KIT: 5,
  ONBOARDING_PLAN: 5,
  
  // Image Generation - 20 Diamonds
  SMART_AD_IMAGE: 20,
  HR_DASHBOARD: 20,
  ANALYTICS_HUB: 20,
  
  // Deep Web Search - 30 Diamonds
  HEADHUNTING: 30,
  
  // Complex Analysis - 40 Diamonds
  STRATEGIC_ANALYSIS: 40,
} as const;

// Backward compatibility
export const CREDIT_COSTS = DIAMOND_COSTS;

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
