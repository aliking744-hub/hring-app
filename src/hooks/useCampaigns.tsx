import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Campaign {
  id: string;
  name: string;
  city: string | null;
  status: string;
  progress: number;
  job_title: string | null;
  industry: string | null;
  experience_range: string | null;
  education_level: string | null;
  skills: string[] | null;
  auto_headhunting: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  candidatesCount?: number;
  avgMatchScore?: number;
  source?: string;
  lastUpdated?: string;
}

export interface Candidate {
  id: string;
  campaign_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string | null;
  experience: string | null;
  education: string | null;
  last_company: string | null;
  location: string | null;
  title: string | null;
  match_score: number;
  candidate_temperature: string;
  recommendation: string | null;
  green_flags: string[] | null;
  red_flags: string[] | null;
  layer_scores: any;
  raw_data: any;
  created_at: string;
}
  green_flags: string[] | null;
  red_flags: string[] | null;
  layer_scores: Record<string, number> | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export const useCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch campaigns with candidate counts
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch candidate counts for each campaign
      const campaignIds = campaignsData?.map((c) => c.id) || [];
      
      if (campaignIds.length > 0) {
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("campaign_id, match_score")
          .in("campaign_id", campaignIds);

        if (candidatesError) throw candidatesError;

        // Calculate counts and averages
        const countMap: Record<string, { count: number; totalScore: number }> = {};
        candidatesData?.forEach((c) => {
          if (!countMap[c.campaign_id]) {
            countMap[c.campaign_id] = { count: 0, totalScore: 0 };
          }
          countMap[c.campaign_id].count++;
          countMap[c.campaign_id].totalScore += c.match_score || 0;
        });

        const enrichedCampaigns = campaignsData?.map((campaign) => {
          const stats = countMap[campaign.id] || { count: 0, totalScore: 0 };
          return {
            ...campaign,
            candidatesCount: stats.count,
            avgMatchScore: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
            source: campaign.auto_headhunting ? "auto" : "excel",
            lastUpdated: formatDate(campaign.updated_at),
          };
        });

        setCampaigns(enrichedCampaigns || []);
      } else {
        setCampaigns([]);
      }
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (campaignData: {
    name: string;
    city: string;
    job_title?: string;
    industry?: string;
    experience_range?: string;
    education_level?: string;
    skills?: string[];
    auto_headhunting?: boolean;
  }) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        name: campaignData.name,
        city: campaignData.city,
        job_title: campaignData.job_title || null,
        industry: campaignData.industry || null,
        experience_range: campaignData.experience_range || null,
        education_level: campaignData.education_level || null,
        skills: campaignData.skills || null,
        auto_headhunting: campaignData.auto_headhunting || false,
        status: "processing",
        progress: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCampaign = async (
    campaignId: string,
    updates: Partial<Campaign>
  ) => {
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", campaignId)
      .select()
      .single();

    if (error) throw error;
    
    // Refresh campaigns list
    await fetchCampaigns();
    return data;
  };

  const deleteCampaign = async (campaignId: string) => {
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) throw error;
    
    // Refresh campaigns list
    await fetchCampaigns();
  };

  const addCandidates = async (
    campaignId: string,
    candidates: Array<{
      name?: string;
      email?: string;
      phone?: string;
      skills?: string;
      experience?: string;
      education?: string;
      last_company?: string;
      location?: string;
      title?: string;
      match_score?: number;
      candidate_temperature?: string;
      recommendation?: string;
      green_flags?: string[];
      red_flags?: string[];
      layer_scores?: Record<string, number>;
      raw_data?: Record<string, unknown>;
    }>
  ) => {
    const candidatesWithCampaignId = candidates.map((c) => ({
      campaign_id: campaignId,
      name: c.name || null,
      email: c.email || null,
      phone: c.phone || null,
      skills: c.skills || null,
      experience: c.experience || null,
      education: c.education || null,
      last_company: c.last_company || null,
      location: c.location || null,
      title: c.title || null,
      match_score: c.match_score || 0,
      candidate_temperature: c.candidate_temperature || "cold",
      recommendation: c.recommendation || null,
      green_flags: c.green_flags || null,
      red_flags: c.red_flags || null,
      layer_scores: c.layer_scores || null,
      raw_data: c.raw_data || null,
    }));

    const { data, error } = await supabase
      .from("candidates")
      .insert(candidatesWithCampaignId)
      .select();

    if (error) throw error;
    return data;
  };

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addCandidates,
  };
};

export const useCampaignDetail = (campaignId: string | undefined) => {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if (!user || !campaignId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch campaign
        const { data: campaignData, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .maybeSingle();

        if (campaignError) throw campaignError;

        if (!campaignData) {
          setError("کمپین پیدا نشد");
          setLoading(false);
          return;
        }

        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("match_score", { ascending: false });

        if (candidatesError) throw candidatesError;

        setCampaign(campaignData);
        setCandidates(candidatesData || []);
      } catch (err: any) {
        console.error("Error fetching campaign detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetail();
  }, [user, campaignId]);

  // Calculate stats from candidates
  const stats = {
    total: candidates.length,
    excellent: candidates.filter((c) => c.match_score >= 85).length,
    good: candidates.filter((c) => c.match_score >= 70 && c.match_score < 85).length,
    average: candidates.filter((c) => c.match_score < 70).length,
    avgScore: candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
      : 0,
    hotCandidates: candidates.filter((c) => c.candidate_temperature === "hot").length,
    warmCandidates: candidates.filter((c) => c.candidate_temperature === "warm").length,
    coldCandidates: candidates.filter((c) => c.candidate_temperature === "cold").length,
  };

  return {
    campaign,
    candidates,
    stats,
    loading,
    error,
  };
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "همین الان";
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return date.toLocaleDateString("fa-IR");
}
