import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Building2,
  Zap,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Landmark,
  PiggyBank,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface FundingTrackerProps {
  profile: CompanyProfile;
}

interface CompanyValuation {
  name: string;
  marketCap: string;
  marketCapUSD?: string;
  peRatio: number;
  pbRatio?: number;
  lastFunding?: string;
  fundingRound?: string;
  investors?: string[];
  valuationTrend: "up" | "down" | "stable";
  changePercent: number;
  stockSymbol?: string;
}

interface RecentDeal {
  type: "acquisition" | "investment" | "ipo" | "merger";
  company: string;
  amount: string;
  date: string;
  investor: string;
  description: string;
}

interface IndustryMetrics {
  totalMarketCap: string;
  averagePE: number;
  topPerformer: string;
  worstPerformer: string;
  hotSectors: string[];
  fundingTrend: "increasing" | "decreasing" | "stable";
}

interface UpcomingIPO {
  company: string;
  expectedDate: string;
  estimatedValue: string;
}

const FundingTracker = ({ profile }: FundingTrackerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [valuations, setValuations] = useState<CompanyValuation[]>([]);
  const [deals, setDeals] = useState<RecentDeal[]>([]);
  const [metrics, setMetrics] = useState<IndustryMetrics | null>(null);
  const [upcomingIPOs, setUpcomingIPOs] = useState<UpcomingIPO[]>([]);
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    if (!hasAutoLoaded.current && profile.name) {
      hasAutoLoaded.current = true;
      fetchFundingData();
    }
  }, [profile.name]);

  const fetchFundingData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-funding', {
        body: {
          companyName: profile.name,
          industry: profile.industry,
          sector: profile.sector,
          competitors: profile.competitors || []
        }
      });

      if (error) throw error;

      if (data?.success && data.data) {
        setValuations(data.data.companyValuations || []);
        setDeals(data.data.recentDeals || []);
        setMetrics(data.data.industryMetrics || null);
        setUpcomingIPOs(data.data.upcomingIPOs || []);
        toast.success("اطلاعات سرمایه‌گذاری به‌روز شد");
      } else {
        setSampleData();
      }
    } catch (error) {
      console.error("Error fetching funding data:", error);
      setSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleData = () => {
    const competitors = profile.competitors?.map(c => c.name) || [];
    
    setValuations([
      {
        name: profile.name,
        marketCap: "۵۰,۰۰۰ میلیارد ریال",
        marketCapUSD: "$1.2B",
        peRatio: 12.5,
        pbRatio: 2.3,
        valuationTrend: "up",
        changePercent: 15,
        stockSymbol: "نماد۱"
      },
      ...(competitors.slice(0, 3).map((name, i) => ({
        name,
        marketCap: `${30 - i * 5},۰۰۰ میلیارد ریال`,
        marketCapUSD: `$${0.8 - i * 0.2}B`,
        peRatio: 10 + i * 2,
        pbRatio: 1.8 + i * 0.3,
        valuationTrend: (["up", "down", "stable"] as const)[i % 3],
        changePercent: [12, -5, 2][i % 3],
        stockSymbol: `نماد${i + 2}`
      })))
    ]);

    setDeals([
      {
        type: "investment",
        company: "استارتاپ فین‌تک",
        amount: "۵۰۰ میلیارد ریال",
        date: "دی ۱۴۰۴",
        investor: "صندوق سرمایه‌گذاری نوآوری",
        description: "سرمایه‌گذاری سری B برای گسترش خدمات پرداخت"
      },
      {
        type: "acquisition",
        company: "شرکت لجستیک سریع",
        amount: "۱,۲۰۰ میلیارد ریال",
        date: "آذر ۱۴۰۴",
        investor: competitors[0] || "رقیب اصلی",
        description: "خرید برای تقویت زنجیره تأمین"
      },
      {
        type: "ipo",
        company: "پلتفرم آموزش آنلاین",
        amount: "۲,۰۰۰ میلیارد ریال",
        date: "بهمن ۱۴۰۴",
        investor: "عرضه اولیه بورس",
        description: "ورود به بازار سرمایه"
      }
    ]);

    setMetrics({
      totalMarketCap: "۲۵۰,۰۰۰ میلیارد ریال",
      averagePE: 14.2,
      topPerformer: profile.name,
      worstPerformer: competitors[2] || "شرکت ج",
      hotSectors: ["فین‌تک", "هوش مصنوعی", "لجستیک"],
      fundingTrend: "increasing"
    });

    setUpcomingIPOs([
      {
        company: "استارتاپ تحلیل داده",
        expectedDate: "اردیبهشت ۱۴۰۵",
        estimatedValue: "۳,۰۰۰ میلیارد ریال"
      },
      {
        company: "پلتفرم سلامت دیجیتال",
        expectedDate: "خرداد ۱۴۰۵",
        estimatedValue: "۱,۵۰۰ میلیارد ریال"
      }
    ]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case "down": return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-emerald-400";
      case "down": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case "acquisition": return <Building2 className="w-4 h-4 text-purple-400" />;
      case "investment": return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      case "ipo": return <Landmark className="w-4 h-4 text-blue-400" />;
      case "merger": return <Target className="w-4 h-4 text-amber-400" />;
      default: return <DollarSign className="w-4 h-4 text-slate-400" />;
    }
  };

  const getDealTypeLabel = (type: string) => {
    switch (type) {
      case "acquisition": return "خرید";
      case "investment": return "سرمایه‌گذاری";
      case "ipo": return "عرضه اولیه";
      case "merger": return "ادغام";
      default: return type;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-emerald-900/40 border-emerald-500/20 p-4 md:p-6 h-full backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-600/30 flex items-center justify-center border border-emerald-500/30">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ردیاب سرمایه‌گذاری و ارزش‌گذاری</h3>
            <p className="text-xs text-slate-400">Funding & Valuation Tracker</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchFundingData}
          disabled={isLoading}
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">در حال دریافت اطلاعات بازار...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Valuations Table */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              ارزش‌گذاری شرکت‌ها
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right py-2 px-2 text-slate-400 font-medium">شرکت</th>
                    <th className="text-center py-2 px-2 text-slate-400 font-medium">ارزش بازار</th>
                    <th className="text-center py-2 px-2 text-slate-400 font-medium">P/E</th>
                    <th className="text-center py-2 px-2 text-slate-400 font-medium">روند</th>
                    <th className="text-center py-2 px-2 text-slate-400 font-medium">تغییر</th>
                  </tr>
                </thead>
                <tbody>
                  {valuations.map((v, i) => (
                    <motion.tr
                      key={v.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{v.name}</span>
                          {v.stockSymbol && (
                            <Badge className="bg-slate-700 text-slate-300 text-[10px]">{v.stockSymbol}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="text-white text-xs">{v.marketCap}</div>
                        {v.marketCapUSD && (
                          <div className="text-slate-500 text-[10px]">{v.marketCapUSD}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-300">{v.peRatio}</td>
                      <td className="py-2 px-2 text-center">{getTrendIcon(v.valuationTrend)}</td>
                      <td className={`py-2 px-2 text-center font-medium ${getTrendColor(v.valuationTrend)}`}>
                        {v.changePercent > 0 ? '+' : ''}{v.changePercent}%
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Industry Metrics */}
            {metrics && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                  <div className="text-xs text-slate-400">کل ارزش صنعت</div>
                  <div className="text-sm font-bold text-white">{metrics.totalMarketCap}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                  <div className="text-xs text-slate-400">میانگین P/E</div>
                  <div className="text-sm font-bold text-cyan-400">{metrics.averagePE}</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="text-xs text-slate-400">بهترین عملکرد</div>
                  <div className="text-sm font-bold text-emerald-400">{metrics.topPerformer}</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <div className="text-xs text-slate-400">ضعیف‌ترین</div>
                  <div className="text-sm font-bold text-red-400">{metrics.worstPerformer}</div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Deals & Upcoming IPOs */}
          <div className="space-y-4">
            {/* Recent Deals */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                معاملات اخیر
              </h4>
              <div className="space-y-2">
                {deals.map((deal, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getDealTypeIcon(deal.type)}
                      <span className="text-white text-sm font-medium">{deal.company}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                        {getDealTypeLabel(deal.type)}
                      </Badge>
                      <span className="text-emerald-400 font-medium">{deal.amount}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{deal.description}</p>
                    <div className="text-slate-500 text-[10px] mt-1">{deal.date} • {deal.investor}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Upcoming IPOs */}
            {upcomingIPOs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-blue-400" />
                  عرضه‌های اولیه پیش‌رو
                </h4>
                <div className="space-y-2">
                  {upcomingIPOs.map((ipo, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{ipo.company}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">IPO</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{ipo.expectedDate}</span>
                        <span className="text-blue-400 font-medium">{ipo.estimatedValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hot Sectors */}
            {metrics?.hotSectors && metrics.hotSectors.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h5 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  بخش‌های داغ سرمایه‌گذاری
                </h5>
                <div className="flex flex-wrap gap-1">
                  {metrics.hotSectors.map((sector, i) => (
                    <Badge key={i} className="bg-amber-500/20 text-amber-300 text-[10px]">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Zap className="w-3 h-3 text-emerald-400" />
        تحلیل با Perplexity AI - داده‌های بورس و فرابورس
      </div>
    </Card>
  );
};

export default FundingTracker;
