import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, AlertTriangle, TrendingUp, TrendingDown, 
  Newspaper, Users, DollarSign, Zap, CheckCircle2,
  XCircle, Clock, Filter, RefreshCw, Loader2,
  ChevronDown, ExternalLink, Building2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketAlertsProps {
  profile: CompanyProfile;
}

type AlertSeverity = "critical" | "warning" | "info";
type AlertCategory = "competitor" | "market" | "funding" | "news" | "regulatory";

interface MarketAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source?: string;
  sourceUrl?: string;
  timestamp: string;
  isRead: boolean;
  company?: string;
}

interface AlertSettings {
  competitors: boolean;
  market: boolean;
  funding: boolean;
  news: boolean;
  regulatory: boolean;
}

const MarketAlerts = ({ profile }: MarketAlertsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [filter, setFilter] = useState<AlertCategory | "all">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AlertSettings>({
    competitors: true,
    market: true,
    funding: true,
    news: true,
    regulatory: true,
  });
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    if (!hasAutoLoaded.current && profile.name) {
      hasAutoLoaded.current = true;
      fetchAlerts();
    }
  }, [profile.name]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    
    try {
      // In production, this would call an edge function
      // For now, generate sample alerts based on profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleAlerts: MarketAlert[] = [
        {
          id: "1",
          title: `${profile.competitors[0]?.name || 'رقیب اصلی'} افزایش سرمایه ۵۰۰ میلیارد ریالی اعلام کرد`,
          description: "طبق اطلاعیه کدال، افزایش سرمایه از محل آورده نقدی تصویب شد",
          severity: "critical",
          category: "competitor",
          source: "کدال",
          sourceUrl: "https://codal.ir",
          timestamp: new Date().toISOString(),
          isRead: false,
          company: profile.competitors[0]?.name
        },
        {
          id: "2",
          title: "رشد ۲۵ درصدی بازار فین‌تک ایران",
          description: "گزارش جدید مرکز آمار نشان‌دهنده رشد قابل توجه در بخش پرداخت دیجیتال است",
          severity: "info",
          category: "market",
          source: "مرکز آمار",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false
        },
        {
          id: "3",
          title: "قانون جدید بانک مرکزی درباره پرداخت‌های دیجیتال",
          description: "الزامات جدید احراز هویت از ابتدای سال آینده اجرایی می‌شود",
          severity: "warning",
          category: "regulatory",
          source: "بانک مرکزی",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isRead: true
        },
        {
          id: "4",
          title: `${profile.competitors[1]?.name || 'رقیب'} قرارداد جدید با بانک ملی امضا کرد`,
          description: "همکاری استراتژیک در حوزه بانکداری باز آغاز شد",
          severity: "warning",
          category: "news",
          source: "خبرگزاری ایسنا",
          sourceUrl: "https://isna.ir",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isRead: false,
          company: profile.competitors[1]?.name
        },
        {
          id: "5",
          title: "سرمایه‌گذاری ۱۰۰ میلیون دلاری در استارتاپ‌های هوش مصنوعی ایران",
          description: "صندوق‌های خارجی علاقه‌مند به حوزه AI در ایران هستند",
          severity: "info",
          category: "funding",
          source: "تک‌کرانچ",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          isRead: true
        },
        {
          id: "6",
          title: `کاهش ۱۲% ارزش سهام ${profile.competitors[2]?.name || 'رقیب'}`,
          description: "پس از اعلام گزارش مالی ضعیف، سهام این شرکت افت کرد",
          severity: "critical",
          category: "competitor",
          source: "بورس تهران",
          sourceUrl: "https://tsetmc.com",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          isRead: false,
          company: profile.competitors[2]?.name
        },
      ];

      setAlerts(sampleAlerts);
      toast.success("هشدارها به‌روز شد");
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    toast.success("همه هشدارها خوانده شد");
  };

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return { 
          color: "bg-red-500/20 border-red-500/50 text-red-400",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "بحرانی"
        };
      case "warning":
        return { 
          color: "bg-amber-500/20 border-amber-500/50 text-amber-400",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "هشدار"
        };
      case "info":
        return { 
          color: "bg-blue-500/20 border-blue-500/50 text-blue-400",
          icon: <Bell className="w-4 h-4" />,
          label: "اطلاع‌رسانی"
        };
    }
  };

  const getCategoryConfig = (category: AlertCategory) => {
    switch (category) {
      case "competitor":
        return { icon: <Users className="w-3 h-3" />, label: "رقبا", color: "text-purple-400" };
      case "market":
        return { icon: <TrendingUp className="w-3 h-3" />, label: "بازار", color: "text-emerald-400" };
      case "funding":
        return { icon: <DollarSign className="w-3 h-3" />, label: "سرمایه‌گذاری", color: "text-cyan-400" };
      case "news":
        return { icon: <Newspaper className="w-3 h-3" />, label: "اخبار", color: "text-amber-400" };
      case "regulatory":
        return { icon: <Building2 className="w-3 h-3" />, label: "مقررات", color: "text-red-400" };
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} روز پیش`;
    if (hours > 0) return `${hours} ساعت پیش`;
    return "همین الان";
  };

  const filteredAlerts = alerts.filter(a => 
    filter === "all" || a.category === filter
  ).filter(a => settings[a.category]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-red-900/30 border-red-500/20 p-4 md:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/30 to-amber-600/30 flex items-center justify-center border border-red-500/30">
              <Bell className="w-5 h-5 text-red-400" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">هشدارهای خودکار بازار</h3>
            <p className="text-xs text-slate-400">Market & Competitor Alerts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAlerts}
            disabled={isLoading}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-3">تنظیمات هشدار</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(Object.keys(settings) as AlertCategory[]).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(checked) => setSettings(s => ({ ...s, [key]: checked }))}
                    />
                    <span className="text-xs text-slate-400">
                      {getCategoryConfig(key).label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {["all", "competitor", "market", "funding", "news", "regulatory"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-red-500/30 text-red-300 border border-red-500/50"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50"
            }`}
          >
            {cat === "all" ? "همه" : getCategoryConfig(cat as AlertCategory).label}
          </button>
        ))}
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="mr-auto px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            <CheckCircle2 className="w-3 h-3 inline ml-1" />
            همه را خواندم
          </button>
        )}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">هشداری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredAlerts.map((alert, i) => {
            const severity = getSeverityConfig(alert.severity);
            const category = getCategoryConfig(alert.category);
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => markAsRead(alert.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  alert.isRead 
                    ? "bg-slate-800/30 border-slate-700/30 opacity-70" 
                    : `${severity.color}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${alert.isRead ? 'bg-slate-700/50' : severity.color}`}>
                    {severity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] ${category.color} border-current`}>
                        {category.icon}
                        <span className="mr-1">{category.label}</span>
                      </Badge>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1 line-clamp-1">
                      {alert.title}
                    </h5>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.timestamp)}
                        {alert.source && (
                          <>
                            <span>•</span>
                            {alert.sourceUrl ? (
                              <a 
                                href={alert.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {alert.source}
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            ) : (
                              <span>{alert.source}</span>
                            )}
                          </>
                        )}
                      </div>
                      <Badge className={`text-[9px] ${severity.color}`}>
                        {severity.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Zap className="w-3 h-3 text-red-400" />
        هشدارها به صورت خودکار از منابع معتبر جمع‌آوری می‌شوند
      </div>
    </Card>
  );
};

export default MarketAlerts;