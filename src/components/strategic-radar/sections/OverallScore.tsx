import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Zap, Shield, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface OverallScoreProps {
  profile: CompanyProfile;
}

const OverallScore = ({ profile }: OverallScoreProps) => {
  const maturity = profile.maturityScore || 50;
  const techLag = profile.technologyLag || 0;
  const competitors = profile.competitors || [];
  
  // Calculate sub-scores
  const marketScore = Math.min(100, maturity + (competitors.length > 0 ? 10 : 0));
  const techScore = Math.max(0, 100 - (techLag * 10));
  const competitiveScore = competitors.length > 0 
    ? Math.round(100 - (competitors.reduce((a, c) => a + c.marketShare, 0) / competitors.length))
    : 50;
  const innovationScore = competitors.length > 0
    ? Math.round(maturity * 0.6 + (100 - competitors[0]?.innovation || 0) * 0.4)
    : maturity;
  
  // Overall score
  const overallScore = Math.round((marketScore + techScore + competitiveScore + innovationScore) / 4);
  
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };
  
  const getScoreGradient = (score: number) => {
    if (score >= 75) return "from-emerald-500 to-cyan-500";
    if (score >= 50) return "from-amber-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getTrend = (score: number) => {
    if (score >= 60) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-amber-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const metrics = [
    { label: "موقعیت بازار", score: marketScore, icon: Target },
    { label: "فناوری", score: techScore, icon: Zap },
    { label: "رقابت‌پذیری", score: competitiveScore, icon: Shield },
    { label: "نوآوری", score: innovationScore, icon: Users },
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/50 border-indigo-500/30 p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center border border-indigo-500/30">
          <Trophy className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">امتیاز کلی</h3>
          <p className="text-xs text-slate-400">{profile.name}</p>
        </div>
      </div>

      {/* Main Score */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="relative"
        >
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(overallScore)} p-1`}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-slate-400 text-sm block">از ۱۰۰</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            {getTrend(overallScore)}
          </div>
        </motion.div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">{metric.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
                {getTrend(metric.score)}
              </div>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${getScoreGradient(metric.score)} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default OverallScore;
