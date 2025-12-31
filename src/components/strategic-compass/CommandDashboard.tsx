import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  Activity,
  Zap,
  BarChart3,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, 
  Line, 
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
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

const CommandDashboard = () => {
  const [intents, setIntents] = useState<any[]>([]);
  const [behaviors, setBehaviors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [intentsRes, behaviorsRes] = await Promise.all([
        supabase.from('strategic_intents').select('*').eq('status', 'active'),
        supabase.from('behaviors').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (intentsRes.data) setIntents(intentsRes.data);
      if (behaviorsRes.data) setBehaviors(behaviorsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for charts
  const pulseData = [
    { month: "فروردین", alignment: 72 },
    { month: "اردیبهشت", alignment: 68 },
    { month: "خرداد", alignment: 75 },
    { month: "تیر", alignment: 82 },
    { month: "مرداد", alignment: 78 },
    { month: "شهریور", alignment: 85 },
  ];

  const radarData = [
    { deputy: "معاون مالی", value: 85, fullMark: 100 },
    { deputy: "معاون فروش", value: 72, fullMark: 100 },
    { deputy: "معاون منابع انسانی", value: 65, fullMark: 100 },
    { deputy: "معاون فنی", value: 90, fullMark: 100 },
    { deputy: "معاون بازرگانی", value: 78, fullMark: 100 },
  ];

  const alignmentMatrixData = [
    { x: 85, y: 90, z: 100, name: "معاون مالی", category: "ستاره" },
    { x: 75, y: 45, z: 80, name: "معاون فروش", category: "سرباز کور" },
    { x: 35, y: 88, z: 90, name: "معاون منابع انسانی", category: "یاغی خطرناک" },
    { x: 25, y: 30, z: 60, name: "معاون IT", category: "مهره سوخته" },
    { x: 92, y: 85, z: 95, name: "معاون فنی", category: "ستاره" },
  ];

  const kpis = [
    { 
      title: "وفاداری اجرایی", 
      value: "78%", 
      change: "+5%", 
      trend: "up",
      icon: Target,
      description: "همسویی خروجی با دستورات"
    },
    { 
      title: "شاخص اصطکاک", 
      value: "2.3", 
      change: "-0.4", 
      trend: "down",
      icon: Activity,
      description: "هزینه/زمان به ازای اهمیت"
    },
    { 
      title: "تله‌پاتی سازمانی", 
      value: "72%", 
      change: "+8%", 
      trend: "up",
      icon: Brain,
      description: "پیش‌بینی صحیح تصمیمات"
    },
    { 
      title: "ریسک انحراف", 
      value: "کم", 
      change: "پایدار", 
      trend: "stable",
      icon: AlertTriangle,
      description: "احتمال انحراف از مسیر"
    },
  ];

  const warnings = [
    { 
      level: "red", 
      message: "معاونت منابع انسانی در ۳ تصمیم آخر، ۲۵٪ انحراف داشته. الگوی رفتاری نشان‌دهنده مقاومت در برابر تغییر است.",
      deputy: "منابع انسانی"
    },
    { 
      level: "yellow", 
      message: "دستور اخیر در مورد 'تعدیل نیرو' توسط ۲ معاون به عنوان 'توقف استخدام' تعبیر شده است.",
      deputy: "عمومی"
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                kpi.trend === 'up' ? 'text-green-500' : 
                kpi.trend === 'down' ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {kpi.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                <span>{kpi.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{kpi.value}</h3>
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{kpi.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizational Pulse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            نبض سازمان
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            روند همسویی کل سازمان با نیت‌های استراتژیک در ۶ ماه گذشته
          </p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="alignment" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Deputies Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            رادار معاونین
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            هرچه به مرکز نزدیک‌تر، انحراف کمتر
          </p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="deputy" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Radar
                  name="همسویی"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Alignment Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          ماتریس سرباز - یاغی
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">ستاره‌ها (هم‌سو و موفق)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">سربازان کور (حرف‌گوش‌کن اما ناموفق)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">یاغی‌های خطرناک (موفق اما ناهم‌سو)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">مهره‌های سوخته (ناموفق و ناهم‌سو)</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="همسویی" 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'همسویی با استراتژی', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="موفقیت" 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'موفقیت در اجرا', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [value, name === 'x' ? 'همسویی' : 'موفقیت']}
              />
              <Scatter 
                name="معاونین" 
                data={alignmentMatrixData}
                fill="hsl(var(--primary))"
              >
                {alignmentMatrixData.map((entry, index) => (
                  <circle
                    key={index}
                    fill={
                      entry.category === 'ستاره' ? '#22c55e' :
                      entry.category === 'سرباز کور' ? '#3b82f6' :
                      entry.category === 'یاغی خطرناک' ? '#f97316' :
                      '#ef4444'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Warnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          سیستم هشدار زودهنگام
        </h3>
        <div className="space-y-3">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                warning.level === 'red' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  warning.level === 'red' ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    warning.level === 'red' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {warning.deputy}
                  </span>
                  <p className="text-foreground text-sm mt-2">{warning.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CommandDashboard;
