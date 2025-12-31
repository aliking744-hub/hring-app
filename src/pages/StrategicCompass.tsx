import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  Target, 
  Users, 
  BarChart3, 
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  Zap,
  Eye,
  FileText,
  Coins,
  UserCheck,
  Radar,
  Flame,
  Lightbulb
} from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import compass components
import CommandDashboard from "@/components/strategic-compass/CommandDashboard";
import IntentModule from "@/components/strategic-compass/IntentModule";
import BehaviorModule from "@/components/strategic-compass/BehaviorModule";
import AnalysisEngine from "@/components/strategic-compass/AnalysisEngine";
import CEODashboard from "@/components/strategic-compass/CEODashboard";
import MentalPrism from "@/components/strategic-compass/MentalPrism";
import PrismResponse from "@/components/strategic-compass/PrismResponse";
import StrategicBetting from "@/components/strategic-compass/StrategicBetting";
import DecisionJournal from "@/components/strategic-compass/DecisionJournal";
import UserManagement from "@/components/strategic-compass/UserManagement";

type CompassRole = 'ceo' | 'deputy' | 'manager' | null;

const StrategicCompass = () => {
  const [compassRole, setCompassRole] = useState<CompassRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("command");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkCompassRole();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkCompassRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('compass_user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking compass role:', error);
      }

      if (data) {
        setCompassRole(data.role as CompassRole);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCompassRole(null);
    navigate('/dashboard');
  };


  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <AuroraBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 flex flex-col items-center gap-4"
        >
          <Compass className="w-16 h-16 text-primary animate-spin" />
          <p className="text-foreground">در حال بارگذاری...</p>
        </motion.div>
      </div>
    );
  }

  // Show no access message if user has no compass role
  if (!compassRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <AuroraBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 flex flex-col items-center gap-6 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">دسترسی محدود</h2>
            <p className="text-muted-foreground">
              شما هنوز نقشی در قطب نمای استراتژی ندارید. لطفاً با مدیر سیستم تماس بگیرید.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="border-border"
            >
              بازگشت به داشبورد
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isCEO = compassRole === 'ceo';
  const isDeputy = compassRole === 'deputy';
  const isManager = compassRole === 'manager';

  const getTabs = () => {
    const baseTabs = [];
    
    if (isCEO) {
      baseTabs.push(
        { id: "command", label: "داشبورد فرمان", icon: Target },
        { id: "intent", label: "ماژول فرمان", icon: Zap },
        { id: "analysis", label: "موتور تحلیل", icon: Brain },
        { id: "ceo-dashboard", label: "داشبورد مدیرعامل", icon: BarChart3 },
        { id: "mental-prism", label: "منشور ذهنی", icon: Eye },
        { id: "betting", label: "شرط‌بندی استراتژیک", icon: Coins },
        { id: "users", label: "مدیریت کاربران", icon: Users },
      );
    } else if (isDeputy || isManager) {
      baseTabs.push(
        { id: "behavior", label: "ماژول رفتار", icon: Activity },
        { id: "mental-prism", label: "منشور ذهنی", icon: Eye },
        { id: "journal", label: "ژورنال تصمیم", icon: FileText },
        { id: "betting", label: "شرط‌بندی استراتژیک", icon: Coins },
      );
    }
    
    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <>
      <Helmet>
        <title>قطب نمای استراتژی | رصدخانه استراتژیک</title>
        <meta 
          name="description" 
          content="سیستم رصدخانه استراتژیک برای همسوسازی تیم مدیریتی با نیت‌های استراتژیک سازمان" 
        />
      </Helmet>
      
      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="border-border bg-secondary/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">قطب نمای استراتژی</h1>
                  <p className="text-sm text-muted-foreground">
                    رصدخانه استراتژیک • 
                    {isCEO && " مدیرعامل"}
                    {isDeputy && " معاون"}
                    {isManager && " مدیرکل"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{user?.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-border bg-secondary/50 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="glass-card w-full flex flex-wrap justify-start gap-1 p-2 mb-6 h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* CEO Tabs */}
              {isCEO && (
                <>
                  <TabsContent value="command">
                    <CommandDashboard />
                  </TabsContent>
                  <TabsContent value="intent">
                    <IntentModule />
                  </TabsContent>
                  <TabsContent value="analysis">
                    <AnalysisEngine />
                  </TabsContent>
                  <TabsContent value="ceo-dashboard">
                    <CEODashboard />
                  </TabsContent>
                  <TabsContent value="mental-prism">
                    <MentalPrism />
                  </TabsContent>
                  <TabsContent value="betting">
                    <StrategicBetting userRole={compassRole} />
                  </TabsContent>
                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>
                </>
              )}

              {/* Deputy/Manager Tabs */}
              {(isDeputy || isManager) && (
                <>
                  <TabsContent value="behavior">
                    <BehaviorModule />
                  </TabsContent>
                  <TabsContent value="mental-prism">
                    <PrismResponse />
                  </TabsContent>
                  <TabsContent value="journal">
                    <DecisionJournal />
                  </TabsContent>
                  <TabsContent value="betting">
                    <StrategicBetting userRole={compassRole} />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StrategicCompass;
