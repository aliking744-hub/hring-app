import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteSettings";
import RadarInputPhase from "@/components/strategic-radar/RadarInputPhase";
import VerificationPhase from "@/components/strategic-radar/VerificationPhase";
import RadarDashboard from "@/components/strategic-radar/RadarDashboard";

export interface CompanyProfile {
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

const StrategicRadar = () => {
  const siteName = useSiteName();
  const [phase, setPhase] = useState<RadarPhase>("input");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const handleScanComplete = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    setPhase("verification");
  };

  const handleVerificationComplete = (updatedProfile: CompanyProfile) => {
    setCompanyProfile(updatedProfile);
    setPhase("dashboard");
  };

  const handleBackToVerification = () => {
    setPhase("verification");
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
              <RadarInputPhase onScanComplete={handleScanComplete} />
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StrategicRadar;
