import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserContext } from './useUserContext';
import type { 
  Company, 
  CompanyMember, 
  CompanyInvite,
  CompanyRole 
} from '@/types/multiTenant';

interface UseCompanyReturn {
  company: Company | null;
  members: CompanyMember[];
  invites: CompanyInvite[];
  loading: boolean;
  isCEO: boolean;
  canInvite: boolean;
  createInvite: (role: CompanyRole, maxUses?: number, expiresIn?: number) => Promise<CompanyInvite | null>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: CompanyRole) => Promise<boolean>;
  toggleInvitePermission: (memberId: string, canInvite: boolean) => Promise<boolean>;
  deactivateInvite: (inviteId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useCompany = (): UseCompanyReturn => {
  const { context, loading: contextLoading } = useUserContext();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invites, setInvites] = useState<CompanyInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    if (!context?.companyId) {
      setCompany(null);
      setMembers([]);
      setInvites([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', context.companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData as Company);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            title,
            avatar_url
          )
        `)
        .eq('company_id', context.companyId)
        .eq('is_active', true);

      if (membersError) throw membersError;
      
      const typedMembers = (membersData || []).map(m => ({
        ...m,
        profile: m.profiles as any,
      })) as CompanyMember[];
      
      setMembers(typedMembers);

      // Fetch invites if CEO or deputy
      if (context.companyRole === 'ceo' || context.companyRole === 'deputy') {
        const { data: invitesData, error: invitesError } = await supabase
          .from('company_invites')
          .select('*')
          .eq('company_id', context.companyId)
          .eq('is_active', true);

        if (!invitesError && invitesData) {
          setInvites(invitesData as CompanyInvite[]);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contextLoading) {
      fetchCompanyData();
    }
  }, [context?.companyId, contextLoading]);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createInvite = useCallback(async (
    role: CompanyRole, 
    maxUses: number = 1, 
    expiresInDays: number = 7
  ): Promise<CompanyInvite | null> => {
    if (!context?.companyId || !context?.userId) return null;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('company_invites')
        .insert({
          company_id: context.companyId,
          invite_code: generateInviteCode(),
          role,
          max_uses: maxUses,
          expires_at: expiresAt.toISOString(),
          created_by: context.userId,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchCompanyData();
      return data as CompanyInvite;
    } catch (error) {
      console.error('Error creating invite:', error);
      return null;
    }
  }, [context?.companyId, context?.userId]);

  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchCompanyData();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  }, []);

  const updateMemberRole = useCallback(async (memberId: string, role: CompanyRole): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchCompanyData();
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }, []);

  const toggleInvitePermission = useCallback(async (memberId: string, canInvite: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ can_invite: canInvite })
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchCompanyData();
      return true;
    } catch (error) {
      console.error('Error toggling invite permission:', error);
      return false;
    }
  }, []);

  const deactivateInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_invites')
        .update({ is_active: false })
        .eq('id', inviteId);

      if (error) throw error;
      
      await fetchCompanyData();
      return true;
    } catch (error) {
      console.error('Error deactivating invite:', error);
      return false;
    }
  }, []);

  return {
    company,
    members,
    invites,
    loading: loading || contextLoading,
    isCEO: context?.companyRole === 'ceo',
    canInvite: context?.companyRole === 'ceo' || context?.companyRole === 'deputy',
    createInvite,
    removeMember,
    updateMemberRole,
    toggleInvitePermission,
    deactivateInvite,
    refetch: fetchCompanyData,
  };
};
