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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from "recharts";
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

type TimeFilter = "3m" | "6m" | "1y";

interface HistoricalDataPoint {
  month: string;
  [key: string]: number | string;
}

const FundingTracker = ({ profile }: FundingTrackerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [valuations, setValuations] = useState<CompanyValuation[]>([]);
  const [deals, setDeals] = useState<RecentDeal[]>([]);
  const [metrics, setMetrics] = useState<IndustryMetrics | null>(null);
  const [upcomingIPOs, setUpcomingIPOs] = useState<UpcomingIPO[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("6m");
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
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
          competitors: profile.competitors || [],
          timeFilter
        }
      });

      if (error) throw error;

      if (data?.success && data.data) {
        setValuations(data.data.companyValuations || []);
        setDeals(data.data.recentDeals || []);
        setMetrics(data.data.industryMetrics || null);
        setUpcomingIPOs(data.data.upcomingIPOs || []);
        generateHistoricalData(data.data.companyValuations || []);
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

  const generateHistoricalData = (vals: CompanyValuation[]) => {
    const months = timeFilter === "3m" ? 3 : timeFilter === "6m" ? 6 : 12;
    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", 
                        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    const currentMonth = 9; // دی
    
    const data: HistoricalDataPoint[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const point: HistoricalDataPoint = { month: monthNames[monthIdx] };
      
      vals.slice(0, 4).forEach((v, idx) => {
        const baseValue = parseFloat(v.marketCap.replace(/[^\d.]/g, '')) / 10 || (50 - idx * 10);
        const randomVariation = 1 + (Math.random() - 0.5) * 0.3;
        const trend = v.valuationTrend === "up" ? 1 + (months - i) * 0.02 : 
                      v.valuationTrend === "down" ? 1 - (months - i) * 0.015 : 1;
        point[v.name] = Math.round(baseValue * randomVariation * trend);
      });
      
      data.push(point);
    }
    setHistoricalData(data);
  };

  const setSampleData = () => {
    const competitors = profile.competitors?.map(c => c.name) || [];
    
    const sampleValuations = [
      {
        name: profile.name,
        marketCap: "۵۰,۰۰۰ میلیارد ریال",
        marketCapUSD: "$1.2B",
        peRatio: 12.5,
        pbRatio: 2.3,
        valuationTrend: "up" as const,
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
    ];

    setValuations(sampleValuations);
    generateHistoricalData(sampleValuations);

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

      {/* Time Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-400 text-sm">بازه زمانی:</span>
        {(["3m", "6m", "1y"] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              timeFilter === filter
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50"
            }`}
          >
            {filter === "3m" ? "۳ ماهه" : filter === "6m" ? "۶ ماهه" : "سالانه"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">در حال دریافت اطلاعات بازار...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Historical Line Chart */}
          {historicalData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                روند تاریخی ارزش‌گذاری (میلیارد تومان)
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                    formatter={(value: number) => [`${value} میلیارد تومان`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {valuations.slice(0, 4).map((v, i) => (
                    <Line
                      key={v.name}
                      type="monotone"
                      dataKey={v.name}
                      stroke={['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b'][i]}
                      strokeWidth={2}
                      dot={{ fill: ['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b'][i], strokeWidth: 2 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Interactive Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart - Market Cap Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                مقایسه ارزش بازار (میلیارد تومان)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={valuations.map(v => ({
                  name: v.name.substring(0, 12),
                  value: parseFloat(v.marketCap.replace(/[^\d.]/g, '')) / 10 || 50,
                  change: v.changePercent
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                    formatter={(value: number) => [`${value} میلیارد تومان`, 'ارزش بازار']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {valuations.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.valuationTrend === 'up' ? '#10b981' : entry.valuationTrend === 'down' ? '#ef4444' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Radar Chart - P/E & P/B Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                مقایسه نسبت‌های ارزش‌گذاری
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={valuations.map(v => ({
                  company: v.name.substring(0, 8),
                  PE: v.peRatio,
                  PB: v.pbRatio || v.peRatio * 0.2,
                  growth: Math.abs(v.changePercent)
                }))}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis 
                    dataKey="company" 
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 'auto']} 
                    tick={{ fill: '#64748b', fontSize: 8 }}
                  />
                  <Radar 
                    name="P/E" 
                    dataKey="PE" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                  />
                  <Radar 
                    name="P/B" 
                    dataKey="PB" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.3}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart - Market Share */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                سهم از کل ارزش بازار صنعت
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={valuations.map((v, i) => ({
                      name: v.name,
                      value: parseFloat(v.marketCap.replace(/[^\d.]/g, '')) / 10 || (50 - i * 10)
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 6)} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                  >
                    {valuations.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                    formatter={(value: number) => [`${value} میلیارد تومان`, 'ارزش']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Change Percent Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                تغییرات ارزش‌گذاری (درصد)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  data={valuations.map(v => ({
                    name: v.name.substring(0, 10),
                    change: v.changePercent
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                    formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'تغییر']}
                  />
                  <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                    {valuations.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.changePercent > 0 ? '#10b981' : entry.changePercent < 0 ? '#ef4444' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Valuations Table & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                جدول ارزش‌گذاری شرکت‌ها
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right py-2 px-2 text-slate-400 font-medium">شرکت</th>
                      <th className="text-center py-2 px-2 text-slate-400 font-medium">ارزش بازار</th>
                      <th className="text-center py-2 px-2 text-slate-400 font-medium">P/E</th>
                      <th className="text-center py-2 px-2 text-slate-400 font-medium">P/B</th>
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
                        <td className="py-2 px-2 text-center text-cyan-400">{v.pbRatio || '-'}</td>
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
