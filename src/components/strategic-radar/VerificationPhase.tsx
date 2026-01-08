import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Edit2, ArrowRight, Sparkles, DollarSign, Target, ExternalLink, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface VerificationPhaseProps {
  profile: CompanyProfile;
  onComplete: (profile: CompanyProfile) => void;
  onBack: () => void;
}

const strategicGoals = [
  { value: "market_leader", label: "رهبری بازار", icon: "👑" },
  { value: "ipo", label: "عرضه اولیه (IPO)", icon: "📈" },
  { value: "survival", label: "بقا و ثبات", icon: "🛡️" },
  { value: "global_expansion", label: "گسترش جهانی", icon: "🌍" },
  { value: "acquisition", label: "خرید و ادغام", icon: "🤝" },
  { value: "innovation", label: "نوآوری محصول", icon: "💡" },
];

const cashLevels = [
  { value: "high", label: "بالا (بیش از ۱۰۰ میلیارد)", color: "text-emerald-400" },
  { value: "medium", label: "متوسط (۲۰ تا ۱۰۰ میلیارد)", color: "text-yellow-400" },
  { value: "low", label: "پایین (کمتر از ۲۰ میلیارد)", color: "text-orange-400" },
  { value: "critical", label: "بحرانی (زیر ۵ میلیارد)", color: "text-red-400" },
];

const VerificationPhase = ({ profile, onComplete, onBack }: VerificationPhaseProps) => {
  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (field: keyof CompanyProfile, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onComplete(editedProfile);
  };

  const getDataQualityBadge = () => {
    const quality = profile.dataQuality || 'low';
    const config = {
      high: { label: 'کیفیت بالا', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      medium: { label: 'کیفیت متوسط', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      low: { label: 'کیفیت پایین', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    return config[quality];
  };

  const qualityBadge = getDataQualityBadge();

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center px-4 py-12" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              تحقیق تکمیل شد!
            </h2>
            <p className="text-slate-400 mb-3">
              لطفاً اطلاعات زیر را بررسی و تأیید کنید
            </p>
            
            {/* Data Quality Badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge className={`${qualityBadge.color} border`}>
                {qualityBadge.label}
              </Badge>
              {profile.isEstimate && (
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3 ml-1" />
                  شامل تخمین AI
                </Badge>
              )}
            </div>

            {/* Research Meta */}
            {profile.researchMeta && (
              <p className="text-slate-500 text-xs mt-2">
                {profile.researchMeta.queriesRun} جستجو • {profile.researchMeta.sourcesFound} منبع • {Math.round(profile.researchMeta.processingTimeMs / 1000)} ثانیه
              </p>
            )}
          </div>

          {/* Main Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl" />
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
              {/* Company Header */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                    {editedProfile.logo}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editedProfile.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-white text-xl font-bold"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white">{editedProfile.name}</h3>
                    )}
                    <p className="text-cyan-400 font-mono text-sm">{editedProfile.ticker}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-slate-400 hover:text-cyan-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Fetched Data with Sources */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DataFieldWithSource
                    label="صنعت"
                    value={editedProfile.industry}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange("industry", v)}
                  />
                  <DataFieldWithSource
                    label="بخش"
                    value={editedProfile.sector}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange("sector", v)}
                  />
                  <DataFieldWithSource
                    label="درآمد"
                    value={editedProfile.revenue}
                    source={editedProfile.revenueSource}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange("revenue", v)}
                  />
                  <DataFieldWithSource
                    label="امتیاز بلوغ"
                    value={`${editedProfile.maturityScore}%`}
                    source={editedProfile.maturitySource}
                    isEditing={false}
                    onChange={() => {}}
                  />
                </div>

                {/* Additional Research Data */}
                {(profile.subscriberCount || profile.marketShare) && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                    {profile.subscriberCount && profile.subscriberCount !== 'نامشخص' && (
                      <DataFieldWithSource
                        label="تعداد مشترکین/کاربران"
                        value={profile.subscriberCount}
                        source={profile.subscriberSource}
                        isEditing={false}
                        onChange={() => {}}
                      />
                    )}
                    {profile.marketShare !== undefined && profile.marketShare > 0 && (
                      <DataFieldWithSource
                        label="سهم بازار"
                        value={`${profile.marketShare}%`}
                        source={profile.marketShareSource}
                        isEditing={false}
                        onChange={() => {}}
                      />
                    )}
                  </div>
                )}

                {/* Competitors */}
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-2">رقبای اصلی</p>
                  <div className="flex flex-wrap gap-2">
                    {editedProfile.competitors.map((c, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Badge className="bg-slate-800 text-white border border-slate-700 cursor-help">
                            {c.name}
                            {c.source && <Info className="w-3 h-3 mr-1 text-slate-500" />}
                          </Badge>
                        </TooltipTrigger>
                        {c.source && (
                          <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                            <p className="text-xs">منبع: {c.source}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Recent News */}
                {profile.recentNews && profile.recentNews.length > 0 && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-500 text-sm mb-2">آخرین اخبار</p>
                    <div className="space-y-2">
                      {profile.recentNews.slice(0, 3).map((news, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-cyan-400">•</span>
                          <span className="text-slate-300">{news.title}</span>
                          <span className="text-slate-500 text-xs">({news.source})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations */}
                {profile.citations && profile.citations.length > 0 && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-500 text-sm mb-2">منابع ({profile.citations.length})</p>
                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                      {profile.citations.slice(0, 5).map((citation, i) => (
                        <a
                          key={i}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {new URL(citation).hostname.replace('www.', '')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Critical Missing Info Section */}
              <div className="p-6 border-t border-slate-700/50 bg-gradient-to-b from-slate-800/30 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-white font-semibold">
                    برای تولید استراتژی دقیق، لطفاً تکمیل کنید:
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Cash Liquidity */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      نقدینگی در دسترس (اختیاری)
                    </Label>
                    <Select
                      value={editedProfile.cashLiquidity}
                      onValueChange={(v) => handleFieldChange("cashLiquidity", v)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="سطح نقدینگی را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {cashLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="text-white hover:bg-slate-700">
                            <span className={level.color}>{level.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Strategic Goal */}
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      هدف استراتژیک اصلی
                    </Label>
                    <Select
                      value={editedProfile.strategicGoal}
                      onValueChange={(v) => handleFieldChange("strategicGoal", v)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="هدف اصلی را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {strategicGoals.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value} className="text-white hover:bg-slate-700">
                            <span className="flex items-center gap-2">
                              <span>{goal.icon}</span>
                              {goal.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-700/50 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  اسکن مجدد
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-6"
                >
                  <Sparkles className="w-5 h-5 ml-2" />
                  راه‌اندازی اتاق جنگ
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

interface DataFieldWithSourceProps {
  label: string;
  value: string;
  source?: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

const DataFieldWithSource = ({ label, value, source, isEditing, onChange }: DataFieldWithSourceProps) => (
  <TooltipProvider>
    <div className="space-y-1">
      <p className="text-slate-500 text-sm">{label}</p>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white"
        />
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-white font-medium">{value || 'نامشخص'}</p>
          {source && source !== 'نامشخص' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-cyan-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 border-slate-700 text-white max-w-xs">
                <p className="text-xs">منبع: {source}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  </TooltipProvider>
);

export default VerificationPhase;
