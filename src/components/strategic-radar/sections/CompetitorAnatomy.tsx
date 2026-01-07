import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
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
} from "recharts";

interface CompetitorAnatomyProps {
  profile: CompanyProfile;
}

interface CompetitorDetail {
  name: string;
  status: "winning" | "losing" | "stable";
  reason: string;
  strengths: string[];
  weaknesses: string[];
}

const competitorDetails: Record<string, CompetitorDetail> = {
  سپ: {
    name: "سپ",
    status: "winning",
    reason: "شبکه گسترده پذیرندگان و زیرساخت قوی",
    strengths: ["سهم بازار بالا", "برند قوی", "تنوع خدمات"],
    weaknesses: ["سرعت نوآوری پایین", "هزینه‌های بالا"],
  },
  "به‌پرداخت": {
    name: "به‌پرداخت",
    status: "stable",
    reason: "تمرکز بر بازار خرده‌فروشی",
    strengths: ["قیمت رقابتی", "خدمات مشتری خوب"],
    weaknesses: ["محدودیت در فناوری", "وابستگی به بانک‌ها"],
  },
  "آسان‌پرداخت": {
    name: "آسان‌پرداخت",
    status: "losing",
    reason: "عدم تطابق با تغییرات بازار",
    strengths: ["تجربه طولانی"],
    weaknesses: ["فناوری قدیمی", "کاهش سهم بازار"],
  },
  ریتاپ: {
    name: "ریتاپ",
    status: "stable",
    reason: "تمرکز بر نوآوری و فناوری",
    strengths: ["فناوری مدرن", "تیم جوان"],
    weaknesses: ["سهم بازار محدود", "شناخت برند کم"],
  },
  باسلام: {
    name: "باسلام",
    status: "stable",
    reason: "تمرکز بر بازار روستایی",
    strengths: ["بازار منحصربه‌فرد"],
    weaknesses: ["مقیاس‌پذیری محدود"],
  },
  "اسنپ‌مارکت": {
    name: "اسنپ‌مارکت",
    status: "winning",
    reason: "اکوسیستم اسنپ و لجستیک قوی",
    strengths: ["زیرساخت لجستیک", "برند قوی"],
    weaknesses: ["هزینه‌های عملیاتی بالا"],
  },
};

const COLORS = ["#22d3ee", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

interface ChartDataItem {
  name: string;
  marketShare: number;
  innovation: number;
  size: number;
  isUser: boolean;
  color?: string;
}

const CompetitorAnatomy = ({ profile }: CompetitorAnatomyProps) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorDetail | null>(null);

  // Prepare chart data
  const chartData: ChartDataItem[] = [
    // User company
    {
      name: profile.name,
      marketShare: 100 - profile.competitors.reduce((sum, c) => sum + c.marketShare, 0),
      innovation: profile.maturityScore,
      size: 800,
      isUser: true,
    },
    // Competitors
    ...profile.competitors.map((c, i) => ({
      name: c.name,
      marketShare: c.marketShare,
      innovation: c.innovation,
      size: 500 + c.marketShare * 10,
      isUser: false,
      color: COLORS[i % COLORS.length],
    })),
  ];

  const handleBubbleClick = (data: ChartDataItem) => {
    if (!data.isUser) {
      const detail = competitorDetails[data.name] || {
        name: data.name,
        status: "stable" as const,
        reason: "اطلاعات تحلیلی این رقیب بر اساس داده‌های جمع‌آوری شده",
        strengths: [`سهم بازار ${data.marketShare}%`, `امتیاز نوآوری ${data.innovation}`],
        weaknesses: ["نیاز به تحلیل بیشتر"],
      };
      setSelectedCompetitor(detail);
    }
  };

  const handleScatterClick = (data: any) => {
    if (data && data.payload) {
      handleBubbleClick(data.payload);
    }
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-950/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">کالبدشکافی رقبا</h3>
            <p className="text-slate-400 text-sm">Competitor Anatomy</p>
          </div>
        </div>
      </div>

      {/* Bubble Chart */}
      <div className="p-4 relative">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="marketShare"
                type="number"
                domain={[0, 50]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                label={{ value: "سهم بازار %", position: "bottom", fill: "#64748b", fontSize: 10 }}
              />
              <YAxis
                dataKey="innovation"
                type="number"
                domain={[40, 100]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: "نوآوری", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }}
              />
              <ZAxis dataKey="size" range={[100, 800]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm">
                        <p className="text-white font-medium">{data.name}</p>
                        <p className="text-slate-400">سهم: {data.marketShare}%</p>
                        <p className="text-slate-400">نوآوری: {data.innovation}</p>
                        {!data.isUser && (
                          <p className="text-cyan-400 text-xs mt-1">کلیک برای جزئیات</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                data={chartData} 
                onClick={handleScatterClick}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isUser ? "#10b981" : (entry.color || COLORS[index % COLORS.length])}
                    fillOpacity={0.7}
                    stroke={entry.isUser ? "#10b981" : (entry.color || COLORS[index % COLORS.length])}
                    strokeWidth={2}
                    cursor={entry.isUser ? "default" : "pointer"}
                    onClick={() => handleBubbleClick(entry)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-400 text-sm">{profile.name} (شما)</span>
          </div>
          {profile.competitors.slice(0, 3).map((c, i) => (
            <div key={c.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-slate-400 text-sm">{c.name}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-xs mt-3">
          برای مشاهده تحلیل، روی حباب رقبا کلیک کنید
        </p>
      </div>

      {/* Competitor Detail Modal */}
      <AnimatePresence>
        {selectedCompetitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-10"
            onClick={() => setSelectedCompetitor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={selectedCompetitor.status} />
                  <div>
                    <h4 className="text-white font-bold">{selectedCompetitor.name}</h4>
                    <p className={`text-sm ${
                      selectedCompetitor.status === "winning" ? "text-emerald-400" :
                      selectedCompetitor.status === "losing" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {selectedCompetitor.status === "winning" ? "در حال پیشرفت" :
                       selectedCompetitor.status === "losing" ? "در حال عقب‌گرد" : "ثابت"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompetitor(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-300 text-sm mb-4 p-3 bg-slate-800/50 rounded-lg">
                {selectedCompetitor.reason}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
                  <p className="text-emerald-400 text-xs font-medium mb-2">نقاط قوت</p>
                  <ul className="space-y-1">
                    {selectedCompetitor.strengths.map((s, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg">
                  <p className="text-red-400 text-xs font-medium mb-2">نقاط ضعف</p>
                  <ul className="space-y-1">
                    {selectedCompetitor.weaknesses.map((w, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {w}</li>
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

const StatusIcon = ({ status }: { status: "winning" | "losing" | "stable" }) => {
  const config = {
    winning: { icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/20" },
    losing: { icon: TrendingDown, color: "text-red-400 bg-red-500/20" },
    stable: { icon: Minus, color: "text-yellow-400 bg-yellow-500/20" },
  };
  const { icon: Icon, color } = config[status];
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

export default CompetitorAnatomy;
