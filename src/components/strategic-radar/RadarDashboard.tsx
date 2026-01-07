import { motion } from "framer-motion";
import { Settings2, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyProfile } from "@/pages/StrategicRadar";
import GlobalBenchmarkEngine from "./sections/GlobalBenchmarkEngine";
import CompetitorAnatomy from "./sections/CompetitorAnatomy";
import GapFitAnalysis from "./sections/GapFitAnalysis";
import StrategyPrescription from "./sections/StrategyPrescription";
import { Link } from "react-router-dom";

interface RadarDashboardProps {
  profile: CompanyProfile;
  onEditProfile: () => void;
}

const RadarDashboard = ({ profile, onEditProfile }: RadarDashboardProps) => {
  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-colors">
              <Radar className="w-6 h-6 text-cyan-400" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              اتاق جنگ استراتژیک
              <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full font-mono">
                LIVE
              </span>
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              تحلیل {profile.name} • {profile.sector}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditProfile}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Settings2 className="w-4 h-4 ml-2" />
            ویرایش پروفایل
          </Button>
        </div>
      </motion.header>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Section A: Global Benchmark Engine */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlobalBenchmarkEngine profile={profile} />
        </motion.div>

        {/* Section B: Competitor Anatomy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CompetitorAnatomy profile={profile} />
        </motion.div>

        {/* Section C: Gap & Fit Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GapFitAnalysis profile={profile} />
        </motion.div>

        {/* Section D: Strategy Prescription */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StrategyPrescription profile={profile} />
        </motion.div>
      </div>
    </div>
  );
};

export default RadarDashboard;
