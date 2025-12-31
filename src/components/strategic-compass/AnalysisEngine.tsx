import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Gauge,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Flame,
  ThermometerSun
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

const AnalysisEngine = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    // In non-demo mode without data, show empty state
    setIsLoading(false);
  }, [isDemoMode]);

  // Mock analysis data
  const executionLoyaltyData = [
    { name: "معاون مالی", score: 92, color: "#22c55e" },
    { name: "معاون فروش", score: 75, color: "#eab308" },
    { name: "معاون منابع انسانی", score: 58, color: "#f97316" },
    { name: "معاون فنی", score: 88, color: "#22c55e" },
    { name: "معاون بازرگانی", score: 45, color: "#ef4444" },
  ];

  const frictionIndexData = [
    { name: "معاون مالی", friction: 1.2, label: "کارآمد" },
    { name: "معاون فروش", friction: 2.8, label: "متوسط" },
    { name: "معاون منابع انسانی", friction: 4.5, label: "پرهزینه" },
    { name: "معاون فنی", friction: 1.5, label: "کارآمد" },
    { name: "معاون بازرگانی", friction: 3.2, label: "متوسط" },
  ];

  const heatmapData = [
    { area: "مالی", misunderstanding: 12 },
    { area: "منابع انسانی", misunderstanding: 45 },
    { area: "فنی", misunderstanding: 8 },
    { area: "بازرگانی", misunderstanding: 35 },
    { area: "استراتژی", misunderstanding: 22 },
  ];

  const telepathyScores = [
    { deputy: "معاون مالی", score: 85, avatar: "💼" },
    { deputy: "معاون فروش", score: 72, avatar: "📈" },
    { deputy: "معاون منابع انسانی", score: 55, avatar: "👥" },
    { deputy: "معاون فنی", score: 90, avatar: "⚙️" },
    { deputy: "معاون بازرگانی", score: 68, avatar: "🤝" },
  ];

  const analysisMetrics = [
    {
      title: "شاخص وفاداری اجرایی",
      description: "چقدر خروجی کار شبیه به دستور اولیه بوده؟",
      icon: Target,
      value: "73%",
      status: "متوسط",
      color: "text-yellow-500"
    },
    {
      title: "شاخص اصطکاک",
      description: "(منابع + زمان) ÷ اهمیت پروژه",
      icon: Gauge,
      value: "2.6",
      status: "قابل بهبود",
      color: "text-orange-500"
    },
    {
      title: "تله‌پاتی سازمانی",
      description: "پیش‌بینی صحیح تصمیمات مدیرعامل",
      icon: Brain,
      value: "74%",
      status: "خوب",
      color: "text-green-500"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  // Non-demo mode: show empty state
  if (!isDemoMode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            موتور تحلیل (Processing Core)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تحلیل عمیق عملکرد معاونین و همسویی با استراتژی
          </p>
        </div>
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">داده‌ای برای تحلیل وجود ندارد</h3>
          <p className="text-muted-foreground text-sm">
            با ثبت رفتارها و پاسخ به سناریوها، موتور تحلیل شروع به کار خواهد کرد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          موتور تحلیل (Processing Core)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          تحلیل عمیق عملکرد معاونین و همسویی با استراتژی
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysisMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`text-sm font-medium ${metric.color}`}>
                {metric.status}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{metric.value}</h3>
            <p className="text-sm font-medium text-foreground mt-1">{metric.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Execution Loyalty Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          شاخص وفاداری اجرایی
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          اگر این عدد پایینه، یعنی معاونت داره "ساز خودش رو می‌زنه"
        </p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={executionLoyaltyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {executionLoyaltyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Friction Index & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            شاخص اصطکاک
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            هزینه و زمان نسبت به اهمیت پروژه - عدد پایین‌تر بهتر
          </p>
          <div className="space-y-4">
            {frictionIndexData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-32">{item.name}</span>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.friction / 5) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`h-full rounded-full ${
                      item.friction < 2 ? 'bg-green-500' :
                      item.friction < 3.5 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium w-20 text-left ${
                  item.friction < 2 ? 'text-green-500' :
                  item.friction < 3.5 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {item.friction} ({item.label})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-primary" />
            نقشه حرارتی ذهن
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            در کدام حوزه‌ها بیشترین سوءتفاهم وجود دارد؟
          </p>
          <div className="grid grid-cols-5 gap-2">
            {heatmapData.map((item) => (
              <div
                key={item.area}
                className={`p-3 rounded-lg text-center ${
                  item.misunderstanding < 15 ? 'bg-green-500/20 border border-green-500/30' :
                  item.misunderstanding < 30 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">{item.area}</p>
                <p className={`text-lg font-bold ${
                  item.misunderstanding < 15 ? 'text-green-500' :
                  item.misunderstanding < 30 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {item.misunderstanding}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Telepathy Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          شاخص تله‌پاتی
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          چند درصد مواقع معاون دقیقاً مثل شما فکر می‌کند؟
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {telepathyScores.map((item, index) => (
            <motion.div
              key={item.deputy}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center p-4 rounded-xl bg-secondary/30"
            >
              <div className="text-3xl mb-2">{item.avatar}</div>
              <div className={`text-2xl font-bold ${
                item.score >= 80 ? 'text-green-500' :
                item.score >= 60 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {item.score}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.deputy}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Translation Risk Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6 border-2 border-yellow-500/30"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          هشدار خطر ترجمه
        </h3>
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <p className="text-foreground">
            <strong className="text-yellow-500">هشدار:</strong> دستور اخیر شما در مورد "تعدیل نیرو" توسط ۳ معاون به عنوان "توقف استخدام" تعبیر شده است، نه "اخراج".
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            این سوءتفاهم می‌تواند منجر به عدم تحقق هدف شما شود.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisEngine;
