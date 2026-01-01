import { Briefcase, Megaphone, Users, UserPlus } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const features = [
  {
    icon: Briefcase,
    title: "مدیریت شغل",
    description: "ایجاد و مدیریت فرصت‌های شغلی با داشبورد هوشمند. ردیابی متقاضیان و وضعیت هر موقعیت.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    size: "md:col-span-2",
  },
  {
    icon: Megaphone,
    title: "آگهی و تبلیغات",
    description: "انتشار خودکار آگهی در پلتفرم‌های مختلف. بهینه‌سازی با هوش مصنوعی.",
    gradient: "from-purple-500/20 to-pink-500/20",
    size: "md:col-span-1",
  },
  {
    icon: Users,
    title: "مصاحبه هوشمند",
    description: "زمان‌بندی خودکار، سوالات پیشنهادی AI و ارزیابی یکپارچه.",
    gradient: "from-orange-500/20 to-yellow-500/20",
    size: "md:col-span-1",
  },
  {
    icon: UserPlus,
    title: "آنبوردینگ",
    description: "فرآیند ورود کارمندان جدید را اتوماتیک کنید. چک‌لیست‌ها، مستندات و آموزش‌ها.",
    gradient: "from-green-500/20 to-emerald-500/20",
    size: "md:col-span-2",
  },
];

const BentoGrid = () => {
  const { getSetting } = useSiteSettings();
  
  const bentoTitle = getSetting('bento_title', 'همه چیز در یک پلتفرم');
  const bentoSubtitle = getSetting('bento_subtitle', 'چهار ماژول قدرتمند برای مدیریت کامل چرخه استخدام');

  return (
    <section className="py-24 px-4" dir="rtl">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {bentoTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {bentoSubtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1} className={feature.size}>
              <SpotlightCard className="h-full min-h-[200px] relative overflow-hidden group">
                {/* Gradient Background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
                />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
