import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import RadarInputPhase from "@/components/strategic-radar/RadarInputPhase";
import VerificationPhase from "@/components/strategic-radar/VerificationPhase";
import RadarDashboard from "@/components/strategic-radar/RadarDashboard";


export interface CompanyProfile {
  id?: string;
  name: string;
  ticker: string;
  logo: string;
  industry: string;
  sector: string;
  competitors: { name: string; marketShare: number; innovation: number }[];
  revenue: string;
  revenueValue: number;
  // User-provided data
  cashLiquidity?: string;
  strategicGoal?: string;
  // Derived metrics
  technologyLag: number;
  maturityScore: number;
}

export type RadarPhase = "input" | "verification" | "dashboard";

interface StoredAnalysis {
  id: string;
  user_id: string;
  company_name: string;
  company_ticker: string | null;
  company_logo: string | null;
  industry: string | null;
  sector: string | null;
  competitors: { name: string; marketShare: number; innovation: number }[];
  revenue: string | null;
  revenue_value: number | null;
  cash_liquidity: string | null;
  strategic_goal: string | null;
  technology_lag: number;
  maturity_score: number;
  created_at: string;
  updated_at: string;
}

const StrategicRadar = () => {
  const siteName = useSiteName();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<RadarPhase>("input");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch saved analyses
  const { data: savedAnalyses, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["strategic-radar-analyses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("strategic_radar_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as StoredAnalysis[];
    },
    enabled: !!user?.id,
  });

  // Save analysis mutation
  const saveAnalysisMutation = useMutation({
    mutationFn: async (profile: CompanyProfile) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const analysisData = {
        user_id: user.id,
        company_name: profile.name,
        company_ticker: profile.ticker,
        company_logo: profile.logo,
        industry: profile.industry,
        sector: profile.sector,
        competitors: profile.competitors,
        revenue: profile.revenue,
        revenue_value: profile.revenueValue,
        cash_liquidity: profile.cashLiquidity || null,
        strategic_goal: profile.strategicGoal || null,
        technology_lag: profile.technologyLag,
        maturity_score: profile.maturityScore,
      };

      if (profile.id) {
        // Update existing
        const { data, error } = await supabase
          .from("strategic_radar_analyses")
          .update({ ...analysisData, updated_at: new Date().toISOString() })
          .eq("id", profile.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("strategic_radar_analyses")
          .insert(analysisData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["strategic-radar-analyses"] });
      toast.success("تحلیل با موفقیت ذخیره شد");
      if (companyProfile) {
        setCompanyProfile({ ...companyProfile, id: data.id });
      }
    },
    onError: (error) => {
      toast.error("خطا در ذخیره تحلیل");
      console.error(error);
    },
  });

  // Delete analysis mutation
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("strategic_radar_analyses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-radar-analyses"] });
      toast.success("تحلیل حذف شد");
    },
    onError: () => {
      toast.error("خطا در حذف تحلیل");
    },
  });

  const handleScanComplete = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    setPhase("verification");
  };

  const handleVerificationComplete = (updatedProfile: CompanyProfile) => {
    setCompanyProfile(updatedProfile);
    setPhase("dashboard");
    // Auto-save when entering dashboard
    saveAnalysisMutation.mutate(updatedProfile);
  };

  const handleBackToVerification = () => {
    setPhase("verification");
  };

  const handleLoadAnalysis = (analysis: StoredAnalysis) => {
    const profile: CompanyProfile = {
      id: analysis.id,
      name: analysis.company_name,
      ticker: analysis.company_ticker || "",
      logo: analysis.company_logo || "🏢",
      industry: analysis.industry || "",
      sector: analysis.sector || "",
      competitors: analysis.competitors || [],
      revenue: analysis.revenue || "",
      revenueValue: analysis.revenue_value || 0,
      cashLiquidity: analysis.cash_liquidity || undefined,
      strategicGoal: analysis.strategic_goal || undefined,
      technologyLag: analysis.technology_lag,
      maturityScore: analysis.maturity_score,
    };
    setCompanyProfile(profile);
    setPhase("dashboard");
    setShowHistory(false);
  };

  return (
    <>
      <Helmet>
        <title>رادار اطلاعات استراتژیک | {siteName}</title>
        <meta name="description" content="رادار هوشمند تحلیل استراتژیک رقبا و بازار" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1a] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0a0f1a] to-[#0d1321]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <RadarInputPhase 
                onScanComplete={handleScanComplete}
                savedAnalyses={savedAnalyses || []}
                isLoadingHistory={isLoadingHistory}
                onLoadAnalysis={handleLoadAnalysis}
                onDeleteAnalysis={(id) => deleteAnalysisMutation.mutate(id)}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
              />
            </motion.div>
          )}

          {phase === "verification" && companyProfile && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <VerificationPhase
                profile={companyProfile}
                onComplete={handleVerificationComplete}
                onBack={() => setPhase("input")}
              />
            </motion.div>
          )}

          {phase === "dashboard" && companyProfile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative z-10"
            >
              <RadarDashboard
                profile={companyProfile}
                onEditProfile={handleBackToVerification}
                onSave={() => saveAnalysisMutation.mutate(companyProfile)}
                isSaving={saveAnalysisMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StrategicRadar;
