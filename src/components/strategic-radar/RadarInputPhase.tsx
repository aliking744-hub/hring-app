import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Radar, ArrowLeft, History, Trash2, Clock, AlertCircle, Sparkles, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanyProfile } from "@/pages/StrategicRadar";
import { Link } from "react-router-dom";
import { format } from "date-fns-jalali";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoredAnalysis {
  id: string;
  company_name: string;
  company_ticker: string | null;
  company_logo: string | null;
  industry: string | null;
  sector: string | null;
  competitors: { name: string; marketShare: number; innovation: number }[];
  revenue: string | null;
  revenue_value: number | null;
  cash_liquidity: string | null;
  strategic_goal: string | null;
  technology_lag: number;
  maturity_score: number;
  created_at: string;
}

interface RadarInputPhaseProps {
  onScanComplete: (profile: CompanyProfile) => void;
  onStartConfigWizard?: () => void;
  savedAnalyses: StoredAnalysis[];
  isLoadingHistory: boolean;
  onLoadAnalysis: (analysis: StoredAnalysis) => void;
  onDeleteAnalysis: (id: string) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const RadarInputPhase = ({ 
  onScanComplete, 
  onStartConfigWizard,
  savedAnalyses, 
  isLoadingHistory,
  onLoadAnalysis,
  onDeleteAnalysis,
  showHistory,
  setShowHistory 
}: RadarInputPhaseProps) => {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const handleScan = async () => {
    if (!query.trim()) return;

    setIsScanning(true);
    setScanStatus("در حال جستجو در کدال و منابع مالی...");

    try {
      // Call the edge function to fetch real company data
      const { data, error } = await supabase.functions.invoke('fetch-company-intel', {
        body: { companyName: query.trim() }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.');
        setIsScanning(false);
        return;
      }

      if (!data.success) {
        console.error('API error:', data.error);
        toast.error(data.error || 'خطا در دریافت اطلاعات');
        setIsScanning(false);
        return;
      }

      setScanStatus("در حال تحلیل رقبا و بازار...");
      
      const intel = data.data;
      
      const profile: CompanyProfile = {
        name: intel.name,
        ticker: intel.ticker || query.toUpperCase().slice(0, 4),
        logo: intel.logo || "🏢",
        industry: intel.industry,
        sector: intel.sector,
        competitors: intel.competitors,
        revenue: intel.revenue,
        revenueValue: intel.revenueValue,
        cashLiquidity: intel.cashLiquidity,
        technologyLag: intel.technologyLag,
        maturityScore: intel.maturityScore,
        citations: data.citations || [], // Store API sources
      };

      setIsScanning(false);
      setScanStatus("");
      onScanComplete(profile);
      
    } catch (err) {
      console.error('Error during scan:', err);
      toast.error('خطای غیرمنتظره. لطفاً دوباره تلاش کنید.');
      setIsScanning(false);
      setScanStatus("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" dir="rtl">
      {/* Back Button & History Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {savedAnalyses.length > 0 && (
          <Button 
            variant="ghost" 
            onClick={() => setShowHistory(!showHistory)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
          >
            <History className="w-4 h-4 ml-2" />
            تاریخچه ({savedAnalyses.length})
          </Button>
        )}
        <Link to="/dashboard">
          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30">
            <ArrowLeft className="w-4 h-4 ml-2" />
            بازگشت
          </Button>
        </Link>
      </div>

      {/* History Panel */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 overflow-y-auto"
        >
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">تحلیل‌های قبلی</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                ✕
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {isLoadingHistory ? (
              <div className="text-slate-400 text-center py-8">در حال بارگذاری...</div>
            ) : savedAnalyses.length === 0 ? (
              <div className="text-slate-400 text-center py-8">تحلیلی یافت نشد</div>
            ) : (
              savedAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors cursor-pointer group"
                  onClick={() => onLoadAnalysis(analysis)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{analysis.company_logo || "🏢"}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{analysis.company_name}</p>
                        <p className="text-slate-500 text-xs">{analysis.industry}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnalysis(analysis.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {format(new Date(analysis.created_at), "yyyy/MM/dd - HH:mm")}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
          <Radar className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          رادار اطلاعات استراتژیک
        </h1>
        <p className="text-slate-400 text-lg">
          تحلیل هوشمند رقبا و کشف فرصت‌های بازار
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xl"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="نام شرکت یا نماد بورسی را وارد کنید..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="w-full pr-12 pl-4 py-4 bg-transparent border-0 text-white placeholder:text-slate-500 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isScanning}
                />
              </div>
              
              <Button
                onClick={handleScan}
                disabled={!query.trim() || isScanning}
                className="px-6 py-4 h-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <RadarScanAnimation />
                    در حال اسکن...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Radar className="w-5 h-5" />
                    اسکن بازار
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          <span className="text-slate-500 text-sm">پیشنهادات:</span>
          {["ایران خودرو", "فولاد مبارکه", "بانک ملت", "دیجی‌کالا", "همراه اول"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-1 text-sm bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 rounded-full border border-slate-700/50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>

        {/* Config Wizard Option */}
        {onStartConfigWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-lg" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-medium">شرکت خصوصی هستید؟</span>
                </div>
                <p className="text-slate-400 text-sm mb-4 max-w-md">
                  برای شرکت‌های خصوصی یا استارتاپ‌ها که اطلاعات عمومی ندارند، از ویزارد پیکربندی استفاده کنید تا داده‌های واقعی خود را وارد کنید.
                </p>
                <Button
                  onClick={onStartConfigWizard}
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  ورود دستی اطلاعات (پیشنهادی)
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Scanning Overlay */}
      {isScanning && <ScanningOverlay />}
    </div>
  );
};

const RadarScanAnimation = () => (
  <div className="relative w-5 h-5">
    <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full" />
    <div className="absolute inset-0 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
  </div>
);

const ScanningOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
  >
    <div className="text-center">
      {/* Radar Animation */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        {/* Outer rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 border border-cyan-500/20 rounded-full"
            style={{ transform: `scale(${0.4 + ring * 0.2})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.3 }}
          />
        ))}
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        
        {/* Scanning line */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
          style={{
            background: "linear-gradient(90deg, rgba(34,211,238,0.8), transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.p
        className="text-cyan-400 font-mono text-lg"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        در حال تحلیل بازار...
      </motion.p>
      
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-2">
          {["جستجو در کدال", "بررسی سایت بورس", "تحلیل رقبا"].map((step, i) => (
            <motion.span
              key={step}
              className="text-slate-500 text-sm font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 1.5 }}
            >
              ✓ {step}
            </motion.span>
          ))}
        </div>
        <p className="text-slate-600 text-xs">
          منابع: کدال، بورس تهران، خبرگزاری‌ها
        </p>
      </div>
    </div>
  </motion.div>
);

export default RadarInputPhase;
