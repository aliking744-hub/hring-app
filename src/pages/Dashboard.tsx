import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Megaphone, 
  Users, 
  UserPlus,
  Settings,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Calendar,
  FileText,
  Grid3X3,
  FileDown,
  Home,
  MessageSquare,
  Send,
  Building2,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { icon: LayoutDashboard, label: "نمای کلی", path: "/dashboard", external: false },
  { icon: Grid3X3, label: "ابزارهای مدیریتی", path: "/hr-dashboard", external: false },
  { icon: Briefcase, label: "موقعیت‌های شغلی", path: "/job-description", external: false },
  { icon: Megaphone, label: "آگهی‌ها", path: "/smart-ad", external: false },
  { icon: Users, label: "مصاحبه‌ها", path: "/interviews", external: false },
  { icon: UserPlus, label: "آنبوردینگ", path: "/onboarding", external: false },
  { icon: FileText, label: "مستندات", path: "/dashboard#modules", external: false },
  { icon: Settings, label: "تنظیمات", path: "/dashboard", external: false },
];

const stats = [
  { label: "موقعیت‌های فعال", value: "۱۲", change: "+۲", icon: Briefcase },
  { label: "متقاضیان جدید", value: "۴۸", change: "+۱۵", icon: Users },
  { label: "مصاحبه این هفته", value: "۸", change: "+۳", icon: Calendar },
  { label: "استخدام این ماه", value: "۳", change: "+۱", icon: TrendingUp },
];

const modules = [
  {
    icon: MessageSquare,
    title: "دستیار مصاحبه",
    description: "تولید راهنمای جامع مصاحبه، سوالات تخصصی و کلید ارزیابی داوطلب",
    features: ["سوالات تخصصی و رفتاری", "کلید ارزیابی برای هر سوال", "دانلود PDF"],
    path: "/interview-assistant",
    disabled: false,
  },
  {
    icon: Send,
    title: "آگهی‌نویس هوشمند",
    description: "نوشتن آگهی‌های شغلی جذاب برای لینکدین و سایت‌های کاریابی",
    features: ["متن حرفه‌ای برای هر پلتفرم", "تولید تصویر با هوش مصنوعی", "لحن‌های متنوع"],
    path: "/smart-ad-generator",
    disabled: false,
  },
  {
    icon: FileText,
    title: "مهندسی مشاغل",
    description: "تولید هوشمند پروفایل شغلی با استفاده از هوش مصنوعی",
    features: ["تولید سند هویت شغلی", "تعیین شرایط احراز", "خروجی PDF"],
    path: "/job-description",
    disabled: false,
  },
  {
    icon: Building2,
    title: "طراحی سازمان",
    description: "طراحی ساختار سازمانی و چارت‌های مدیریتی",
    features: [],
    path: "",
    disabled: true,
  },
  {
    icon: BarChart3,
    title: "ارزیابی عملکرد",
    description: "سیستم ارزیابی عملکرد کارکنان",
    features: [],
    path: "",
    disabled: true,
  },
  {
    icon: Target,
    title: "معمار موفقیت ۹۰ روزه",
    description: "طراحی نقشه راه ۹۰ روزه برای موفقیت و تثبیت نیروی جدید در سازمان",
    features: ["برنامه ۳۰-۶۰-۹۰ روزه", "تایم‌لاین بصری", "ایمیل خوش‌آمدگویی"],
    path: "/onboarding-roadmap",
    disabled: false,
  },
];

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleExportPDF = () => {
    toast({
      title: "در حال آماده‌سازی گزارش...",
      description: "گزارش PDF به زودی دانلود می‌شود.",
    });
    // Simple print-based PDF export
    window.print();
  };

  // Calculate hiring health (mock data)
  const hiringHealth = 95;

  return (
    <div className="relative min-h-screen flex" dir="rtl">
      <AuroraBackground />
      
      {/* Sidebar */}
      <motion.aside
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 glass-card m-4 p-4 hidden lg:flex flex-col"
      >
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold gradient-text-primary mb-4">
          hring
        </Link>

        {/* Back to Home */}
        <Link 
          to="/" 
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-border/50"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">بازگشت به صفحه اصلی</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            item.external ? (
              <a
                key={item.label}
                href={item.path}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          ))}
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">خروج</span>
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:pr-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card h-full p-6 overflow-auto"
        >
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">نمای کلی</h1>
              <p className="text-muted-foreground">خوش آمدید! اینجا خلاصه‌ای از وضعیت استخدام شماست.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="جستجو..." 
                  className="pr-9 w-48 bg-secondary/50 border-border"
                />
              </div>
              <Button size="icon" variant="outline" className="relative border-border bg-secondary/50">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
                  ۳
                </span>
              </Button>
            </div>
          </header>

          {/* Stats Grid with Hiring Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Hiring Health Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5 flex flex-col items-center justify-center"
            >
              <p className="text-muted-foreground text-sm mb-3">سلامت استخدام</p>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-secondary"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary"
                    strokeWidth="3"
                    strokeDasharray={`${hiringHealth}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">٪{hiringHealth}</span>
                </div>
              </div>
              <p className="text-sm text-green-500 mt-2">عالی</p>
            </motion.div>

            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index + 1) * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-green-500 mt-2">{stat.change} نسبت به هفته قبل</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">اقدامات سریع</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="glow-button text-foreground h-12"
                  onClick={() => navigate('/job-description')}
                >
                  <Briefcase className="w-4 h-4 ml-2" />
                  موقعیت جدید
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border bg-secondary/50 h-12"
                  onClick={() => navigate('/smart-ad')}
                >
                  <Megaphone className="w-4 h-4 ml-2" />
                  آگهی جدید
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border bg-secondary/50 h-12"
                  onClick={() => navigate('/interviews')}
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  زمان‌بندی مصاحبه
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border bg-secondary/50 h-12"
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-4 h-4 ml-2" />
                  گزارش PDF
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">مصاحبه‌های امروز</h2>
              <div className="space-y-3">
                {[
                  { name: "سارا احمدی", position: "طراح UI/UX", time: "۱۰:۳۰" },
                  { name: "محمد رضایی", position: "توسعه‌دهنده فرانت‌اند", time: "۱۴:۰۰" },
                  { name: "زهرا کریمی", position: "مدیر محصول", time: "۱۶:۳۰" },
                ].map((interview, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{interview.name}</p>
                      <p className="text-sm text-muted-foreground">{interview.position}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{interview.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Modules Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
            id="modules"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">ماژول‌های موجود</h2>
              <p className="text-primary">ابزارهای حرفه‌ای برای تسهیل فرآیندهای منابع انسانی</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  onClick={() => !module.disabled && module.path && navigate(module.path)}
                  className={`
                    relative glass-card p-6 min-h-[250px]
                    ${module.disabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'cursor-pointer hover:border-primary/30 hover:-translate-y-1 transition-all duration-300'
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
                  <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed text-center mb-4">
                    {module.description}
                  </p>

                  {/* Features */}
                  {module.features.length > 0 && (
                    <div className="space-y-2">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                          <span>{feature}</span>
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {module.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
                      <span className="text-muted-foreground text-sm font-medium">به زودی...</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
