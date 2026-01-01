import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserContext } from './useUserContext';
import type { 
  FeaturePermission, 
  FeatureAccess, 
  SubscriptionTier,
  CompanyRole 
} from '@/types/multiTenant';

interface UseFeaturePermissionsReturn {
  permissions: FeaturePermission[];
  loading: boolean;
  checkAccess: (featureKey: string) => FeatureAccess;
  hasFeature: (featureKey: string) => boolean;
  canEdit: (featureKey: string) => boolean;
  getCreditCost: (featureKey: string) => number;
  refetch: () => Promise<void>;
}

export const useFeaturePermissions = (): UseFeaturePermissionsReturn => {
  const { context, loading: contextLoading } = useUserContext();
  const [permissions, setPermissions] = useState<FeaturePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_permissions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Type assertion for the data
      const typedData = (data || []).map(item => ({
        ...item,
        allowed_tiers: item.allowed_tiers as SubscriptionTier[],
        allowed_company_roles: item.allowed_company_roles as CompanyRole[] | null,
      })) as FeaturePermission[];
      
      setPermissions(typedData);
    } catch (error) {
      console.error('Error fetching feature permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const checkAccess = useCallback((featureKey: string): FeatureAccess => {
    if (!context) {
      return { hasAccess: false, canEdit: false, creditCost: 0, reason: 'لطفاً وارد شوید' };
    }

    // Admin has full access
    if (context.isAdmin) {
      return { hasAccess: true, canEdit: true, creditCost: 0 };
    }

    const permission = permissions.find(p => p.feature_key === featureKey);
    if (!permission) {
      return { hasAccess: false, canEdit: false, creditCost: 0, reason: 'قابلیت تعریف نشده' };
    }

    // Determine the effective tier
    const effectiveTier = context.userType === 'corporate' && context.companyTier 
      ? context.companyTier 
      : context.subscriptionTier;

    if (!effectiveTier) {
      return { hasAccess: false, canEdit: false, creditCost: permission.credit_cost, reason: 'اشتراک تعریف نشده' };
    }

    // Check if tier has access
    const tierHasAccess = permission.allowed_tiers.includes(effectiveTier);
    if (!tierHasAccess) {
      return { 
        hasAccess: false, 
        canEdit: false, 
        creditCost: permission.credit_cost, 
        reason: 'این قابلیت در پلن شما موجود نیست' 
      };
    }

    // For corporate users, also check role
    if (context.userType === 'corporate' && permission.allowed_company_roles && context.companyRole) {
      const roleHasAccess = permission.allowed_company_roles.includes(context.companyRole);
      if (!roleHasAccess) {
        return { 
          hasAccess: false, 
          canEdit: false, 
          creditCost: permission.credit_cost, 
          reason: 'نقش شما دسترسی به این قابلیت ندارد' 
        };
      }
    }

    // Check credits if needed - consider company credit pool
    let availableCredits = context.credits - context.usedCredits;
    
    // If corporate user with credit pool enabled, use company pool
    if (context.userType === 'corporate' && context.companyCreditPoolEnabled) {
      availableCredits = context.companyCreditPool;
    }
    
    if (permission.credit_cost > 0 && availableCredits < permission.credit_cost) {
      return {
        hasAccess: permission.allow_view,
        canEdit: false,
        creditCost: permission.credit_cost,
        reason: 'اعتبار کافی ندارید'
      };
    }

    return {
      hasAccess: permission.allow_view,
      canEdit: permission.allow_edit,
      creditCost: permission.credit_cost,
    };
  }, [context, permissions]);

  const hasFeature = useCallback((featureKey: string): boolean => {
    return checkAccess(featureKey).hasAccess;
  }, [checkAccess]);

  const canEdit = useCallback((featureKey: string): boolean => {
    return checkAccess(featureKey).canEdit;
  }, [checkAccess]);

  const getCreditCost = useCallback((featureKey: string): number => {
    return checkAccess(featureKey).creditCost;
  }, [checkAccess]);

  return {
    permissions,
    loading: loading || contextLoading,
    checkAccess,
    hasFeature,
    canEdit,
    getCreditCost,
    refetch: fetchPermissions,
  };
};
