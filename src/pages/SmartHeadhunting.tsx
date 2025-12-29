import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Crosshair, 
  Plus, 
  Upload, 
  Play, 
  Pause, 
  MoreHorizontal,
  FileSpreadsheet,
  Zap,
  ChevronRight,
  ArrowLeft,
  FileText,
  Target,
  Users,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

// Initial campaigns start empty (no demo / fake data)
const initialCampaigns: any[] = [];


const CAMPAIGNS_STORAGE_KEY = "smart_headhunting_campaigns";

const SmartHeadhunting = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return initialCampaigns;
  });
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [autoHeadhunting, setAutoHeadhunting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    jobTitle: "",
    seniorityLevel: "",
    city: "",
    skills: "",
    experience: "",
    industry: "",
    description: "",
  });

  // File upload states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "excel":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
            <FileSpreadsheet className="w-3 h-3 ml-1" />
            Excel
          </Badge>
        );
      case "pdf":
        return (
          <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30">
            <FileText className="w-3 h-3 ml-1" />
            PDF
          </Badge>
        );
      case "api":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
            <Zap className="w-3 h-3 ml-1" />
            API
          </Badge>
        );
      case "auto":
        return (
          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30">
            <Target className="w-3 h-3 ml-1" />
            هوش مصنوعی
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full ml-1.5 animate-pulse" />
          فعال
        </Badge>
      );
    }
    if (status === "processing") {
      return (
        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full ml-1.5 animate-pulse" />
          در حال پردازش
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Pause className="w-3 h-3 ml-1" />
        متوقف
      </Badge>
    );
  };

  // Smart column name detection - finds columns regardless of position
  const findColumnValue = (row: any, patterns: string[]): string => {
    // First try exact key match (case insensitive)
    for (const key of Object.keys(row)) {
      const keyLower = key.toLowerCase().trim();
      for (const pattern of patterns) {
        if (keyLower === pattern.toLowerCase()) {
          return (row[key] ?? '').toString().trim();
        }
      }
    }
    // Then try partial match (key contains pattern)
    for (const key of Object.keys(row)) {
      const keyLower = key.toLowerCase().trim();
      for (const pattern of patterns) {
        if (keyLower.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(keyLower)) {
          return (row[key] ?? '').toString().trim();
        }
      }
    }
    return '';
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log("Excel raw data:", jsonData);
      console.log("Excel columns:", jsonData.length > 0 ? Object.keys(jsonData[0] as object) : []);
      
      if (jsonData.length > 100) {
        toast.error("حداکثر ۱۰۰ ردیف قابل پردازش است");
        return;
      }
      
      // Smart column mapping - searches for patterns in column names
      const namePatterns = ['نام', 'name', 'firstname', 'first_name', 'نام و نام خانوادگی', 'fullname', 'full_name', 'اسم', 'نام کامل'];
      const emailPatterns = ['ایمیل', 'email', 'e-mail', 'mail', 'پست الکترونیک', 'آدرس ایمیل'];
      const phonePatterns = ['تلفن', 'phone', 'mobile', 'موبایل', 'شماره تماس', 'شماره تلفن', 'همراه', 'tel', 'telephone'];
      const skillsPatterns = ['مهارت', 'skills', 'skill', 'توانایی', 'مهارت‌ها', 'تخصص'];
      const experiencePatterns = ['سابقه', 'experience', 'تجربه', 'سابقه کار', 'سال تجربه', 'years'];
      const educationPatterns = ['تحصیلات', 'education', 'مدرک', 'مدرک تحصیلی', 'degree', 'رشته'];
      const companyPatterns = ['شرکت', 'company', 'سازمان', 'آخرین شرکت', 'محل کار', 'employer', 'organization'];
      const locationPatterns = ['شهر', 'city', 'location', 'محل', 'محل زندگی', 'استان', 'آدرس'];
      
      const candidatesRaw = jsonData.map((row: any, index: number) => {
        const candidate = {
          name: findColumnValue(row, namePatterns),
          email: findColumnValue(row, emailPatterns),
          phone: findColumnValue(row, phonePatterns),
          skills: findColumnValue(row, skillsPatterns),
          experience: findColumnValue(row, experiencePatterns),
          education: findColumnValue(row, educationPatterns),
          lastCompany: findColumnValue(row, companyPatterns),
          location: findColumnValue(row, locationPatterns),
          // Keep all original data for AI analysis
          rawData: row,
        };
        console.log(`Row ${index + 1} parsed:`, candidate);
        return candidate;
      });

      const candidatesNonEmpty = candidatesRaw.filter((c) =>
        Object.values(c).some((v) => v && typeof v === 'string' && v.trim().length > 0)
      );

      // Remove rows that have no identifying info at all
      const candidates = candidatesNonEmpty.filter((c) => c.name || c.email || c.phone);

      console.log("Final candidates:", candidates);

      if (candidates.length === 0) {
        setParsedCandidates([]);
        setExcelFile(null);
        // Show what columns were found
        const foundCols = jsonData.length > 0 ? Object.keys(jsonData[0] as object).join('، ') : 'هیچ';
        toast.error(`ستون‌های شناسایی‌شده: ${foundCols}\nحداقل یکی از ستون‌های «نام»، «ایمیل» یا «تلفن» لازم است`);
        return;
      }

      if (candidates.length !== candidatesNonEmpty.length) {
        toast.info(`${candidatesNonEmpty.length - candidates.length} ردیف بدون نام/ایمیل/تلفن حذف شد`);
      }

      setParsedCandidates(candidates);
      setExcelFile(file);
      toast.success(`${candidates.length} کاندیدا از فایل استخراج شد`);

    } catch (error) {
      console.error("Error parsing Excel:", error);
      toast.error("خطا در خواندن فایل اکسل");
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      toast.error("حداکثر ۱۰ فایل PDF می‌توانید آپلود کنید");
      return;
    }
    setPdfFiles(files);
    toast.success(`${files.length} فایل رزومه آپلود شد`);
  };

  const handleCreateCampaign = async () => {
    if (!formData.jobTitle || !formData.city) {
      toast.error("لطفاً عنوان شغل و نام شهر را وارد کنید");
      return;
    }

    if (!autoHeadhunting && parsedCandidates.length === 0 && pdfFiles.length === 0) {
      toast.error("لطفاً فایل آپلود کنید یا گزینه هدهانتینگ خودکار را فعال کنید");
      return;
    }

    const campaignId = Date.now().toString();

    // Create new campaign with processing status
    const newCampaign = {
      id: campaignId,
      name: formData.jobTitle,
      status: "processing",
      source: autoHeadhunting ? "auto" : excelFile ? "excel" : pdfFiles.length > 0 ? "pdf" : "api",
      candidatesCount: 0,
      avgMatchScore: 0,
      lastUpdated: "در حال پردازش...",
      city: formData.city,
    };

    // Persist a placeholder immediately so returning to the page / opening details won't "lose" the campaign
    const emptyStats = {
      total: 0,
      excellent: 0,
      good: 0,
      average: 0,
      avgScore: 0,
      hotCandidates: 0,
      warmCandidates: 0,
      coldCandidates: 0,
    };
    try {
      localStorage.setItem(
        `campaign_${campaignId}`,
        JSON.stringify({ ...newCampaign, candidates: [], stats: emptyStats })
      );
    } catch {
      // ignore
    }

    setCampaigns((prev) => [newCampaign, ...prev]);
    setShowNewCampaignForm(false);
    setIsProcessing(true);

    try {
      if (autoHeadhunting) {
        // For auto headhunting, we'll connect to Make.com later
        toast.info("هدهانتینگ خودکار در حال آماده‌سازی...");

        // Simulate processing for now
        setTimeout(() => {
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === campaignId
                ? { ...c, status: "active", candidatesCount: 15, avgMatchScore: 75, lastUpdated: "همین الان" }
                : c
            )
          );

          try {
            localStorage.setItem(
              `campaign_${campaignId}`,
              JSON.stringify({
                ...newCampaign,
                status: "active",
                candidatesCount: 15,
                avgMatchScore: 75,
                lastUpdated: "همین الان",
                candidates: [],
                stats: { ...emptyStats, total: 15, avgScore: 75 },
              })
            );
          } catch {
            // ignore
          }

          toast.success("کمپین آماده شد!");
        }, 3000);
      } else if (parsedCandidates.length > 0) {
        // Process with AI
        toast.info("در حال تحلیل کاندیداها با هوش مصنوعی...");

        const { data, error } = await supabase.functions.invoke("analyze-candidates", {
          body: {
            candidates: parsedCandidates,
            jobRequirements: {
              jobTitle: formData.jobTitle,
              city: formData.city,
              skills: formData.skills,
              experience: formData.experience,
              industry: formData.industry,
              description: formData.description,
              seniorityLevel: formData.seniorityLevel,
            },
          },
        });

        if (error) {
          throw error;
        }

        // Store results in localStorage for campaign detail page
        localStorage.setItem(
          `campaign_${campaignId}`,
          JSON.stringify({
            ...newCampaign,
            status: "active",
            candidatesCount: data.stats.total,
            avgMatchScore: data.stats.avgScore,
            lastUpdated: "همین الان",
            candidates: data.candidates,
            stats: data.stats,
          })
        );

        // Update campaign with results
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  status: "active",
                  candidatesCount: data.stats.total,
                  avgMatchScore: data.stats.avgScore,
                  lastUpdated: "همین الان",
                }
              : c
          )
        );

        toast.success(`تحلیل ${data.stats.total} کاندیدا با موفقیت انجام شد!`);
      } else if (pdfFiles.length > 0) {
        toast.error("تحلیل رزومه‌های PDF هنوز فعال نیست؛ لطفاً اکسل آپلود کنید.");

        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: "paused", lastUpdated: "نیاز به فایل اکسل" } : c
          )
        );

        try {
          const stored = localStorage.getItem(`campaign_${campaignId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              `campaign_${campaignId}`,
              JSON.stringify({ ...parsed, status: "paused", lastUpdated: "نیاز به فایل اکسل" })
            );
          }
        } catch {
          // ignore
        }
      }
    } catch (error: any) {
      console.error("Error processing campaign:", error);
      toast.error(error?.message || "خطا در پردازش کمپین");

      // Update campaign status to error
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: "paused", lastUpdated: "خطا در پردازش" } : c
        )
      );

      try {
        const stored = localStorage.getItem(`campaign_${campaignId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            `campaign_${campaignId}`,
            JSON.stringify({ ...parsed, status: "paused", lastUpdated: "خطا در پردازش" })
          );
        }
      } catch {
        // ignore
      }
    } finally {
      setIsProcessing(false);
      setFormData({
        jobTitle: "",
        seniorityLevel: "",
        city: "",
        skills: "",
        experience: "",
        industry: "",
        description: "",
      });
      setExcelFile(null);
      setPdfFiles([]);
      setParsedCandidates([]);
      setAutoHeadhunting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>هدهانتینگ هوشمند | HRing</title>
        <meta 
          name="description" 
          content="مدیریت کمپین‌های جذب و غربالگری هوشمند کاندیداها" 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8" dir="rtl">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  <ArrowLeft className="w-5 h-5 text-slate-300" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30">
                    <Crosshair className="w-6 h-6 text-violet-400" />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">هدهانتینگ هوشمند</h1>
                </div>
                <p className="text-slate-400 text-sm lg:text-base mr-14">مدیریت کمپین‌های جذب و غربالگری هوشمند کاندیداها</p>
              </div>
            </div>
          </div>

          {/* New Campaign Button */}
          {!showNewCampaignForm && (
            <div className="mb-8">
              <Button 
                onClick={() => setShowNewCampaignForm(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25 h-14 px-8 text-lg"
              >
                <Plus className="w-5 h-5 ml-2" />
                کمپین جدید
              </Button>
            </div>
          )}

          {/* New Campaign Form */}
          {showNewCampaignForm && (
            <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Plus className="w-5 h-5 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">ایجاد کمپین جدید</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowNewCampaignForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6">
                {/* Job Details Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    مشخصات موقعیت شغلی
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        عنوان شغل <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        placeholder="مثال: Senior React Developer"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">سطح ارشدیت</Label>
                      <Select
                        value={formData.seniorityLevel}
                        onValueChange={(value) => setFormData({ ...formData, seniorityLevel: value })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid-Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        نام شهر <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        placeholder="مثال: تهران"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">مهارت‌ها</Label>
                      <Input
                        placeholder="مثال: React, Node.js, TypeScript"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">سابقه کار (سال)</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => setFormData({ ...formData, experience: value })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          <SelectItem value="0-1">کمتر از ۱ سال</SelectItem>
                          <SelectItem value="1-3">۱ تا ۳ سال</SelectItem>
                          <SelectItem value="3-5">۳ تا ۵ سال</SelectItem>
                          <SelectItem value="5-10">۵ تا ۱۰ سال</SelectItem>
                          <SelectItem value="10+">بیش از ۱۰ سال</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">صنعت مورد نظر</Label>
                      <Input
                        placeholder="مثال: فناوری اطلاعات"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label className="text-slate-300">توضیحات بیشتر در مورد انتظارات</Label>
                    <Textarea
                      placeholder="توضیحات اضافی در مورد ویژگی‌های مورد نظر کاندیدا..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Import Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-violet-400" />
                    منبع کاندیداها
                  </h3>

                  {/* Auto Headhunting Toggle */}
                  <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-violet-500/30 bg-violet-500/5">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="autoHeadhunting"
                        checked={autoHeadhunting}
                        onCheckedChange={(checked) => setAutoHeadhunting(checked === true)}
                        className="mt-1 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                      <div className="flex-1">
                        <label htmlFor="autoHeadhunting" className="text-white font-medium cursor-pointer flex items-center gap-2">
                          <Target className="w-5 h-5 text-violet-400" />
                          هدهانتینگ خودکار با هوش مصنوعی
                        </label>
                        <p className="text-sm text-slate-400 mt-1">
                          اگر لیست کاندیدا ندارید، ما با استفاده از هوش مصنوعی برای شما جستجو می‌کنیم.
                          سیستم به Make.com وصل شده و به صورت خودکار کاندیداهای مناسب را پیدا می‌کند.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Options */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${autoHeadhunting ? 'opacity-40 pointer-events-none' : ''}`}>
                    {/* Excel Upload */}
                    <div className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">آپلود فایل اکسل</h4>
                          <p className="text-xs text-slate-400 mt-0.5">حداکثر ۱۰۰ ردیف</p>
                        </div>
                      </div>
                      <label className="block">
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleExcelUpload}
                          className="hidden"
                          disabled={autoHeadhunting}
                        />
                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-lg hover:border-emerald-500/50 transition-colors cursor-pointer">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {excelFile ? excelFile.name : "فایل Excel یا CSV را اینجا بکشید"}
                          </span>
                        </div>
                      </label>
                      {excelFile && (
                        <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm">
                          <Check className="w-4 h-4" />
                          فایل آپلود شد
                        </div>
                      )}
                    </div>

                    {/* PDF Upload */}
                    <div className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">آپلود رزومه PDF</h4>
                          <p className="text-xs text-slate-400 mt-0.5">حداکثر ۱۰ فایل</p>
                        </div>
                      </div>
                      <label className="block">
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handlePdfUpload}
                          className="hidden"
                          disabled={autoHeadhunting}
                        />
                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer">
                          <Upload className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {pdfFiles.length > 0 ? `${pdfFiles.length} فایل انتخاب شده` : "فایل‌های PDF را اینجا بکشید"}
                          </span>
                        </div>
                      </label>
                      {pdfFiles.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-blue-400 text-sm">
                          <Check className="w-4 h-4" />
                          {pdfFiles.length} فایل آپلود شد
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Enrichment Note */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">غنی‌سازی هوشمند:</strong> سیستم هوش مصنوعی تمام اطلاعات رزومه‌ها و اکسل را بررسی می‌کند، 
                          در شبکه‌های اجتماعی و اینترنت بر اساس نام و حوزه فعالیت جستجو می‌کند و تحلیل کاملی از تطابق هر کاندیدا ارائه می‌دهد.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewCampaignForm(false)}
                    className="border-slate-700 text-slate-300 hover:text-white"
                  >
                    انصراف
                  </Button>
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال پردازش...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        ایجاد کمپین
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Active Campaigns Table */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Users className="w-5 h-5 text-violet-400" />
                کمپین‌های فعال
              </h2>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-400 text-right">عنوان کمپین</TableHead>
                  <TableHead className="text-slate-400 text-right">وضعیت</TableHead>
                  <TableHead className="text-slate-400 text-right">منبع</TableHead>
                  <TableHead className="text-slate-400 text-right">شهر</TableHead>
                  <TableHead className="text-slate-400 text-right">تعداد کاندیدا</TableHead>
                  <TableHead className="text-slate-400 text-right">میانگین امتیاز</TableHead>
                  <TableHead className="text-slate-400 text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                  >
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {campaign.name}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{getSourceBadge(campaign.source)}</TableCell>
                    <TableCell className="text-slate-300">{campaign.city}</TableCell>
                    <TableCell className="text-slate-300">
                      {campaign.status === "processing" ? (
                        <span className="text-violet-400">در حال پردازش...</span>
                      ) : (
                        <>
                          <span className="font-semibold text-white">{campaign.candidatesCount}</span> نفر
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.status === "processing" ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                              style={{ width: `${campaign.avgMatchScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-300">{campaign.avgMatchScore}%</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/campaign/${campaign.id}`);
                            }}
                          >
                            <ExternalLink className="w-4 h-4 ml-2" />
                            مشاهده جزئیات
                          </DropdownMenuItem>
                          {campaign.status !== "processing" && (
                            <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                              {campaign.status === "active" ? (
                                <>
                                  <Pause className="w-4 h-4 ml-2" />
                                  توقف کمپین
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 ml-2" />
                                  فعال‌سازی
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {campaigns.length === 0 && (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">هنوز کمپینی ایجاد نشده است</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartHeadhunting;
