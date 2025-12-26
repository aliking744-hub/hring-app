import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, Sparkles, Megaphone, MessageSquareMore, Route, Users, Building2 } from "lucide-react";
import logo from "@/assets/logo.png";
import AuroraBackground from "@/components/AuroraBackground";

const modules = [
  {
    title: "مهندسی مشاغل",
    description: "تولید هوشمند پروفایل شغلی با استفاده از هوش مصنوعی",
    icon: FileText,
    path: "/job-description",
    color: "primary",
    bgColor: "bg-primary/20",
    hoverBg: "group-hover:bg-primary/30",
    features: ["تولید سند هویت شغلی", "تعیین شرایط احراز", "خروجی PDF"],
  },
  {
    title: "آگهی‌نویس هوشمند",
    description: "نوشتن آگهی‌های شغلی جذاب برای لینکدین و سایت‌های کاریابی",
    icon: Megaphone,
    path: "/smart-ad-generator",
    color: "purple-500",
    bgColor: "bg-purple-500/20",
    hoverBg: "group-hover:bg-purple-500/30",
    features: ["متن حرفه‌ای برای هر پلتفرم", "تولید تصویر با هوش مصنوعی", "لحن‌های متنوع"],
  },
  {
    title: "دستیار مصاحبه",
    description: "تولید راهنمای جامع مصاحبه، سوالات تخصصی و کلید ارزیابی داوطلب",
    icon: MessageSquareMore,
    path: "/interview-assistant",
    color: "orange-500",
    bgColor: "bg-orange-500/20",
    hoverBg: "group-hover:bg-orange-500/30",
    features: ["سوالات تخصصی و رفتاری", "کلید ارزیابی برای هر سوال", "دانلود PDF"],
  },
  {
    title: "معمار موفقیت ۹۰ روزه",
    description: "طراحی نقشه راه ۹۰ روزه برای موفقیت و تثبیت نیروی جدید در سازمان",
    icon: Route,
    path: "/success-architect",
    color: "green-500",
    bgColor: "bg-green-500/20",
    hoverBg: "group-hover:bg-green-500/30",
    features: ["برنامه ۳۰-۶۰-۹۰ روزه", "تایم‌لاین بصری", "ایمیل خوش‌آمدگویی"],
  },
];

const upcomingModules = [
  { title: "ارزیابی عملکرد", icon: Users },
  { title: "طراحی سازمان", icon: Building2 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Modules = () => {
  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container max-w-5xl mx-auto text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <img
                src={logo}
                alt="لوگو"
                className="w-24 h-24 mx-auto"
              />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              سیستم مدیریت منابع انسانی
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              ابزارهای هوشمند برای مهندسی مشاغل و مدیریت منابع انسانی سازمانی
            </p>
            <Link to="/job-description">
              <Button size="lg" className="gap-2 text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all">
                شروع کنید
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="container max-w-5xl mx-auto py-16 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">ماژول‌های موجود</h2>
            <p className="text-muted-foreground text-lg">
              ابزارهای حرفه‌ای برای تسهیل فرآیندهای منابع انسانی
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {modules.map((module) => (
              <motion.div key={module.path} variants={itemVariants}>
                <Link to={module.path} className="group block">
                  <Card className="h-full glass-card border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-2xl ${module.bgColor} ${module.hoverBg} flex items-center justify-center mb-4 transition-all duration-300`}>
                        <module.icon className={`w-7 h-7 text-${module.color}`} />
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {module.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Sparkles className={`w-4 h-4 text-${module.color}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {/* Upcoming Modules */}
            {upcomingModules.map((module, index) => (
              <motion.div key={module.title} variants={itemVariants}>
                <Card className="h-full glass-card border-border/30 opacity-50 cursor-not-allowed">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                      <module.icon className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl text-muted-foreground">{module.title}</CardTitle>
                    <CardDescription className="text-muted-foreground/70">
                      به زودی...
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Back to Dashboard Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="container max-w-5xl mx-auto pb-16 px-4"
        >
          <div className="text-center">
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2 border-border hover:bg-secondary">
                <ArrowRight className="w-4 h-4" />
                بازگشت به داشبورد
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-4 backdrop-blur-sm">
          <div className="container max-w-5xl mx-auto text-center text-muted-foreground text-sm">
            <p>سیستم مدیریت منابع انسانی | طراحی شده با ❤️</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Modules;
