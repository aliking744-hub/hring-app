import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Sparkles, AlertTriangle, CheckCircle2,
  Loader2, RefreshCw, Building2, Target, Grid3X3
} from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ReferenceArea,
  Legend
} from "recharts";

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

interface QuadrantPlayer {
  name: string;
  marketStrength: number; // 0-100, X-axis
  industryAdoption: number; // 0-100, Y-axis
  category: "fintech" | "payment" | "ai" | "ecommerce" | "logistics" | "other";
  isUser: boolean;
  size: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  fintech: "#f97316",
  payment: "#3b82f6",
  ai: "#8b5cf6",
  ecommerce: "#10b981",
  logistics: "#06b6d4",
  other: "#64748b"
};

const CATEGORY_LABELS: Record<string, string> = {
  fintech: "فین‌تک",
  payment: "پرداخت",
  ai: "هوش مصنوعی",
  ecommerce: "تجارت الکترونیک",
  logistics: "لجستیک",
  other: "سایر"
};

const MarketPosition = ({ profile }: MarketPositionProps) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quadrantData, setQuadrantData] = useState<QuadrantPlayer[]>([]);
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    if (!hasAutoLoaded.current && profile.name) {
      hasAutoLoaded.current = true;
      fetchMarketPosition();
    }
  }, [profile.name]);

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
        generateQuadrantData();
      } else {
        setDefaultQuadrantData();
      }
    } catch (err) {
      console.error('Error fetching market position:', err);
      setDefaultQuadrantData();
      toast.error('خطا در دریافت اطلاعات بازار');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuadrantData = () => {
    // Generate quadrant data based on profile and competitors
    const players: QuadrantPlayer[] = [
      // User company
      {
        name: profile.name,
        marketStrength: 65 + Math.random() * 20,
        industryAdoption: 70 + Math.random() * 20,
        category: "fintech",
        isUser: true,
        size: 800
      },
      // Competitors in different categories
      ...profile.competitors.slice(0, 3).map((c, i) => ({
        name: c.name,
        marketStrength: 40 + Math.random() * 40,
        industryAdoption: 35 + Math.random() * 50,
        category: (["payment", "ai", "ecommerce"] as const)[i % 3],
        isUser: false,
        size: 400 + c.marketShare * 15
      })),
      // Additional market players for context
      { name: "آسان پرداخت", marketStrength: 75, industryAdoption: 85, category: "payment", isUser: false, size: 500 },
      { name: "زرین‌پال", marketStrength: 65, industryAdoption: 80, category: "payment", isUser: false, size: 450 },
      { name: "اسنپ پی", marketStrength: 80, industryAdoption: 75, category: "fintech", isUser: false, size: 600 },
      { name: "دیجی‌کالا", marketStrength: 85, industryAdoption: 90, category: "ecommerce", isUser: false, size: 700 },
      { name: "ترب", marketStrength: 55, industryAdoption: 60, category: "ecommerce", isUser: false, size: 350 },
      { name: "پارسیان AI", marketStrength: 35, industryAdoption: 45, category: "ai", isUser: false, size: 300 },
      { name: "هوشمند ایران", marketStrength: 25, industryAdoption: 55, category: "ai", isUser: false, size: 280 },
      { name: "تیپاکس", marketStrength: 70, industryAdoption: 65, category: "logistics", isUser: false, size: 450 },
      { name: "الوپیک", marketStrength: 45, industryAdoption: 50, category: "logistics", isUser: false, size: 320 },
      { name: "ماهکس", marketStrength: 30, industryAdoption: 35, category: "logistics", isUser: false, size: 250 },
      { name: "رباتیک نوین", marketStrength: 20, industryAdoption: 25, category: "ai", isUser: false, size: 200 },
    ];
    setQuadrantData(players);
  };

  const setDefaultQuadrantData = () => {
    generateQuadrantData();
    setMarketData({
      marketRank: 5,
      totalPlayers: 20,
      marketShare: 15,
      marketTrend: "growing",
      industryGrowth: 12,
      competitiveIntensity: "high",
      entryBarriers: "medium",
      marketSize: "۵۰,۰۰۰ میلیارد ریال",
      yearToYear: 18,
      keyInsights: ["بازار در حال رشد سریع است", "رقابت شدید در بخش پرداخت"],
      opportunities: ["گسترش به بازارهای جدید", "همکاری با استارتاپ‌ها"],
      threats: ["ورود رقبای جدید", "تغییرات قانونی"]
    });
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as QuadrantPlayer;
      const quadrant = getQuadrant(data.marketStrength, data.industryAdoption);
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
          <p className="text-white font-bold mb-1">{data.name}</p>
          <p className="text-slate-400 text-xs mb-2">{CATEGORY_LABELS[data.category]}</p>
          <div className="space-y-1 text-xs">
            <p className="text-cyan-400">قدرت بازار: {Math.round(data.marketStrength)}%</p>
            <p className="text-purple-400">پذیرش صنعت: {Math.round(data.industryAdoption)}%</p>
          </div>
          <div className={`mt-2 text-xs px-2 py-1 rounded ${quadrant.color}`}>
            {quadrant.label}
          </div>
        </div>
      );
    }
    return null;
  };

  const getQuadrant = (x: number, y: number) => {
    if (x >= 50 && y >= 50) return { label: "ضروری (Necessary)", color: "bg-emerald-500/30 text-emerald-300" };
    if (x < 50 && y >= 50) return { label: "گذرا (Transitory)", color: "bg-amber-500/30 text-amber-300" };
    if (x >= 50 && y < 50) return { label: "تهدیدکننده (Threatening)", color: "bg-red-500/30 text-red-300" };
    return { label: "آزمایشی (Experimental)", color: "bg-blue-500/30 text-blue-300" };
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-emerald-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">نقشه جایگاه بازار (NExTT)</h3>
              <p className="text-slate-400 text-sm">Market Position Matrix</p>
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
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
            <p className="text-slate-400">در حال تحلیل بازار ایران...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 4-Quadrant Chart - CB Insights Style */}
            <div className="relative">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    {/* Quadrant Background Areas */}
                    <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#f59e0b" fillOpacity={0.08} />
                    <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#10b981" fillOpacity={0.08} />
                    <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#3b82f6" fillOpacity={0.08} />
                    <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#ef4444" fillOpacity={0.08} />
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    
                    {/* Center lines */}
                    <ReferenceLine x={50} stroke="#64748b" strokeDasharray="5 5" />
                    <ReferenceLine y={50} stroke="#64748b" strokeDasharray="5 5" />
                    
                    <XAxis
                      type="number"
                      dataKey="marketStrength"
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={false}
                      label={{ 
                        value: 'قدرت بازار (Market Strength)', 
                        position: 'bottom', 
                        fill: '#64748b', 
                        fontSize: 11,
                        offset: 15
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="industryAdoption"
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={false}
                      label={{ 
                        value: 'پذیرش صنعت (Industry Adoption)', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#64748b', 
                        fontSize: 11,
                        offset: 10
                      }}
                    />
                    <ZAxis dataKey="size" range={[100, 800]} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Scatter data={quadrantData}>
                      {quadrantData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.isUser ? "#10b981" : CATEGORY_COLORS[entry.category]}
                          fillOpacity={entry.isUser ? 1 : 0.7}
                          stroke={entry.isUser ? "#fff" : CATEGORY_COLORS[entry.category]}
                          strokeWidth={entry.isUser ? 3 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Quadrant Labels */}
              <div className="absolute top-6 left-12 text-amber-400 text-[10px] font-medium opacity-70">گذرا (TRANSITORY)</div>
              <div className="absolute top-6 right-8 text-emerald-400 text-[10px] font-medium opacity-70">ضروری (NECESSARY)</div>
              <div className="absolute bottom-14 left-12 text-blue-400 text-[10px] font-medium opacity-70">آزمایشی (EXPERIMENTAL)</div>
              <div className="absolute bottom-14 right-8 text-red-400 text-[10px] font-medium opacity-70">تهدیدکننده (THREATENING)</div>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[key] }}
                  />
                  <span className="text-slate-400 text-xs">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                <span className="text-emerald-400 text-xs font-medium">شما</span>
              </div>
            </div>

            {/* Key Metrics */}
            {marketData && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-800/50 rounded-xl text-center">
                    <p className="text-xl font-bold text-white">{marketData.marketRank}</p>
                    <p className="text-slate-400 text-[10px]">رتبه از {marketData.totalPlayers}</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded-xl text-center">
                    <p className="text-xl font-bold text-emerald-400">{marketData.marketShare}%</p>
                    <p className="text-slate-400 text-[10px]">سهم بازار</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded-xl text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(marketData.marketTrend)}
                      <p className={`text-lg font-bold ${
                        marketData.yearToYear > 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {marketData.yearToYear > 0 ? "+" : ""}{marketData.yearToYear}%
                      </p>
                    </div>
                    <p className="text-slate-400 text-[10px]">رشد سالانه</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded-xl text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getIntensityColor(marketData.competitiveIntensity)}`}>
                      {marketData.competitiveIntensity === "high" ? "شدید" : 
                       marketData.competitiveIntensity === "low" ? "کم" : "متوسط"}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-1">رقابت</p>
                  </div>
                </div>

                {/* Insights Tabs */}
                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                    <TabsTrigger value="insights" className="text-xs">بینش‌ها</TabsTrigger>
                    <TabsTrigger value="opportunities" className="text-xs">فرصت‌ها</TabsTrigger>
                    <TabsTrigger value="threats" className="text-xs">تهدیدها</TabsTrigger>
                  </TabsList>
                  <TabsContent value="insights" className="mt-2">
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                      {marketData.keyInsights.map((insight, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="opportunities" className="mt-2">
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                      {marketData.opportunities.map((opp, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="threats" className="mt-2">
                    <ul className="space-y-1 max-h-20 overflow-y-auto">
                      {marketData.threats.map((threat, i) => (
                        <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPosition;