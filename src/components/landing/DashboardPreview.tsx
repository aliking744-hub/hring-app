import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Users, Calendar, DollarSign, Clock, Building2, LayoutGrid, Cake, MapPin, User, Timer } from "lucide-react";

const tabs = [
  { id: "overview", label: "نمای کلی", icon: LayoutGrid },
  { id: "birthdays", label: "تولدها", icon: Cake },
  { id: "salary", label: "حقوق", icon: DollarSign },
  { id: "map", label: "نقشه", icon: MapPin },
  { id: "profile", label: "پروفایل", icon: User },
  { id: "overtime", label: "اضافه کار", icon: Timer },
];

const kpiData = [
  { label: "تعداد معاونت", value: "۶", icon: Building2, color: "from-pink-500 to-rose-600" },
  { label: "تعداد پرسنل", value: "۷۸", icon: Users, color: "from-cyan-400 to-blue-500" },
  { label: "میانگین سنی", value: "۴۰.۰۳", icon: Calendar, color: "from-orange-400 to-amber-500" },
  { label: "میانگین حقوق", value: "۲۰۶,۵۴۷,۲۳۵", icon: DollarSign, color: "from-emerald-500 to-green-600" },
  { label: "میانگین سابقه کاری", value: "۴.۲۴", icon: Clock, color: "from-violet-500 to-purple-600" },
];

const DashboardPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { stiffness: 100, damping: 30 });

  // Auto-rotate tabs
  useEffect(() => {
    const tabInterval = setInterval(() => {
      setActiveTab(prev => {
        const currentIndex = tabs.findIndex(t => t.id === prev);
        return tabs[(currentIndex + 1) % tabs.length].id;
      });
    }, 3000);
    return () => clearInterval(tabInterval);
  }, []);

  // Auto-animate KPI cards
  useEffect(() => {
    const kpiInterval = setInterval(() => {
      setCurrentKpiIndex(prev => (prev + 1) % kpiData.length);
    }, 2000);
    return () => clearInterval(kpiInterval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12" dir="rtl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              تجربه داشبورد مدرن
            </h2>
            <p className="text-muted-foreground text-lg">
              طراحی شده برای بهره‌وری حداکثری
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000 flex justify-center"
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-5xl"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl opacity-50" />
              
              {/* Dashboard Mockup */}
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden">
                <div className="bg-card rounded-xl overflow-hidden" dir="rtl">
                  {/* Header Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-block glass-card px-4 py-1 text-xs text-muted-foreground">
                        داشبورد منابع انسانی
                      </div>
                    </div>
                  </div>
                  
                  {/* Filter Bar */}
                  <div className="flex flex-wrap gap-2 p-4 border-b border-border/50">
                    {["جنسیت", "تحصیلات", "معاونت", "محل فعالیت", "جایگاه سازمانی"].map((filter, i) => (
                      <motion.div
                        key={filter}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card px-3 py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-2"
                      >
                        <span>{filter}</span>
                        <span className="bg-primary/20 px-2 py-0.5 rounded text-primary text-[10px]">همه</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex justify-center py-3 border-b border-border/30">
                    <div className="flex gap-1 glass-card p-1 rounded-xl">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                              activeTab === tab.id 
                                ? "bg-primary text-primary-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-4 min-h-[320px]">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                      {kpiData.map((kpi, i) => {
                        const Icon = kpi.icon;
                        const isActive = i === currentKpiIndex;
                        return (
                          <motion.div
                            key={i}
                            className={`relative overflow-hidden rounded-xl p-3 bg-gradient-to-br ${kpi.color}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              scale: isActive ? 1.05 : 1,
                              boxShadow: isActive ? "0 0 30px rgba(255,255,255,0.3)" : "none"
                            }}
                            transition={{ 
                              delay: i * 0.1,
                              scale: { duration: 0.3 }
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-white/80 text-[10px]">{kpi.label}</span>
                            </div>
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={isActive ? "active" : "inactive"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-white font-bold text-lg"
                              >
                                {kpi.value}
                              </motion.div>
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Charts Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Bar Chart */}
                      <div className="glass-card p-3 rounded-xl col-span-1">
                        <div className="text-xs text-muted-foreground mb-3 text-center">تعداد پرسنل براساس رده سنی</div>
                        <div className="flex items-end gap-1 justify-center h-20">
                          {[35, 55, 80, 65, 40, 25].map((h, i) => (
                            <motion.div
                              key={i}
                              className="w-4 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-t"
                              initial={{ height: 0 }}
                              whileInView={{ height: `${h}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Pie Chart 1 - Gender */}
                      <div className="glass-card p-3 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-2 text-center">پرسنل به تفکیک جنسیت</div>
                        <div className="relative w-16 h-16 mx-auto">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="6"
                              strokeDasharray="78 22"
                              strokeDashoffset="25"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "78 22" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="hsl(var(--accent))"
                              strokeWidth="6"
                              strokeDasharray="22 78"
                              strokeDashoffset="-53"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "22 78" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.4 }}
                            />
                          </svg>
                        </div>
                        <div className="flex justify-center gap-3 mt-2 text-[10px]">
                          <span className="text-primary">مرد (۷۸٪)</span>
                          <span className="text-accent">زن (۲۲٪)</span>
                        </div>
                      </div>

                      {/* Pie Chart 2 - Marital Status */}
                      <div className="glass-card p-3 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-2 text-center">وضعیت تاهل</div>
                        <div className="relative w-16 h-16 mx-auto">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="#a855f7"
                              strokeWidth="6"
                              strokeDasharray="65 35"
                              strokeDashoffset="25"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "65 35" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="#facc15"
                              strokeWidth="6"
                              strokeDasharray="35 65"
                              strokeDashoffset="-40"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "35 65" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </svg>
                        </div>
                        <div className="flex justify-center gap-3 mt-2 text-[10px]">
                          <span className="text-purple-400">متاهل (۶۵٪)</span>
                          <span className="text-yellow-400">مجرد (۳۵٪)</span>
                        </div>
                      </div>

                      {/* Pie Chart 3 - Location */}
                      <div className="glass-card p-3 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-2 text-center">محل فعالیت</div>
                        <div className="relative w-16 h-16 mx-auto">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="#f472b6"
                              strokeWidth="6"
                              strokeDasharray="54 46"
                              strokeDashoffset="25"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "54 46" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                            <motion.circle
                              cx="18" cy="18" r="14"
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="6"
                              strokeDasharray="46 54"
                              strokeDashoffset="-29"
                              initial={{ strokeDasharray: "0 100" }}
                              whileInView={{ strokeDasharray: "46 54" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </svg>
                        </div>
                        <div className="flex justify-center gap-3 mt-2 text-[10px]">
                          <span className="text-pink-400">ستاد (۵۴٪)</span>
                          <span className="text-cyan-400">پروژه (۴۶٪)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DashboardPreview;
