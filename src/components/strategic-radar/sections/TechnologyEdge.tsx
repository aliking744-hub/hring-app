import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Cpu, Zap, TrendingUp, AlertTriangle, 
  Loader2, RefreshCw, Lightbulb, Target,
  ArrowRight, CheckCircle2
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TechnologyEdgeProps {
  profile: CompanyProfile;
}

interface TechEdgeData {
  currentPosition: {
    score: number;
    label: string;
    description: string;
  };
  technologyGaps: {
    area: string;
    gap: "critical" | "moderate" | "minor";
    recommendation: string;
  }[];
  emergingOpportunities: {
    technology: string;
    readiness: number;
    impact: "high" | "medium" | "low";
    timeToImplement: string;
  }[];
  competitorTechStack: {
    competitor: string;
    techAdvantages: string[];
  }[];
  roadmap: {
    phase: string;
    actions: string[];
    timeline: string;
  }[];
}

const TechnologyEdge = ({ profile }: TechnologyEdgeProps) => {
  const [techData, setTechData] = useState<TechEdgeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTechEdge = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-tech-edge', {
        body: { 
          companyName: profile.name,
          industry: profile.industry,
          sector: profile.sector,
          technologyLag: profile.technologyLag,
          competitors: profile.competitors.map(c => c.name)
        }
      });

      if (error) throw error;
      if (data?.success) {
        setTechData(data.data);
      }
    } catch (err) {
      console.error('Error fetching tech edge:', err);
      toast.error('خطا در تحلیل فناوری');
    } finally {
      setIsLoading(false);
    }
  };

  const getGapColor = (gap: string) => {
    switch (gap) {
      case "critical": return "border-red-500/50 bg-red-950/30 text-red-400";
      case "minor": return "border-emerald-500/50 bg-emerald-950/30 text-emerald-400";
      default: return "border-yellow-500/50 bg-yellow-950/30 text-yellow-400";
    }
  };

  const getPositionColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-orange-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">لبه تکنولوژی</h3>
              <p className="text-slate-400 text-sm">Technology Edge Analysis</p>
            </div>
          </div>
          <Button
            onClick={fetchTechEdge}
            disabled={isLoading}
            size="sm"
            className="bg-orange-600 hover:bg-orange-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                تحلیل فناوری
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {!techData && !isLoading ? (
          <div className="text-center py-8">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">تحلیل جایگاه فناوری شرکت</p>
            <p className="text-slate-500 text-sm">و مسیر رسیدن به لبه نوآوری</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-4" />
            <p className="text-slate-400">در حال تحلیل فناوری...</p>
          </div>
        ) : techData && (
          <div className="space-y-5">
            {/* Current Position */}
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm">جایگاه فعلی فناوری</p>
                <span className={`text-2xl font-bold ${getPositionColor(techData.currentPosition.score)}`}>
                  {techData.currentPosition.score}/100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className={`h-full ${
                    techData.currentPosition.score >= 70 ? "bg-emerald-500" :
                    techData.currentPosition.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${techData.currentPosition.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-white text-sm font-medium">{techData.currentPosition.label}</p>
              <p className="text-slate-400 text-xs mt-1">{techData.currentPosition.description}</p>
            </div>

            {/* Technology Gaps */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                شکاف‌های فناوری
              </h4>
              <div className="space-y-2">
                {techData.technologyGaps.map((gap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg border ${getGapColor(gap.gap)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium">{gap.area}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50">
                        {gap.gap === "critical" ? "بحرانی" : gap.gap === "minor" ? "جزئی" : "متوسط"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{gap.recommendation}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emerging Opportunities */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                فرصت‌های نوآوری
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {techData.emergingOpportunities.slice(0, 4).map((opp, i) => (
                  <div 
                    key={i}
                    className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg"
                  >
                    <p className="text-white text-sm font-medium mb-1">{opp.technology}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${opp.readiness}%` }}
                        />
                      </div>
                      <span className="text-cyan-400 text-xs">{opp.readiness}%</span>
                    </div>
                    <p className="text-slate-500 text-xs">⏱ {opp.timeToImplement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                نقشه راه پیشنهادی
              </h4>
              <div className="space-y-3">
                {techData.roadmap.map((phase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-purple-400 text-sm font-bold">
                        {i + 1}
                      </div>
                      {i < techData.roadmap.length - 1 && (
                        <div className="w-0.5 h-full bg-purple-500/20 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium">{phase.phase}</p>
                        <span className="text-slate-500 text-xs">{phase.timeline}</span>
                      </div>
                      <ul className="space-y-1">
                        {phase.actions.map((action, j) => (
                          <li key={j} className="text-slate-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-purple-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnologyEdge;
