import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const DashboardPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 100, damping: 30 });

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
              className="relative w-full max-w-4xl animate-float"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-3xl opacity-50" />
              
              {/* Dashboard Mockup */}
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden">
                <div className="bg-card rounded-xl overflow-hidden">
                  {/* Header Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-block glass-card px-4 py-1 text-xs text-muted-foreground">
                        dashboard.hring.io
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6 min-h-[300px] md:min-h-[400px]">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "موقعیت‌های فعال", value: "۱۲" },
                        { label: "متقاضیان جدید", value: "۴۸" },
                        { label: "مصاحبه‌ها", value: "۸" },
                        { label: "استخدام‌شده", value: "۳" },
                      ].map((stat, i) => (
                        <div 
                          key={i} 
                          className="glass-card p-4 text-center"
                          dir="rtl"
                        >
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart Placeholder */}
                    <div className="glass-card p-4 h-32 flex items-end gap-2 justify-center">
                      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-8 bg-gradient-to-t from-primary to-accent rounded-t"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      ))}
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
