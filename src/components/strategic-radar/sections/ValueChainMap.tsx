import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  GitBranch, 
  Factory, 
  Truck, 
  Store, 
  Users, 
  Cpu, 
  TrendingUp,
  DollarSign,
  ExternalLink,
  Sparkles,
  Building2,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface ValueChainMapProps {
  profile: CompanyProfile;
}

interface ValueChainSegment {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  companies: CompanyNode[];
}

interface CompanyNode {
  name: string;
  type: "subsidiary" | "affiliate" | "partner" | "opportunity";
  ownership?: string;
  growthPotential?: "high" | "medium" | "low";
  recommendation?: string;
  investmentReason?: string;
}

interface InvestmentRecommendation {
  company: string;
  segment: string;
  reason: string;
  expectedReturn: string;
  riskLevel: "low" | "medium" | "high";
  synergy: string;
}

const ValueChainMap = ({ profile }: ValueChainMapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [valueChain, setValueChain] = useState<ValueChainSegment[]>([]);

  // Generate value chain based on industry
  useEffect(() => {
    generateValueChain();
  }, [profile]);

  const generateValueChain = () => {
    // Sample value chain - in production this would come from API
    const chain: ValueChainSegment[] = [
      {
        id: "suppliers",
        name: "تأمین‌کنندگان و مواد اولیه",
        icon: Factory,
        color: "from-orange-500/30 to-orange-600/30",
        companies: [
          { name: "شرکت تأمین اول", type: "partner", growthPotential: "medium" },
          { name: "فناوری‌های نوین تأمین", type: "opportunity", growthPotential: "high", recommendation: "پیشنهاد خرید" },
        ]
      },
      {
        id: "technology",
        name: "زیرساخت فناوری",
        icon: Cpu,
        color: "from-purple-500/30 to-purple-600/30",
        companies: [
          { name: "دیتاسنتر ابری", type: "subsidiary", ownership: "۶۰٪" },
          { name: "استارتاپ AI", type: "opportunity", growthPotential: "high", recommendation: "سرمایه‌گذاری" },
        ]
      },
      {
        id: "logistics",
        name: "لجستیک و توزیع",
        icon: Truck,
        color: "from-blue-500/30 to-blue-600/30",
        companies: [
          { name: "شرکت حمل و نقل", type: "affiliate", ownership: "۳۵٪" },
          { name: "پلتفرم درخواست لجستیک", type: "opportunity", growthPotential: "high", recommendation: "شراکت استراتژیک" },
        ]
      },
      {
        id: "sales",
        name: "فروش و بازاریابی",
        icon: Store,
        color: "from-emerald-500/30 to-emerald-600/30",
        companies: [
          { name: "آژانس دیجیتال مارکتینگ", type: "partner" },
          { name: "پلتفرم فروش B2B", type: "opportunity", growthPotential: "medium", recommendation: "ارزیابی بیشتر" },
        ]
      },
      {
        id: "customers",
        name: "خدمات مشتریان",
        icon: Users,
        color: "from-cyan-500/30 to-cyan-600/30",
        companies: [
          { name: "مرکز تماس هوشمند", type: "subsidiary", ownership: "۱۰۰٪" },
          { name: "چت‌بات AI", type: "opportunity", growthPotential: "high", recommendation: "خرید و ادغام" },
        ]
      },
    ];

    setValueChain(chain);

    // Generate investment recommendations
    const recs: InvestmentRecommendation[] = [
      {
        company: "استارتاپ AI در حوزه پردازش تصویر",
        segment: "زیرساخت فناوری",
        reason: "تکمیل زنجیره ارزش با قابلیت‌های هوش مصنوعی",
        expectedReturn: "۳۵-۵۰٪ در ۳ سال",
        riskLevel: "medium",
        synergy: "بهبود تجربه مشتری و اتوماسیون"
      },
      {
        company: "پلتفرم لجستیک سریع",
        segment: "لجستیک و توزیع",
        reason: "کاهش هزینه‌های تحویل و افزایش سرعت",
        expectedReturn: "۲۰-۳۰٪ در ۲ سال",
        riskLevel: "low",
        synergy: "یکپارچه‌سازی با سیستم‌های فعلی"
      },
      {
        company: "شرکت فین‌تک پرداخت",
        segment: "خدمات مالی",
        reason: "کاهش کارمزد تراکنش‌ها و جذب مشتری جدید",
        expectedReturn: "۲۵-۴۰٪ در ۳ سال",
        riskLevel: "medium",
        synergy: "اکوسیستم پرداخت یکپارچه"
      }
    ];

    setRecommendations(recs);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "subsidiary": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "affiliate": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "partner": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "opportunity": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "subsidiary": return "زیرمجموعه";
      case "affiliate": return "وابسته";
      case "partner": return "شریک";
      case "opportunity": return "فرصت سرمایه‌گذاری";
      default: return type;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-emerald-400";
      case "medium": return "text-amber-400";
      case "high": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 border-purple-500/20 p-4 md:p-6 h-full backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 flex items-center justify-center border border-purple-500/30">
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">نقشه زنجیره ارزش</h3>
            <p className="text-xs text-slate-400">شرکت‌های زیرمجموعه، وابسته و فرصت‌های سرمایه‌گذاری</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          <Building2 className="w-3 h-3 ml-1" />
          {profile.name}
        </Badge>
      </div>

      {/* Value Chain Visualization */}
      <div className="relative mb-6">
        {/* Central Company Node */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-purple-400 shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-center text-xs px-2">{profile.name}</span>
          </div>
        </div>

        {/* Value Chain Segments */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {valueChain.map((segment, idx) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-xl bg-gradient-to-br ${segment.color} border border-slate-700/50`}
            >
              {/* Segment Header */}
              <div className="flex items-center gap-2 mb-3">
                <segment.icon className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">{segment.name}</span>
              </div>

              {/* Companies in Segment */}
              <div className="space-y-2">
                {segment.companies.map((company, cIdx) => (
                  <div
                    key={cIdx}
                    className={`p-2 rounded-lg bg-slate-900/50 border ${getTypeColor(company.type)} cursor-pointer hover:scale-[1.02] transition-transform`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-medium">{company.name}</span>
                      {company.ownership && (
                        <span className="text-xs text-slate-400">{company.ownership}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getTypeColor(company.type)}`}>
                        {getTypeLabel(company.type)}
                      </Badge>
                      {company.growthPotential === "high" && (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    {company.recommendation && (
                      <div className="mt-1 text-[10px] text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-2 h-2" />
                        {company.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h4 className="text-white font-semibold">پیشنهادات سرمایه‌گذاری و خرید</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 to-transparent border border-amber-800/30"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-amber-400 font-medium text-sm">{rec.company}</h5>
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">{rec.segment}</Badge>
              </div>
              
              <p className="text-slate-300 text-xs mb-3">{rec.reason}</p>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">بازده مورد انتظار:</span>
                  <span className="text-emerald-400 font-medium">{rec.expectedReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سطح ریسک:</span>
                  <span className={`font-medium ${getRiskColor(rec.riskLevel)}`}>
                    {rec.riskLevel === "low" ? "کم" : rec.riskLevel === "medium" ? "متوسط" : "بالا"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">هم‌افزایی:</span>
                  <span className="text-purple-400">{rec.synergy}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Zap className="w-3 h-3 text-purple-400" />
        تحلیل با Perplexity AI - شناسایی فرصت‌های M&A
      </div>
    </Card>
  );
};

export default ValueChainMap;
