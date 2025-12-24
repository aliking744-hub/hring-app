import { MessageSquare, Send, FileText, Building2, BarChart3, Target, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useNavigate } from "react-router-dom";

interface ModuleFeature {
  text: string;
}

interface Module {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: ModuleFeature[];
  path?: string;
  disabled?: boolean;
}

const modules: Module[] = [
  {
    icon: MessageSquare,
    title: "دستیار مصاحبه",
    description: "تولید راهنمای جامع مصاحبه، سوالات تخصصی و کلید ارزیابی داوطلب",
    features: [
      { text: "سوالات تخصصی و رفتاری" },
      { text: "کلید ارزیابی برای هر سوال" },
      { text: "دانلود PDF" },
    ],
    path: "/interview-assistant",
  },
  {
    icon: Send,
    title: "آگهی‌نویس هوشمند",
    description: "نوشتن آگهی‌های شغلی جذاب برای لینکدین و سایت‌های کاریابی",
    features: [
      { text: "متن حرفه‌ای برای هر پلتفرم" },
      { text: "تولید تصویر با هوش مصنوعی" },
      { text: "لحن‌های متنوع" },
    ],
    path: "/smart-ad-generator",
  },
  {
    icon: FileText,
    title: "مهندسی مشاغل",
    description: "تولید هوشمند پروفایل شغلی با استفاده از هوش مصنوعی",
    features: [
      { text: "تولید سند هویت شغلی" },
      { text: "تعیین شرایط احراز" },
      { text: "خروجی PDF" },
    ],
    path: "/job-description",
  },
  {
    icon: Building2,
    title: "طراحی سازمان",
    description: "طراحی ساختار سازمانی و چارت‌های مدیریتی",
    features: [],
    disabled: true,
  },
  {
    icon: BarChart3,
    title: "ارزیابی عملکرد",
    description: "سیستم ارزیابی عملکرد کارکنان",
    features: [],
    disabled: true,
  },
  {
    icon: Target,
    title: "معمار موفقیت ۹۰ روزه",
    description: "طراحی نقشه راه ۹۰ روزه برای موفقیت و تثبیت نیروی جدید در سازمان",
    features: [
      { text: "برنامه ۳۰-۶۰-۹۰ روزه" },
      { text: "تایم‌لاین بصری" },
      { text: "ایمیل خوش‌آمدگویی" },
    ],
    path: "/onboarding-roadmap",
  },
];

const ModulesGrid = () => {
  const navigate = useNavigate();

  const handleModuleClick = (module: Module) => {
    if (!module.disabled && module.path) {
      navigate(module.path);
    }
  };

  return (
    <section className="py-24 px-4" dir="rtl" id="modules">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ماژول‌های موجود
            </h2>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              ابزارهای حرفه‌ای برای تسهیل فرآیندهای منابع انسانی
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <ScrollReveal key={module.title} delay={index * 0.1}>
              <div
                onClick={() => handleModuleClick(module)}
                className={`
                  relative bg-card rounded-2xl p-6 h-full min-h-[280px]
                  border border-border/50 transition-all duration-300
                  ${module.disabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto
                  ${module.disabled 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-primary/10 text-primary'
                  }
                `}>
                  <module.icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                  {module.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed text-center mb-4">
                  {module.description}
                </p>

                {/* Features */}
                {module.features.length > 0 && (
                  <div className="space-y-2 mt-auto">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                        <span>{feature.text}</span>
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Coming Soon Badge */}
                {module.disabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm font-medium">
                      به زودی...
                    </span>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesGrid;
