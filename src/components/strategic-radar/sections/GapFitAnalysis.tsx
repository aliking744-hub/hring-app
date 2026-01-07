import { motion } from "framer-motion";
import { GitBranch, ArrowUp, Zap, DollarSign, Users, Cpu } from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface GapFitAnalysisProps {
  profile: CompanyProfile;
}

interface GapStep {
  id: string;
  label: string;
  icon: React.ElementType;
  current: number;
  target: number;
  action: string;
  cost: "low" | "medium" | "high";
  priority: "high" | "medium" | "low";
}

const GapFitAnalysis = ({ profile }: GapFitAnalysisProps) => {
  const isHighCash = profile.cashLiquidity === "high" || profile.cashLiquidity === "medium";
  
  // Generate gap steps based on profile
  const gapSteps: GapStep[] = [
    {
      id: "tech",
      label: "زیرساخت فناوری",
      icon: Cpu,
      current: profile.maturityScore,
      target: 90,
      action: isHighCash ? "خرید استارتاپ فناوری" : "توسعه داخلی تدریجی",
      cost: isHighCash ? "high" : "medium",
      priority: "high",
    },
    {
      id: "market",
      label: "سهم بازار",
      icon: Users,
      current: 100 - profile.competitors.reduce((sum, c) => sum + c.marketShare, 0),
      target: 35,
      action: "گسترش شبکه توزیع",
      cost: "medium",
      priority: "high",
    },
    {
      id: "innovation",
      label: "نوآوری محصول",
      icon: Zap,
      current: Math.round(profile.maturityScore * 0.8),
      target: 85,
      action: isHighCash ? "تأسیس لابراتوار R&D" : "مشارکت با دانشگاه‌ها",
      cost: isHighCash ? "high" : "low",
      priority: "medium",
    },
    {
      id: "revenue",
      label: "درآمد",
      icon: DollarSign,
      current: 60,
      target: 100,
      action: "تنوع‌سازی خدمات",
      cost: "medium",
      priority: "medium",
    },
  ];

  const topCompetitor = profile.competitors.reduce((a, b) => 
    a.marketShare > b.marketShare ? a : b
  );

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-emerald-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">تحلیل شکاف و تطابق</h3>
              <p className="text-slate-400 text-sm">Gap & Fit Analysis</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-slate-500 text-xs">هدف: رسیدن به</p>
            <p className="text-emerald-400 font-bold">{topCompetitor.name}</p>
          </div>
        </div>
      </div>

      {/* Bridge Chart */}
      <div className="p-4 space-y-3">
        {gapSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                step.priority === "high" ? "bg-red-500/20 text-red-400" :
                step.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-slate-500/20 text-slate-400"
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{step.label}</span>
                  <span className="text-slate-400 text-xs font-mono">
                    {step.current}% → {step.target}%
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-8 bg-slate-800/50 rounded-lg overflow-hidden">
              {/* Current */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${step.current}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"
              />
              
              {/* Target marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-emerald-400"
                style={{ left: `${step.target}%` }}
              />
              
              {/* Gap indicator */}
              <div
                className="absolute top-0 h-full bg-emerald-500/20 border-r-2 border-emerald-400 border-dashed"
                style={{
                  left: `${step.current}%`,
                  width: `${Math.max(0, step.target - step.current)}%`,
                }}
              />

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-white text-xs font-mono z-10">{step.current}%</span>
                <ArrowUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Action */}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-slate-400 text-xs">
                🎯 {step.action}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                step.cost === "high" ? "bg-red-500/20 text-red-400" :
                step.cost === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-emerald-500/20 text-emerald-400"
              }`}>
                هزینه {step.cost === "high" ? "بالا" : step.cost === "medium" ? "متوسط" : "پایین"}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Cash-based Suggestion */}
        {isHighCash && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-3 bg-gradient-to-r from-emerald-950/50 to-transparent border border-emerald-800/30 rounded-xl"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
              <DollarSign className="w-4 h-4" />
              پیشنهاد ویژه (نقدینگی بالا)
            </div>
            <p className="text-slate-300 text-xs">
              با توجه به نقدینگی بالای شما، استراتژی M&A (خرید و ادغام) برای کاهش سریع شکاف توصیه می‌شود.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GapFitAnalysis;
