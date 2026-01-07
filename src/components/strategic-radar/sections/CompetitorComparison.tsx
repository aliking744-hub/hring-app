import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table2, Loader2, CheckCircle2, XCircle, MinusCircle, 
  TrendingUp, TrendingDown, Minus, RefreshCw, Target,
  Shield, AlertTriangle, Zap
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompetitorComparisonProps {
  profile: CompanyProfile;
}

interface CompetitorSWOT {
  name: string;
  status: "winning" | "losing" | "stable";
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketShare: number;
  innovation: number;
}

const COLORS = ["#22d3ee", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

const CompetitorComparison = ({ profile }: CompetitorComparisonProps) => {
  const [competitorData, setCompetitorData] = useState<CompetitorSWOT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("table");
  const hasAutoLoaded = useRef(false);

  // Auto-load SWOT data on mount
  useEffect(() => {
    if (!hasAutoLoaded.current && profile.competitors?.length > 0) {
      hasAutoLoaded.current = true;
      fetchAllCompetitorData();
    }
  }, [profile.competitors]);

  const fetchAllCompetitorData = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setCompetitorData([]);

    const results: CompetitorSWOT[] = [];

    for (let i = 0; i < profile.competitors.length; i++) {
      const competitor = profile.competitors[i];
      setLoadingProgress(Math.round(((i + 0.5) / profile.competitors.length) * 100));

      try {
        const { data, error } = await supabase.functions.invoke('analyze-competitor-swot', {
          body: {
            competitorName: competitor.name,
            industry: profile.industry,
            userCompanyName: profile.name
          }
        });

        if (!error && data?.success) {
          results.push({
            ...data.data,
            marketShare: competitor.marketShare,
            innovation: competitor.innovation,
          });
        } else {
          console.error('SWOT API returned error or no success:', error, data);
          // Fallback data
          results.push({
            name: competitor.name,
            status: "stable",
            strengths: ["API در حال بارگذاری - لطفاً مجدداً تلاش کنید"],
            weaknesses: ["API در حال بارگذاری - لطفاً مجدداً تلاش کنید"],
            opportunities: ["API در حال بارگذاری - لطفاً مجدداً تلاش کنید"],
            threats: ["API در حال بارگذاری - لطفاً مجدداً تلاش کنید"],
            marketShare: competitor.marketShare,
            innovation: competitor.innovation,
          });
          toast.error(`خطا در تحلیل ${competitor.name}`);
        }
      } catch (err) {
        console.error('Error fetching competitor:', err);
        results.push({
          name: competitor.name,
          status: "stable",
          strengths: ["خطا در دریافت"],
          weaknesses: ["خطا در دریافت"],
          opportunities: ["خطا در دریافت"],
          threats: ["خطا در دریافت"],
          marketShare: competitor.marketShare,
          innovation: competitor.innovation,
        });
      }

      setLoadingProgress(Math.round(((i + 1) / profile.competitors.length) * 100));
    }

    setCompetitorData(results);
    setIsLoading(false);
    toast.success(`تحلیل ${results.length} رقیب انجام شد`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "winning":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "losing":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "winning":
        return "پیشرو";
      case "losing":
        return "عقب‌مانده";
      default:
        return "ثابت";
    }
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Table2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">مقایسه و تحلیل SWOT رقبا</h3>
              <p className="text-slate-400 text-sm">Competitor Comparison & SWOT</p>
            </div>
          </div>
          <Button
            onClick={fetchAllCompetitorData}
            disabled={isLoading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                {loadingProgress}%
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                تحلیل همه رقبا
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {competitorData.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <Table2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">برای مقایسه رقبا، دکمه "تحلیل همه رقبا" را بزنید</p>
            <p className="text-slate-500 text-sm">
              تحلیل شامل نقاط قوت، ضعف، فرصت‌ها و تهدیدات هر رقیب خواهد بود
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#334155"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#6366f1"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${loadingProgress * 2.26} 226`}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-indigo-400 font-bold">
                {loadingProgress}%
              </span>
            </div>
            <p className="text-slate-400">در حال تحلیل رقبا...</p>
            <p className="text-slate-500 text-sm mt-1">جمع‌آوری اطلاعات از منابع مختلف</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-4">
              <TabsTrigger value="table" className="data-[state=active]:bg-indigo-600">
                جدول مقایسه
              </TabsTrigger>
              <TabsTrigger value="swot" className="data-[state=active]:bg-indigo-600">
                تحلیل SWOT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">رقیب</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">وضعیت</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">سهم بازار</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">نوآوری</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">قوت‌ها</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">ضعف‌ها</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorData.map((comp, i) => (
                      <motion.tr
                        key={comp.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-b border-slate-800 hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                            />
                            <span className="text-white font-medium">{comp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(comp.status)}
                            <span className={`text-xs ${
                              comp.status === "winning" ? "text-emerald-400" :
                              comp.status === "losing" ? "text-red-400" : "text-yellow-400"
                            }`}>
                              {getStatusLabel(comp.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 rounded-full"
                                style={{ width: `${comp.marketShare * 2}%` }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs">{comp.marketShare}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            comp.innovation >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                            comp.innovation >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {comp.innovation}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-emerald-400 text-xs">{comp.strengths.length}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-red-400 text-xs">{comp.weaknesses.length}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="swot" className="mt-0">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {competitorData.map((comp, i) => (
                  <motion.div
                    key={comp.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                      />
                      <h4 className="text-white font-semibold">{comp.name}</h4>
                      <div className="flex items-center gap-1 mr-auto">
                        {getStatusIcon(comp.status)}
                        <span className={`text-xs ${
                          comp.status === "winning" ? "text-emerald-400" :
                          comp.status === "losing" ? "text-red-400" : "text-yellow-400"
                        }`}>
                          {getStatusLabel(comp.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Strengths */}
                      <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <p className="text-emerald-400 text-xs font-medium">نقاط قوت (S)</p>
                        </div>
                        <ul className="space-y-1">
                          {comp.strengths.slice(0, 3).map((s, j) => (
                            <li key={j} className="text-slate-300 text-xs">• {s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 text-xs font-medium">نقاط ضعف (W)</p>
                        </div>
                        <ul className="space-y-1">
                          {comp.weaknesses.slice(0, 3).map((w, j) => (
                            <li key={j} className="text-slate-300 text-xs">• {w}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="p-3 bg-blue-950/30 border border-blue-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-400" />
                          <p className="text-blue-400 text-xs font-medium">فرصت‌ها (O)</p>
                        </div>
                        <ul className="space-y-1">
                          {comp.opportunities.slice(0, 3).map((o, j) => (
                            <li key={j} className="text-slate-300 text-xs">• {o}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="p-3 bg-orange-950/30 border border-orange-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <p className="text-orange-400 text-xs font-medium">تهدیدها (T)</p>
                        </div>
                        <ul className="space-y-1">
                          {comp.threats.slice(0, 3).map((t, j) => (
                            <li key={j} className="text-slate-300 text-xs">• {t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CompetitorComparison;
