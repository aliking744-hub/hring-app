import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, CheckCircle2, XCircle, AlertTriangle, 
  Loader2, RefreshCw, Target, Rocket, Shield,
  ArrowUpRight, ArrowDownRight, Minus, Zap
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface StrategicRecommendationsProps {
  profile: CompanyProfile;
}

interface RecommendationData {
  overallAssessment: {
    score: number;
    verdict: string;
    summary: string;
  };
  mustDo: {
    action: string;
    reason: string;
    impact: "high" | "medium" | "low";
    urgency: "immediate" | "short-term" | "long-term";
  }[];
  mustAvoid: {
    action: string;
    reason: string;
    risk: "critical" | "high" | "medium";
  }[];
  competitorMistakes: {
    competitor: string;
    mistake: string;
    lesson: string;
  }[];
  unicornPath: {
    milestone: string;
    currentStatus: "achieved" | "in-progress" | "not-started";
    recommendation: string;
  }[];
  quickWins: string[];
}

const StrategicRecommendations = ({ profile }: StrategicRecommendationsProps) => {
  const [recData, setRecData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-strategic-recommendations', {
        body: { 
          companyName: profile.name,
          industry: profile.industry,
          sector: profile.sector,
          revenue: profile.revenue,
          technologyLag: profile.technologyLag,
          maturityScore: profile.maturityScore,
          competitors: profile.competitors,
          strategicGoal: profile.strategicGoal
        }
      });

      if (error) throw error;
      if (data?.success) {
        setRecData(data.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      toast.error('خطا در تولید توصیه‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high": return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case "low": return <Minus className="w-4 h-4 text-slate-400" />;
      default: return <ArrowUpRight className="w-4 h-4 text-yellow-400 rotate-45" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "in-progress": return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">توصیه‌های استراتژیک هوشمند</h3>
              <p className="text-slate-400 text-sm">AI-Powered Strategic Recommendations</p>
            </div>
          </div>
          <Button
            onClick={fetchRecommendations}
            disabled={isLoading}
            size="sm"
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Wand2 className="w-4 h-4 ml-2" />
                تولید توصیه‌ها
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {!recData && !isLoading ? (
          <div className="text-center py-12">
            <Wand2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">تحلیل عمیق و توصیه‌های عملیاتی</p>
            <p className="text-slate-500 text-sm">براساس بازار ایران و تجربیات جهانی</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Wand2 className="w-12 h-12 text-pink-400" />
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <p className="text-slate-400 mt-4">در حال تحلیل عمیق...</p>
            <p className="text-slate-500 text-sm mt-1">بررسی بازار ایران و جهان</p>
          </div>
        ) : recData && (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl font-bold ${
                  recData.overallAssessment.score >= 70 ? "text-emerald-400" :
                  recData.overallAssessment.score >= 40 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {recData.overallAssessment.score}
                </div>
                <div>
                  <p className="text-white font-semibold">{recData.overallAssessment.verdict}</p>
                  <p className="text-slate-400 text-sm">{recData.overallAssessment.summary}</p>
                </div>
              </div>
            </motion.div>

            {/* Must Do vs Must Avoid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Must Do */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl">
                <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  اقداماتی که باید انجام دهید
                </h4>
                <div className="space-y-3">
                  {recData.mustDo.slice(0, 4).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-white text-sm font-medium">{item.action}</p>
                        {getImpactIcon(item.impact)}
                      </div>
                      <p className="text-slate-400 text-xs">{item.reason}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                        item.urgency === "immediate" ? "bg-red-500/20 text-red-400" :
                        item.urgency === "short-term" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {item.urgency === "immediate" ? "فوری" :
                         item.urgency === "short-term" ? "کوتاه‌مدت" : "بلندمدت"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Must Avoid */}
              <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-xl">
                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  اقداماتی که باید اجتناب کنید
                </h4>
                <div className="space-y-3">
                  {recData.mustAvoid.slice(0, 4).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-white text-sm font-medium">{item.action}</p>
                        <AlertTriangle className={`w-4 h-4 ${
                          item.risk === "critical" ? "text-red-400" :
                          item.risk === "high" ? "text-orange-400" : "text-yellow-400"
                        }`} />
                      </div>
                      <p className="text-slate-400 text-xs">{item.reason}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitor Mistakes */}
            <div className="p-4 bg-orange-950/20 border border-orange-800/30 rounded-xl">
              <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                اشتباهات رقبا - درس‌های آموختنی
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recData.competitorMistakes.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-orange-300 text-xs font-medium mb-1">{item.competitor}</p>
                    <p className="text-slate-300 text-sm mb-2">❌ {item.mistake}</p>
                    <p className="text-emerald-400 text-xs">✓ درس: {item.lesson}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Unicorn Path */}
            <div className="p-4 bg-purple-950/20 border border-purple-800/30 rounded-xl">
              <h4 className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                مسیر یونیکورن شدن
              </h4>
              <div className="space-y-3">
                {recData.unicornPath.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {getStatusIcon(milestone.currentStatus)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        milestone.currentStatus === "achieved" ? "text-emerald-400" :
                        milestone.currentStatus === "in-progress" ? "text-yellow-400" :
                        "text-slate-400"
                      }`}>
                        {milestone.milestone}
                      </p>
                      <p className="text-slate-500 text-xs">{milestone.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-xl">
              <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                پیروزی‌های سریع (Quick Wins)
              </h4>
              <div className="flex flex-wrap gap-2">
                {recData.quickWins.map((win, i) => (
                  <span 
                    key={i}
                    className="px-3 py-2 bg-slate-800/50 text-slate-300 text-sm rounded-lg border border-cyan-500/20"
                  >
                    ⚡ {win}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicRecommendations;
