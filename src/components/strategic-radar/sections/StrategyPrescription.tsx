import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Rocket, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Target } from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface StrategyPrescriptionProps {
  profile: CompanyProfile;
}

interface StrategyCard {
  id: string;
  type: "quick_win" | "aggressive" | "warning";
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  risk: "low" | "medium" | "high";
  steps?: string[];
}

const getStrategies = (profile: CompanyProfile): StrategyCard[] => {
  const isHighCash = profile.cashLiquidity === "high";
  const isMediumCash = profile.cashLiquidity === "medium";
  const isMarketLeader = profile.strategicGoal === "market_leader";
  const isIPO = profile.strategicGoal === "ipo";
  const isSurvival = profile.strategicGoal === "survival";
  
  const strategies: StrategyCard[] = [
    // Quick Win - Always present
    {
      id: "quick_win_1",
      type: "quick_win",
      title: "بهینه‌سازی ساختار قیمت‌گذاری",
      description: "بازنگری در تعرفه‌ها برای افزایش حاشیه سود بدون از دست دادن مشتری",
      impact: "افزایش ۱۵-۲۰٪ درآمد",
      timeframe: "۱-۳ ماه",
      risk: "low",
      steps: [
        "تحلیل قیمت رقبا",
        "شناسایی سرویس‌های کم‌بازده",
        "تست A/B قیمت‌گذاری جدید",
      ],
    },
  ];

  // Aggressive strategies based on cash and goals
  if (isHighCash || isMediumCash) {
    if (isMarketLeader) {
      strategies.push({
        id: "aggressive_1",
        type: "aggressive",
        title: "خرید استارتاپ لجستیک",
        description: "تقویت زنجیره تأمین با خرید یک استارتاپ فعال در حوزه لجستیک",
        impact: "کاهش ۳۰٪ هزینه توزیع",
        timeframe: "۶-۱۲ ماه",
        risk: "high",
        steps: [
          "شناسایی اهداف M&A",
          "بررسی دقیق مالی (Due Diligence)",
          "مذاکره و توافق",
          "یکپارچه‌سازی عملیات",
        ],
      });
    }
    
    if (isIPO) {
      strategies.push({
        id: "aggressive_2",
        type: "aggressive",
        title: "سرمایه‌گذاری در انطباق قانونی",
        description: "آماده‌سازی شرکت برای الزامات بورس و حسابرسی",
        impact: "آمادگی IPO در ۱۸ ماه",
        timeframe: "۱۲-۱۸ ماه",
        risk: "medium",
        steps: [
          "استخدام CFO باتجربه",
          "پیاده‌سازی ERP پیشرفته",
          "حسابرسی داخلی",
        ],
      });
    }
  }

  // Default aggressive if none added
  if (strategies.filter(s => s.type === "aggressive").length === 0) {
    strategies.push({
      id: "aggressive_default",
      type: "aggressive",
      title: "توسعه محصول جدید",
      description: "ورود به بازار مجاور با محصول نوآورانه",
      impact: "رشد ۲۵٪ پایگاه مشتری",
      timeframe: "۶-۹ ماه",
      risk: "medium",
      steps: [
        "تحقیقات بازار",
        "MVP محصول جدید",
        "تست با early adopters",
      ],
    });
  }

  // Warning strategies
  if (profile.technologyLag >= 3) {
    strategies.push({
      id: "warning_1",
      type: "warning",
      title: "توقف سرمایه‌گذاری در سخت‌افزار",
      description: "شکاف فناوری نشان‌دهنده نیاز به تمرکز بر نرم‌افزار و سرویس است",
      impact: "جلوگیری از هدررفت منابع",
      timeframe: "فوری",
      risk: "low",
      steps: [
        "ارزیابی پروژه‌های سخت‌افزاری فعلی",
        "برون‌سپاری زیرساخت",
        "تمرکز بر API و پلتفرم",
      ],
    });
  }

  if (isSurvival) {
    strategies.push({
      id: "warning_2",
      type: "warning",
      title: "کاهش هزینه‌های عملیاتی",
      description: "شناسایی و حذف هزینه‌های غیرضروری برای بقا",
      impact: "کاهش ۲۰-۳۰٪ هزینه‌ها",
      timeframe: "۱-۲ ماه",
      risk: "medium",
      steps: [
        "بررسی قراردادها",
        "بازنگری نیروی انسانی",
        "مذاکره مجدد با تأمین‌کنندگان",
      ],
    });
  }

  // Default warning if none added
  if (strategies.filter(s => s.type === "warning").length === 0) {
    strategies.push({
      id: "warning_default",
      type: "warning",
      title: "هشدار وابستگی به مشتری کلیدی",
      description: "تنوع‌سازی پایگاه مشتریان برای کاهش ریسک",
      impact: "کاهش ریسک تمرکز",
      timeframe: "۳-۶ ماه",
      risk: "medium",
    });
  }

  return strategies;
};

const StrategyPrescription = ({ profile }: StrategyPrescriptionProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const strategies = getStrategies(profile);

  const typeConfig = {
    quick_win: {
      icon: Lightbulb,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      label: "برد سریع",
    },
    aggressive: {
      icon: Rocket,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
      label: "تهاجمی",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
      label: "هشدار",
    },
  };

  const riskColors = {
    low: "bg-emerald-500/20 text-emerald-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-950/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">نسخه استراتژیک</h3>
            <p className="text-slate-400 text-sm">Strategy Prescription</p>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {strategies.map((strategy, index) => {
          const config = typeConfig[strategy.type];
          const isExpanded = expandedCard === strategy.id;

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-xl overflow-hidden ${config.bg}`}
            >
              <button
                onClick={() => setExpandedCard(isExpanded ? null : strategy.id)}
                className="w-full p-4 text-right"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <config.icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${riskColors[strategy.risk]}`}>
                        ریسک {strategy.risk === "low" ? "پایین" : strategy.risk === "medium" ? "متوسط" : "بالا"}
                      </span>
                    </div>
                    <h4 className="text-white font-medium text-sm">{strategy.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{strategy.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30 pt-3">
                      {/* Impact & Timeframe */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-500 text-xs">تأثیر</p>
                          <p className="text-white text-sm font-medium">{strategy.impact}</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-500 text-xs">زمان‌بندی</p>
                          <p className="text-white text-sm font-medium">{strategy.timeframe}</p>
                        </div>
                      </div>

                      {/* Steps */}
                      {strategy.steps && (
                        <div className="space-y-2">
                          <p className="text-slate-400 text-xs">مراحل اجرا:</p>
                          {strategy.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-slate-600" />
                              <span className="text-slate-300">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyPrescription;
