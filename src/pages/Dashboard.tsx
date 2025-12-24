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
  FileText
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const sidebarItems = [
  { icon: LayoutDashboard, label: "داشبورد", path: "/dashboard" },
  { icon: Briefcase, label: "موقعیت‌های شغلی", path: "/job-description" },
  { icon: Megaphone, label: "آگهی‌ها", path: "/smart-ad" },
  { icon: Users, label: "مصاحبه‌ها", path: "/interviews" },
  { icon: UserPlus, label: "آنبوردینگ", path: "/onboarding" },
  { icon: FileText, label: "مستندات", path: "/shop" },
  { icon: Settings, label: "تنظیمات", path: "/dashboard" },
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

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
        <Link to="/" className="text-2xl font-bold gradient-text-primary mb-8">
          hring
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
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
              <h1 className="text-2xl font-bold text-foreground">داشبورد</h1>
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
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
                  onClick={() => navigate('/shop')}
                >
                  <FileText className="w-4 h-4 ml-2" />
                  گزارش‌گیری
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
