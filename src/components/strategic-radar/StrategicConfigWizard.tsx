import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  DollarSign, 
  Cpu, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Shield,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface StrategicConfigWizardProps {
  initialProfile?: Partial<CompanyProfile>;
  onComplete: (config: StrategicConfig) => void;
  onBack: () => void;
}

export interface StrategicConfig {
  // Identity
  companyName: string;
  industry: string;
  sector: string;
  
  // Financials
  annualRevenue: number;
  currency: "IRR" | "TOMAN" | "USD";
  marketPosition: "leader" | "challenger" | "niche" | "follower";
  isPublicCompany: boolean;
  tickerSymbol?: string;
  
  // Technology
  currentTechStack: string[];
  missingCapabilities: string[];
  techMaturityScore: number;
  
  // Competitors
  competitors: Array<{
    name: string;
    estimatedMarketShare?: number;
  }>;
  
  // Features
  enablePatentSection: boolean;
  enableNewsSection: boolean;
  strategicGoal?: string;
}

const STEPS = [
  { id: 1, title: "هویت و مالی", icon: Building2 },
  { id: 2, title: "فناوری", icon: Cpu },
  { id: 3, title: "رقبا", icon: Users },
  { id: 4, title: "تنظیمات", icon: Zap },
];

const TECH_SUGGESTIONS = [
  "Python", "Java", "React", "Node.js", "AWS", "Azure", "GCP", 
  "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis",
  "4G/LTE", "5G", "IoT", "Microservices", "REST API", "GraphQL"
];

const CAPABILITY_SUGGESTIONS = [
  "هوش مصنوعی (AI/ML)", "یادگیری عمیق", "پردازش زبان طبیعی", 
  "Big Data", "Blockchain", "5G", "Edge Computing",
  "DevOps/CI-CD", "Cloud Native", "Real-time Analytics",
  "Cybersecurity", "اتوماسیون فرآیند", "API Economy"
];

const StrategicConfigWizard = ({ initialProfile, onComplete, onBack }: StrategicConfigWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<StrategicConfig>({
    companyName: initialProfile?.name || "",
    industry: initialProfile?.industry || "",
    sector: initialProfile?.sector || "",
    annualRevenue: initialProfile?.revenueValue || 0,
    currency: "TOMAN",
    marketPosition: "challenger",
    isPublicCompany: !!initialProfile?.ticker,
    tickerSymbol: initialProfile?.ticker || "",
    currentTechStack: [],
    missingCapabilities: [],
    techMaturityScore: 50,
    competitors: initialProfile?.competitors?.map(c => ({ 
      name: c.name, 
      estimatedMarketShare: c.marketShare 
    })) || [{ name: "", estimatedMarketShare: undefined }],
    enablePatentSection: false,
    enableNewsSection: true,
    strategicGoal: initialProfile?.strategicGoal || "",
  });
  
  const [techInput, setTechInput] = useState("");
  const [capabilityInput, setCapabilityInput] = useState("");

  const updateConfig = <K extends keyof StrategicConfig>(key: K, value: StrategicConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addTech = (tech: string) => {
    if (tech && !config.currentTechStack.includes(tech)) {
      updateConfig("currentTechStack", [...config.currentTechStack, tech]);
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    updateConfig("currentTechStack", config.currentTechStack.filter(t => t !== tech));
  };

  const addCapability = (cap: string) => {
    if (cap && !config.missingCapabilities.includes(cap)) {
      updateConfig("missingCapabilities", [...config.missingCapabilities, cap]);
    }
    setCapabilityInput("");
  };

  const removeCapability = (cap: string) => {
    updateConfig("missingCapabilities", config.missingCapabilities.filter(c => c !== cap));
  };

  const addCompetitor = () => {
    if (config.competitors.length < 5) {
      updateConfig("competitors", [...config.competitors, { name: "", estimatedMarketShare: undefined }]);
    }
  };

  const updateCompetitor = (index: number, field: "name" | "estimatedMarketShare", value: string | number) => {
    const updated = [...config.competitors];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig("competitors", updated);
  };

  const removeCompetitor = (index: number) => {
    if (config.competitors.length > 1) {
      updateConfig("competitors", config.competitors.filter((_, i) => i !== index));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.companyName.trim() !== "" && config.annualRevenue > 0;
      case 2:
        return config.currentTechStack.length > 0;
      case 3:
        return config.competitors.some(c => c.name.trim() !== "");
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Filter out empty competitors
      const filteredConfig = {
        ...config,
        competitors: config.competitors.filter(c => c.name.trim() !== "")
      };
      onComplete(filteredConfig);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const formatRevenue = (value: number, currency: string) => {
    if (value === 0) return "";
    const formatted = value.toLocaleString("fa-IR");
    const unit = currency === "USD" ? "دلار" : currency === "TOMAN" ? "تومان" : "ریال";
    return `${formatted} ${unit}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">پیکربندی استراتژیک</h1>
          <p className="text-slate-400">داده‌های واقعی وارد کنید تا تحلیل دقیق دریافت کنید</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  currentStep === step.id
                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                    : currentStep > step.id
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 cursor-pointer"
                    : "bg-slate-800/50 border border-slate-700/50 text-slate-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  currentStep > step.id ? "bg-emerald-500/50" : "bg-slate-700"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Identity & Financials */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 flex items-center justify-center border border-blue-500/30">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">هویت و اطلاعات مالی</h2>
                    <p className="text-sm text-slate-400">اطلاعات پایه شرکت خود را وارد کنید</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">نام شرکت *</Label>
                    <Input
                      value={config.companyName}
                      onChange={(e) => updateConfig("companyName", e.target.value)}
                      placeholder="مثال: تالیا"
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">صنعت</Label>
                    <Input
                      value={config.industry}
                      onChange={(e) => updateConfig("industry", e.target.value)}
                      placeholder="مثال: مخابرات"
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">درآمد سالانه *</Label>
                    <Input
                      type="number"
                      value={config.annualRevenue || ""}
                      onChange={(e) => updateConfig("annualRevenue", Number(e.target.value))}
                      placeholder="مبلغ به عدد"
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">واحد پول</Label>
                    <Select 
                      value={config.currency} 
                      onValueChange={(v) => updateConfig("currency", v as "IRR" | "TOMAN" | "USD")}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOMAN">تومان</SelectItem>
                        <SelectItem value="IRR">ریال</SelectItem>
                        <SelectItem value="USD">دلار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">جایگاه بازار</Label>
                    <Select 
                      value={config.marketPosition} 
                      onValueChange={(v) => updateConfig("marketPosition", v as any)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leader">رهبر بازار (Leader)</SelectItem>
                        <SelectItem value="challenger">چالشگر (Challenger)</SelectItem>
                        <SelectItem value="niche">بازار خاص (Niche)</SelectItem>
                        <SelectItem value="follower">پیرو (Follower)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <Switch
                    checked={config.isPublicCompany}
                    onCheckedChange={(v) => updateConfig("isPublicCompany", v)}
                  />
                  <div className="flex-1">
                    <Label className="text-slate-300">شرکت بورسی</Label>
                    <p className="text-xs text-slate-500">آیا در بورس تهران یا فرابورس پذیرفته شده‌اید؟</p>
                  </div>
                  {config.isPublicCompany && (
                    <Input
                      value={config.tickerSymbol}
                      onChange={(e) => updateConfig("tickerSymbol", e.target.value)}
                      placeholder="نماد بورسی"
                      className="w-32 bg-slate-800/50 border-slate-600 text-white"
                    />
                  )}
                </div>

                {config.annualRevenue > 0 && (
                  <div className="text-sm text-slate-400 text-center">
                    درآمد وارد شده: <span className="text-cyan-400 font-medium">{formatRevenue(config.annualRevenue, config.currency)}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Technology */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 flex items-center justify-center border border-purple-500/30">
                    <Cpu className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">فناوری و قابلیت‌ها</h2>
                    <p className="text-sm text-slate-400">وضعیت فناوری سازمان خود را مشخص کنید</p>
                  </div>
                </div>

                {/* Current Tech Stack */}
                <div className="space-y-3">
                  <Label className="text-slate-300">استک فناوری فعلی *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTech(techInput)}
                      placeholder="تایپ کنید و Enter بزنید..."
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => addTech(techInput)}
                      className="border-purple-500/30 text-purple-400"
                    >
                      افزودن
                    </Button>
                  </div>
                  
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {TECH_SUGGESTIONS.filter(t => !config.currentTechStack.includes(t)).slice(0, 8).map(tech => (
                      <button
                        key={tech}
                        onClick={() => addTech(tech)}
                        className="px-3 py-1 text-xs rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-purple-500/50 hover:text-purple-400 transition-colors"
                      >
                        + {tech}
                      </button>
                    ))}
                  </div>

                  {/* Selected */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {config.currentTechStack.map(tech => (
                      <Badge
                        key={tech}
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => removeTech(tech)}
                      >
                        {tech} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Capabilities */}
                <div className="space-y-3">
                  <Label className="text-slate-300">قابلیت‌های در حال توسعه / شکاف فناوری</Label>
                  <div className="flex gap-2">
                    <Input
                      value={capabilityInput}
                      onChange={(e) => setCapabilityInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCapability(capabilityInput)}
                      placeholder="چه فناوری‌هایی کم دارید؟"
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => addCapability(capabilityInput)}
                      className="border-amber-500/30 text-amber-400"
                    >
                      افزودن
                    </Button>
                  </div>
                  
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {CAPABILITY_SUGGESTIONS.filter(c => !config.missingCapabilities.includes(c)).slice(0, 6).map(cap => (
                      <button
                        key={cap}
                        onClick={() => addCapability(cap)}
                        className="px-3 py-1 text-xs rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                      >
                        + {cap}
                      </button>
                    ))}
                  </div>

                  {/* Selected */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {config.missingCapabilities.map(cap => (
                      <Badge
                        key={cap}
                        className="bg-amber-500/20 text-amber-400 border-amber-500/30 cursor-pointer hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => removeCapability(cap)}
                      >
                        {cap} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tech Maturity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">امتیاز بلوغ فناوری</Label>
                    <span className="text-cyan-400 font-mono">{config.techMaturityScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.techMaturityScore}
                    onChange={(e) => updateConfig("techMaturityScore", Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>سنتی</span>
                    <span>در حال تحول</span>
                    <span>پیشرو</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Competitors */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/30 flex items-center justify-center border border-red-500/30">
                    <Target className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">رقبای اصلی</h2>
                    <p className="text-sm text-slate-400">رقبای کلیدی خود را معرفی کنید</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {config.competitors.map((competitor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 text-sm font-medium">
                        {index + 1}
                      </div>
                      <Input
                        value={competitor.name}
                        onChange={(e) => updateCompetitor(index, "name", e.target.value)}
                        placeholder={`نام رقیب ${index + 1}`}
                        className="flex-1 bg-slate-800/50 border-slate-600 text-white"
                      />
                      <Input
                        type="number"
                        value={competitor.estimatedMarketShare || ""}
                        onChange={(e) => updateCompetitor(index, "estimatedMarketShare", Number(e.target.value))}
                        placeholder="سهم بازار %"
                        className="w-32 bg-slate-800/50 border-slate-600 text-white"
                      />
                      {config.competitors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCompetitor(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          ×
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {config.competitors.length < 5 && (
                  <Button
                    variant="outline"
                    onClick={addCompetitor}
                    className="w-full border-dashed border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400"
                  >
                    + افزودن رقیب دیگر
                  </Button>
                )}

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <strong className="text-blue-400">نکته:</strong> هر چه اطلاعات رقبا دقیق‌تر باشد، تحلیل‌های مقایسه‌ای و توصیه‌های استراتژیک بهتر خواهد بود.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 flex items-center justify-center border border-emerald-500/30">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">تنظیمات داشبورد</h2>
                    <p className="text-sm text-slate-400">ماژول‌ها و قابلیت‌های مورد نیاز خود را انتخاب کنید</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Patent Section Toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-slate-300">تحلیل پتنت و مالکیت فکری</Label>
                      <p className="text-xs text-slate-500">فقط برای شرکت‌های R&D و Deep-Tech فعال کنید</p>
                    </div>
                    <Switch
                      checked={config.enablePatentSection}
                      onCheckedChange={(v) => updateConfig("enablePatentSection", v)}
                    />
                  </div>

                  {/* News Section Toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-slate-300">رصد اخبار و رقبا (زنده)</Label>
                      <p className="text-xs text-slate-500">جستجوی اخبار واقعی با Firecrawl</p>
                    </div>
                    <Switch
                      checked={config.enableNewsSection}
                      onCheckedChange={(v) => updateConfig("enableNewsSection", v)}
                    />
                  </div>
                </div>

                {/* Strategic Goal */}
                <div className="space-y-2">
                  <Label className="text-slate-300">هدف استراتژیک اصلی (اختیاری)</Label>
                  <Input
                    value={config.strategicGoal}
                    onChange={(e) => updateConfig("strategicGoal", e.target.value)}
                    placeholder="مثال: تبدیل شدن به رهبر بازار در ۳ سال آینده"
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">خلاصه پیکربندی</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">شرکت:</div>
                    <div className="text-white">{config.companyName || "-"}</div>
                    <div className="text-slate-400">درآمد:</div>
                    <div className="text-white">{formatRevenue(config.annualRevenue, config.currency) || "-"}</div>
                    <div className="text-slate-400">فناوری‌ها:</div>
                    <div className="text-white">{config.currentTechStack.length} مورد</div>
                    <div className="text-slate-400">رقبا:</div>
                    <div className="text-white">{config.competitors.filter(c => c.name).length} شرکت</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4 ml-2" />
              {currentStep === 1 ? "بازگشت" : "مرحله قبل"}
            </Button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 === currentStep
                      ? "bg-cyan-400"
                      : i + 1 < currentStep
                      ? "bg-emerald-400"
                      : "bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
            >
              {currentStep === 4 ? (
                <>
                  شروع تحلیل
                  <Sparkles className="w-4 h-4 mr-2" />
                </>
              ) : (
                <>
                  مرحله بعد
                  <ChevronLeft className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StrategicConfigWizard;
