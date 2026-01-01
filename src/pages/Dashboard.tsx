import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserPlus,
  Settings,
  LogOut,
  Bell,
  Search,
  Grid3X3,
  Home,
  Menu,
  X,
  Boxes,
  Calculator,
  Crosshair,
  Compass,
  FileText,
  Shield,
  Building2,
  Loader2,
  Crown,
  History,
  Lock,
  Eye
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useCredits } from "@/hooks/useCredits";
import IndividualDashboard from "@/components/dashboard/IndividualDashboard";
import CorporateDashboard from "@/components/dashboard/CorporateDashboard";
import type { SubscriptionTier } from "@/types/multiTenant";

// Feature visibility rules based on plan
const getFeatureVisibility = (tier: SubscriptionTier | null, userType: 'individual' | 'corporate') => {
  // Corporate users have different rules
  if (userType === 'corporate') {
    return {
      modules: true,
      headhunting: true,
      onboarding: tier !== 'corporate_expert', // Hidden for Expert
      strategicCompass: tier === 'corporate_decision_support' || tier === 'corporate_decision_making',
      hrDashboard: tier === 'corporate_decision_making',
      costCalculator: true,
    };
  }

  // Individual users
  const isFree = tier === 'individual_free' || !tier;
  const isPro = tier === 'individual_pro';
  const isPlus = tier === 'individual_plus';

  return {
    modules: true, // Always visible
    costCalculator: true, // Always visible
    headhunting: isPro || isPlus, // Hidden for Free
    onboarding: isPlus, // Hidden for Free/Pro (Plus gets demo)
    strategicCompass: isPlus, // Hidden for Free/Pro (Plus gets demo)
    hrDashboard: isPro || isPlus, // Hidden for Free
    canSaveData: isPlus, // Only Plus can save data
    isDemoMode: isPlus && !userType, // Plus users get demo mode for restricted features
  };
};

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { context, loading: contextLoading } = useUserContext();
  const { isAdmin } = useAdmin();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const location = useLocation();

  // Get visibility rules based on user's plan
  const visibility = getFeatureVisibility(
    context?.subscriptionTier || context?.companyTier || null,
    context?.userType || 'individual'
  );

  // Dynamic sidebar items based on user type and plan
  const getSidebarItems = () => {
    const items: Array<{
      icon: any;
      label: string;
      path: string;
      hidden?: boolean;
      demoMode?: boolean;
    }> = [
      { icon: LayoutDashboard, label: "نمای کلی", path: "/dashboard" },
      { icon: Boxes, label: "ماژول‌ها", path: "/modules" },
      { icon: Calculator, label: "بهای تمام شده", path: "/cost-calculator" },
    ];

    // Headhunting - Hidden for Free users
    if (visibility.headhunting) {
      items.push({ icon: Crosshair, label: "هدهانتینگ", path: "/smart-headhunting" });
    }

    // Onboarding - Hidden for Free/Pro, Demo for Plus (individual)
    if (visibility.onboarding) {
      const isPlus = context?.subscriptionTier === 'individual_plus';
      items.push({ 
        icon: UserPlus, 
        label: "آنبوردینگ", 
        path: "/onboarding",
        demoMode: isPlus && context?.userType === 'individual'
      });
    }

    // HR Dashboard - Hidden for Free
    if (visibility.hrDashboard) {
      items.push({ icon: Grid3X3, label: "داشبورد HR", path: "/hr-dashboard" });
    }

    // Strategic Compass - Only for corporate or Plus (demo)
    if (visibility.strategicCompass) {
      const isPlus = context?.subscriptionTier === 'individual_plus';
      items.push({ 
        icon: Compass, 
        label: "قطب نمای استراتژی", 
        path: "/strategic-compass",
        demoMode: isPlus && context?.userType === 'individual'
      });
    }

    // Shop - Always visible
    items.push({ icon: FileText, label: "فروشگاه", path: "/shop" });

    // Add corporate-specific items
    if (context?.userType === 'corporate') {
      items.splice(1, 0, { icon: Users, label: "اعضای تیم", path: "/company-members" });
      if (context.companyRole === 'ceo') {
        items.push({ icon: Settings, label: "تنظیمات شرکت", path: "/company-settings" });
      }
    }

    // Add admin link
    if (isAdmin) {
      items.push({ icon: Shield, label: "پنل ادمین", path: "/admin" });
    }

    return items;
  };

  const sidebarItems = getSidebarItems();

  // Get max credits based on user's plan
  const getMaxCredits = () => {
    const tier = context?.subscriptionTier || context?.companyTier;
    switch (tier) {
      case 'individual_free': return 50;
      case 'individual_pro': return 600;
      case 'individual_plus': return 2500;
      case 'corporate_expert': return 500;
      case 'corporate_decision_support': return 2000;
      case 'corporate_decision_making': return 5000;
      default: return 50;
    }
  };

  const maxCredits = getMaxCredits();
  const creditPercentage = maxCredits > 0 ? Math.min((credits / maxCredits) * 100, 100) : 0;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>داشبورد | HRing - پنل مدیریت منابع انسانی</title>
        <meta 
          name="description" 
          content="پنل مدیریت منابع انسانی HRing. مشاهده وضعیت استخدام، مصاحبه‌ها و آمار تیم در یک نگاه." 
        />
      </Helmet>
      <div className="relative min-h-screen flex" dir="rtl">
        <AuroraBackground />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 w-12 h-12 glass-card flex items-center justify-center rounded-xl"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed top-0 right-0 bottom-0 w-72 glass-card z-50 p-4 flex flex-col overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>

                {/* Logo & User Type Badge */}
                <div className="mb-4">
                  <Link to="/" className="text-2xl font-bold gradient-text-primary">
                    hring
                  </Link>
                  {context?.userType === 'corporate' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">حساب شرکتی</span>
                    </div>
                  )}
                  {/* Credits Display with Progress */}
                  <div className="mt-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">اعتبار باقی‌مانده</span>
                      <Link to="/payment-history" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <History className="w-3 h-3" />
                        تاریخچه
                      </Link>
                    </div>
                    <div className="text-lg font-bold text-primary mb-2">
                      {credits} <span className="text-xs font-normal text-muted-foreground">/ {maxCredits} واحد</span>
                    </div>
                    <Progress value={creditPercentage} className="h-2" />
                  </div>
                </div>

                {/* Back to Home */}
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-border/50"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">بازگشت به صفحه اصلی</span>
                </Link>

                {/* Nav Items */}
                <nav className="flex-1 space-y-2">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.demoMode && (
                        <Badge variant="secondary" className="mr-auto text-xs">
                          <Eye className="w-3 h-3 ml-1" />
                          دمو
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Upgrade Button */}
                <Link 
                  to="/upgrade" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-gradient-to-l from-primary/20 to-primary/10 text-primary border border-primary/30 hover:from-primary/30 hover:to-primary/20 transition-all"
                >
                  <Crown className="w-5 h-5" />
                  <span className="font-medium">ارتقای پلن</span>
                </Link>

                {/* Logout */}
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">خروج</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 glass-card m-4 p-4 hidden lg:flex flex-col"
        >
          {/* Logo & User Type */}
          <div className="mb-4">
            <Link to="/" className="text-2xl font-bold gradient-text-primary">
              hring
            </Link>
            {context?.userType === 'corporate' && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">حساب شرکتی</span>
              </div>
            )}
            {/* Credits Display with Progress */}
            <div className="mt-3 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">اعتبار باقی‌مانده</span>
                <Link to="/payment-history" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <History className="w-3 h-3" />
                  تاریخچه
                </Link>
              </div>
              <div className="text-lg font-bold text-primary mb-2">
                {credits} <span className="text-xs font-normal text-muted-foreground">/ {maxCredits} واحد</span>
              </div>
              <Progress value={creditPercentage} className="h-2" />
            </div>
          </div>

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
                {item.demoMode && (
                  <Badge variant="secondary" className="mr-auto text-xs">
                    <Eye className="w-3 h-3 ml-1" />
                    دمو
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Upgrade Button */}
          <Link 
            to="/upgrade" 
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-gradient-to-l from-primary/20 to-primary/10 text-primary border border-primary/30 hover:from-primary/30 hover:to-primary/20 transition-all"
          >
            <Crown className="w-5 h-5" />
            <span className="font-medium">ارتقای پلن</span>
          </Link>

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
        <div className="flex-1 p-4 lg:pr-0 pt-20 lg:pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card h-full p-6 overflow-auto"
          >
            {/* Header with Search & Notifications */}
            <header className="flex items-center justify-end gap-3 mb-6">
              <div className="relative hidden sm:block">
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
            </header>

            {/* Conditional Dashboard Content */}
            {context?.userType === 'corporate' ? (
              <CorporateDashboard />
            ) : (
              <IndividualDashboard />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
