import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Rocket, TrendingUp, Lightbulb, 
  ExternalLink, Loader2, RefreshCw, Star,
  Building2, DollarSign, Calendar
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GlobalTrendsProps {
  profile: CompanyProfile;
}

interface UnicornCase {
  name: string;
  country: string;
  valuation: string;
  founded: string;
  keyMoves: string[];
  lessonsLearned: string[];
}

interface GlobalTrendsData {
  industryTrends: {
    trend: string;
    impact: "high" | "medium" | "low";
    description: string;
  }[];
  topUnicorns: UnicornCase[];
  emergingTech: string[];
  investmentHotspots: string[];
  whatToDo: string[];
  whatToAvoid: string[];
}

const GlobalTrends = ({ profile }: GlobalTrendsProps) => {
  const [trendsData, setTrendsData] = useState<GlobalTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnicorn, setSelectedUnicorn] = useState<UnicornCase | null>(null);

  const fetchGlobalTrends = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-global-trends', {
        body: { 
          industry: profile.industry,
          sector: profile.sector,
          companyName: profile.name
        }
      });

      if (error) throw error;
      if (data?.success) {
        setTrendsData(data.data);
      }
    } catch (err) {
      console.error('Error fetching global trends:', err);
      toast.error('خطا در دریافت ترندهای جهانی');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">ترندهای جهانی و یونیکورن‌ها</h3>
              <p className="text-slate-400 text-sm">Global Trends & Unicorn Insights</p>
            </div>
          </div>
          <Button
            onClick={fetchGlobalTrends}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                بررسی جهانی
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {!trendsData && !isLoading ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">ترندهای جهانی صنعت {profile.industry}</p>
            <p className="text-slate-500 text-sm">و تجربیات یونیکورن‌های موفق</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400">در حال جستجوی ترندهای جهانی...</p>
            <p className="text-slate-500 text-sm mt-1">بررسی CB Insights و منابع بین‌المللی</p>
          </div>
        ) : trendsData && (
          <div className="space-y-5">
            {/* Industry Trends */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                ترندهای صنعت
              </h4>
              <div className="space-y-2">
                {trendsData.industryTrends.slice(0, 4).map((trend, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-lg border ${getImpactColor(trend.impact)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium">{trend.trend}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800">
                        تأثیر: {trend.impact === "high" ? "زیاد" : trend.impact === "low" ? "کم" : "متوسط"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{trend.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Top Unicorns */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-400" />
                یونیکورن‌های موفق در این حوزه
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {trendsData.topUnicorns.slice(0, 4).map((unicorn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedUnicorn(unicorn)}
                    className="p-3 bg-gradient-to-br from-purple-950/30 to-slate-800/50 rounded-xl border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <p className="text-white text-sm font-medium truncate">{unicorn.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>🌍 {unicorn.country}</span>
                      <span>💰 {unicorn.valuation}</span>
                    </div>
                    <p className="text-purple-400 text-xs mt-2">کلیک برای جزئیات</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emerging Tech */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                فناوری‌های نوظهور
              </h4>
              <div className="flex flex-wrap gap-2">
                {trendsData.emergingTech.map((tech, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
                <p className="text-emerald-400 text-xs font-medium mb-2">✅ انجام بده</p>
                <ul className="space-y-1">
                  {trendsData.whatToDo.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-slate-300 text-xs">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                <p className="text-red-400 text-xs font-medium mb-2">❌ اجتناب کن</p>
                <ul className="space-y-1">
                  {trendsData.whatToAvoid.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-slate-300 text-xs">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unicorn Detail Modal */}
      <AnimatePresence>
        {selectedUnicorn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 z-20"
            onClick={() => setSelectedUnicorn(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{selectedUnicorn.name}</h4>
                    <p className="text-slate-400 text-sm">{selectedUnicorn.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUnicorn(null)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{selectedUnicorn.valuation}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">تأسیس: {selectedUnicorn.founded}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-cyan-400 text-sm font-medium mb-2">🚀 اقدامات کلیدی</p>
                  <ul className="space-y-1">
                    {selectedUnicorn.keyMoves.map((move, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {move}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-2">💡 درس‌های قابل یادگیری</p>
                  <ul className="space-y-1">
                    {selectedUnicorn.lessonsLearned.map((lesson, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {lesson}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalTrends;
