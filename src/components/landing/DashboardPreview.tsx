import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { LayoutGrid, Cake, DollarSign, MapPin, User, Timer, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// Import dashboard screenshots
import dashboardOverview from "@/assets/dashboard-overview.png";
import dashboardBirthdays from "@/assets/dashboard-birthdays.png";
import dashboardMap from "@/assets/dashboard-map.png";
import dashboardSalary from "@/assets/dashboard-salary.png";
import dashboardProfile from "@/assets/dashboard-profile.png";
import dashboardOvertime from "@/assets/dashboard-overtime.png";

const tabs = [
  { id: "overview", label: "نمای کلی", icon: LayoutGrid, image: dashboardOverview },
  { id: "birthdays", label: "تولدها", icon: Cake, image: dashboardBirthdays },
  { id: "salary", label: "حقوق", icon: DollarSign, image: dashboardSalary },
  { id: "map", label: "نقشه", icon: MapPin, image: dashboardMap },
  { id: "profile", label: "پروفایل", icon: User, image: dashboardProfile },
  { id: "overtime", label: "اضافه کار", icon: Timer, image: dashboardOvertime },
];

const DashboardPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { getSetting } = useSiteSettings();
  
  const dashboardTitle = getSetting('dashboard_title', 'تجربه داشبورد مدرن');
  const dashboardSubtitle = getSetting('dashboard_subtitle', 'طراحی شده برای بهره‌وری حداکثری');
  const dashboardCta = getSetting('dashboard_cta', 'مشاهده داشبورد کامل و فیلترها');
  
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
    }, 4000);
    return () => clearInterval(tabInterval);
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

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12" dir="rtl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {dashboardTitle}
            </h2>
            <p className="text-muted-foreground text-lg">
              {dashboardSubtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Tab Navigation */}
        <ScrollReveal delay={0.1}>
          <div className="flex justify-center mb-8" dir="rtl">
            <div className="flex gap-1 glass-card p-1.5 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      activeTab === tab.id 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
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
              className="relative w-full max-w-6xl"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl opacity-50" />
              
              {/* Dashboard Screenshot Container */}
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden">
                <div className="relative rounded-xl overflow-hidden bg-card">
                  {/* Browser Header Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-card/80 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-block glass-card px-4 py-1 text-xs text-muted-foreground">
                        داشبورد منابع انسانی - {currentTab.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Screenshot with Animation */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeTab}
                        src={currentTab.image}
                        alt={`داشبورد - ${currentTab.label}`}
                        className="w-full h-full object-cover object-top"
                        initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </AnimatePresence>
                    
                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* CTA Button */}
        <ScrollReveal delay={0.3}>
          <div className="flex justify-center mt-10">
            <a href="https://id-preview--496b8c23-c7ce-4367-85a8-6c0e5cb09873.lovable.app/?__lovable_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiamtLVVd2dlZiSFh1ellPRE5xQzM0a2VjNXZ1MSIsInByb2plY3RfaWQiOiI0OTZiOGMyMy1jN2NlLTQzNjctODVhOC02YzBlNWNiMDk4NzMiLCJub25jZSI6ImJkOWNlYWNkNDViYzQ5OWQ1MDU4ZmRlZWRiMTAzZTY0IiwiaXNzIjoibG92YWJsZS1hcGkiLCJzdWIiOiI0OTZiOGMyMy1jN2NlLTQzNjctODVhOC02YzBlNWNiMDk4NzMiLCJhdWQiOlsibG92YWJsZS1hcHAiXSwiZXhwIjoxNzY3MTcyNDMyLCJuYmYiOjE3NjY1Njc2MzIsImlhdCI6MTc2NjU2NzYzMn0.DeZvX1eDDgKWMIVc2psqpVXH3gbDyqzVH2RPssDpNr4">
              <Button
                size="lg"
                className="glow-button text-lg px-8 py-6 gap-3"
              >
                <BarChart3 className="w-5 h-5" />
                {dashboardCta}
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DashboardPreview;
