import { motion } from "framer-motion";
import { Settings2, Radar, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyProfile } from "@/pages/StrategicRadar";
import MarketPosition from "./sections/MarketPosition";
import GlobalTrends from "./sections/GlobalTrends";
import TechnologyEdge from "./sections/TechnologyEdge";
import CompetitorAnatomy from "./sections/CompetitorAnatomy";
import CompetitorComparison from "./sections/CompetitorComparison";
import StrategicRecommendations from "./sections/StrategicRecommendations";
import { Link } from "react-router-dom";

interface RadarDashboardProps {
  profile: CompanyProfile;
  onEditProfile: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const RadarDashboard = ({ profile, onEditProfile, onSave, isSaving }: RadarDashboardProps) => {
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
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="border-emerald-700 text-emerald-300 hover:text-white hover:bg-emerald-800"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              ذخیره
            </Button>
          )}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Section A: Market Position */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MarketPosition profile={profile} />
        </motion.div>

        {/* Section B: Global Trends */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlobalTrends profile={profile} />
        </motion.div>

        {/* Section C: Technology Edge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TechnologyEdge profile={profile} />
        </motion.div>

        {/* Section D: Competitor Anatomy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CompetitorAnatomy profile={profile} />
        </motion.div>

        {/* Section E: Competitor Comparison & SWOT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <CompetitorComparison profile={profile} />
        </motion.div>

        {/* Section F: Strategic Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 xl:col-span-3"
        >
          <StrategicRecommendations profile={profile} />
        </motion.div>
      </div>
    </div>
  );
};

export default RadarDashboard;
