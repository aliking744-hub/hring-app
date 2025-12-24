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
  Home
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { icon: LayoutDashboard, label: "نمای کلی", path: "/dashboard", external: false },
  { icon: Grid3X3, label: "ابزارهای مدیریتی", path: "https://id-preview--496b8c23-c7ce-4367-85a8-6c0e5cb09873.lovable.app/?__lovable_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiamtLVVd2dlZiSFh1ellPRE5xQzM0a2VjNXZ1MSIsInByb2plY3RfaWQiOiI0OTZiOGMyMy1jN2NlLTQzNjctODVhOC02YzBlNWNiMDk4NzMiLCJub25jZSI6ImJkOWNlYWNkNDViYzQ5OWQ1MDU4ZmRlZWRiMTAzZTY0IiwiaXNzIjoibG92YWJsZS1hcGkiLCJzdWIiOiI0OTZiOGMyMy1jN2NlLTQzNjctODVhOC02YzBlNWNiMDk4NzMiLCJhdWQiOlsibG92YWJsZS1hcHAiXSwiZXhwIjoxNzY3MTcyNDMyLCJuYmYiOjE3NjY1Njc2MzIsImlhdCI6MTc2NjU2NzYzMn0.DeZvX1eDDgKWMIVc2psqpVXH3gbDyqzVH2RPssDpNr4", external: true },
  { icon: Briefcase, label: "موقعیت‌های شغلی", path: "/job-description", external: false },
  { icon: Megaphone, label: "آگهی‌ها", path: "/smart-ad", external: false },
  { icon: Users, label: "مصاحبه‌ها", path: "/interviews", external: false },
  { icon: UserPlus, label: "آنبوردینگ", path: "/onboarding", external: false },
  { icon: FileText, label: "مستندات", path: "/shop", external: false },
  { icon: Settings, label: "تنظیمات", path: "/dashboard", external: false },
];

const stats = [
  { label: "موقعیت‌های فعال", value: "۱۲", change: "+۲", icon: Briefcase },
  { label: "متقاضیان جدید", value: "۴۸", change: "+۱۵", icon: Users },
  { label: "مصاحبه این هفته", value: "۸", change: "+۳", icon: Calendar },
  { label: "استخدام این ماه", value: "۳", change: "+۱", icon: TrendingUp },
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
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
