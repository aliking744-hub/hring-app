import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Globe, Cpu, Users, Target, 
  ChevronRight, Sparkles, AlertTriangle, CheckCircle2,
  Loader2, RefreshCw, Building2
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MarketPositionProps {
  profile: CompanyProfile;
}

interface MarketData {
  marketRank: number;
  totalPlayers: number;
  marketShare: number;
  marketTrend: "growing" | "stable" | "declining";
  industryGrowth: number;
  competitiveIntensity: "high" | "medium" | "low";
  entryBarriers: "high" | "medium" | "low";
  marketSize: string;
  yearToYear: number;
  keyInsights: string[];
  opportunities: string[];
  threats: string[];
}

const MarketPosition = ({ profile }: MarketPositionProps) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMarketPosition = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market-position', {
        body: { 
          companyName: profile.name,
          industry: profile.industry,
          sector: profile.sector,
          competitors: profile.competitors.map(c => c.name)
        }
      });

      if (error) throw error;
      if (data?.success) {
        setMarketData(data.data);
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      toast.error('خطا در دریافت اطلاعات بازار');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "growing": return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "declining": return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <div className="w-4 h-4 rounded-full bg-yellow-400/50" />;
    }
  };

  const getIntensityColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-400 bg-red-500/20";
      case "low": return "text-emerald-400 bg-emerald-500/20";
      default: return "text-yellow-400 bg-yellow-500/20";
    }
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-emerald-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">جایگاه در بازار ایران</h3>
              <p className="text-slate-400 text-sm">Market Position Analysis</p>
            </div>
          </div>
          <Button
            onClick={fetchMarketPosition}
            disabled={isLoading}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                تحلیل جایگاه
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {!marketData && !isLoading ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">برای مشاهده جایگاه شرکت در بازار</p>
            <p className="text-slate-500 text-sm">دکمه "تحلیل جایگاه" را بزنید</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
            <p className="text-slate-400">در حال تحلیل بازار ایران...</p>
          </div>
        ) : marketData && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-white">{marketData.marketRank}</p>
                <p className="text-slate-400 text-xs">رتبه در بازار</p>
                <p className="text-slate-500 text-xs">از {marketData.totalPlayers} شرکت</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-400">{marketData.marketShare}%</p>
                <p className="text-slate-400 text-xs">سهم بازار</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getTrendIcon(marketData.marketTrend)}
                  <p className={`text-lg font-bold ${
                    marketData.yearToYear > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {marketData.yearToYear > 0 ? "+" : ""}{marketData.yearToYear}%
                  </p>
                </div>
                <p className="text-slate-400 text-xs">رشد سالانه</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl text-center">
                <p className="text-lg font-bold text-cyan-400">{marketData.marketSize}</p>
                <p className="text-slate-400 text-xs">حجم بازار</p>
              </div>
            </div>

            {/* Industry Analysis */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-800/30 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-1">رقابت</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getIntensityColor(marketData.competitiveIntensity)}`}>
                  {marketData.competitiveIntensity === "high" ? "شدید" : 
                   marketData.competitiveIntensity === "low" ? "کم" : "متوسط"}
                </span>
              </div>
              <div className="p-2 bg-slate-800/30 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-1">موانع ورود</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getIntensityColor(marketData.entryBarriers)}`}>
                  {marketData.entryBarriers === "high" ? "بالا" : 
                   marketData.entryBarriers === "low" ? "پایین" : "متوسط"}
                </span>
              </div>
              <div className="p-2 bg-slate-800/30 rounded-lg text-center">
                <p className="text-slate-400 text-xs mb-1">رشد صنعت</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  marketData.industryGrowth > 10 ? "bg-emerald-500/20 text-emerald-400" :
                  marketData.industryGrowth > 0 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {marketData.industryGrowth}%
                </span>
              </div>
            </div>

            {/* Insights */}
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                <TabsTrigger value="insights" className="text-xs">بینش‌ها</TabsTrigger>
                <TabsTrigger value="opportunities" className="text-xs">فرصت‌ها</TabsTrigger>
                <TabsTrigger value="threats" className="text-xs">تهدیدها</TabsTrigger>
              </TabsList>
              <TabsContent value="insights" className="mt-2">
                <ul className="space-y-1 max-h-24 overflow-y-auto">
                  {marketData.keyInsights.map((insight, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="opportunities" className="mt-2">
                <ul className="space-y-1 max-h-24 overflow-y-auto">
                  {marketData.opportunities.map((opp, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="threats" className="mt-2">
                <ul className="space-y-1 max-h-24 overflow-y-auto">
                  {marketData.threats.map((threat, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                      {threat}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPosition;
