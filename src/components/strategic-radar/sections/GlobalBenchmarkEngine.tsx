import { motion } from "framer-motion";
import { Globe, TrendingUp, Clock } from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

interface GlobalBenchmarkEngineProps {
  profile: CompanyProfile;
}

const globalLeaders: Record<string, { name: string; maturity: number }> = {
  "پرداخت الکترونیک": { name: "Stripe", maturity: 95 },
  "تجارت الکترونیک": { name: "Amazon", maturity: 98 },
  "فین‌تک": { name: "Square", maturity: 92 },
  default: { name: "Industry Leader", maturity: 90 },
};

const GlobalBenchmarkEngine = ({ profile }: GlobalBenchmarkEngineProps) => {
  const leader = globalLeaders[profile.industry] || globalLeaders.default;

  // Generate maturity curve data
  const maturityData = [
    { year: 2020, user: Math.max(20, profile.maturityScore - 30), leader: leader.maturity - 15 },
    { year: 2021, user: Math.max(30, profile.maturityScore - 20), leader: leader.maturity - 10 },
    { year: 2022, user: Math.max(40, profile.maturityScore - 10), leader: leader.maturity - 5 },
    { year: 2023, user: profile.maturityScore - 5, leader: leader.maturity - 2 },
    { year: 2024, user: profile.maturityScore, leader: leader.maturity },
    { year: 2025, user: null, leader: leader.maturity + 2, projected: profile.maturityScore + 8 },
    { year: 2026, user: null, leader: leader.maturity + 5, projected: profile.maturityScore + 15 },
  ];

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">موتور مقایسه جهانی</h3>
              <p className="text-slate-400 text-sm">Global Benchmark Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-mono text-sm font-bold">
              {profile.technologyLag}- سال
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={maturityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="leaderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <ReferenceLine y={profile.maturityScore} stroke="#3b82f6" strokeDasharray="5 5" />
              
              {/* Leader line */}
              <Area
                type="monotone"
                dataKey="leader"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#leaderGradient)"
                dot={{ fill: "#22d3ee", strokeWidth: 0, r: 3 }}
                name={leader.name}
              />
              
              {/* User line */}
              <Line
                type="monotone"
                dataKey="user"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, stroke: "#1e3a8a", r: 4 }}
                name={profile.name}
              />
              
              {/* Projected line */}
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                name="پیش‌بینی"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-slate-400 text-sm">{leader.name} (آینده)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-400 text-sm">{profile.name} (حال)</span>
          </div>
        </div>

        {/* Technology Lag Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-gradient-to-r from-amber-950/30 to-transparent border border-amber-800/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-300 text-sm font-medium">
                شکاف فناوری: {profile.technologyLag} سال عقب‌تر از روندهای جهانی
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                بلوغ فعلی {profile.maturityScore}% • هدف: {leader.maturity}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalBenchmarkEngine;
