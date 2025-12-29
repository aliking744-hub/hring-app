import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Crosshair, 
  Plus, 
  Upload, 
  Link2, 
  UserPlus, 
  Play, 
  Pause, 
  MoreHorizontal,
  FileSpreadsheet,
  Zap,
  ChevronRight,
  X,
  Sparkles,
  Check,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample campaign data
const campaigns = [
  {
    id: 1,
    name: "Senior React Developer",
    status: "active",
    source: "excel",
    candidatesCount: 124,
    avgMatchScore: 78,
    lastUpdated: "۲ ساعت پیش",
  },
  {
    id: 2,
    name: "HR Manager - Tehran",
    status: "active",
    source: "api",
    candidatesCount: 56,
    avgMatchScore: 82,
    lastUpdated: "۱ روز پیش",
  },
  {
    id: 3,
    name: "Product Designer",
    status: "paused",
    source: "excel",
    candidatesCount: 89,
    avgMatchScore: 71,
    lastUpdated: "۳ روز پیش",
  },
  {
    id: 4,
    name: "DevOps Engineer",
    status: "active",
    source: "manual",
    candidatesCount: 34,
    avgMatchScore: 85,
    lastUpdated: "۵ ساعت پیش",
  },
];

// Sample candidates for preview
const previewCandidates = [
  {
    id: 1,
    name: "علی محمدی",
    title: "Senior Frontend Developer",
    matchScore: 92,
    matchedKeywords: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "CI/CD", "Agile", "Team Lead"],
    totalKeywords: 10,
  },
  {
    id: 2,
    name: "سارا احمدی",
    title: "Full Stack Developer",
    matchScore: 85,
    matchedKeywords: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Git"],
    totalKeywords: 10,
  },
  {
    id: 3,
    name: "محمد رضایی",
    title: "Frontend Engineer",
    matchScore: 78,
    matchedKeywords: ["React", "JavaScript", "CSS", "REST API", "Jest", "Webpack"],
    totalKeywords: 10,
  },
];

const SmartHeadhunting = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [autoEnrichment, setAutoEnrichment] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "excel":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
            <FileSpreadsheet className="w-3 h-3 ml-1" />
            Excel
          </Badge>
        );
      case "api":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
            <Link2 className="w-3 h-3 ml-1" />
            API
          </Badge>
        );
      case "manual":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30">
            <UserPlus className="w-3 h-3 ml-1" />
            دستی
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
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Pause className="w-3 h-3 ml-1" />
        متوقف
      </Badge>
    );
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
        <div className="max-w-[1600px] mx-auto">
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

            <div className="flex items-center gap-3">
              {/* Auto-Enrichment Toggle */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${autoEnrichment ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-sm text-slate-300">غنی‌سازی خودکار</span>
                </div>
                <Switch
                  checked={autoEnrichment}
                  onCheckedChange={setAutoEnrichment}
                  className="data-[state=checked]:bg-violet-600"
                />
              </div>

              {/* Import Button */}
              <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25">
                    <Plus className="w-4 h-4 ml-2" />
                    ورود کاندیدا
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-violet-400" />
                      ورود کاندیداهای جدید
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Bulk Upload */}
                    <div className="group p-5 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-800/30 hover:bg-emerald-500/5 transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-xl bg-emerald-500/10 mb-3 group-hover:bg-emerald-500/20 transition-colors">
                          <Upload className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">آپلود گروهی</h3>
                        <p className="text-xs text-slate-400 mb-3">فایل Excel یا CSV</p>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                          PhantomBuster پشتیبانی
                        </Badge>
                      </div>
                    </div>

                    {/* API Connect */}
                    <div className="group p-5 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-800/30 hover:bg-blue-500/5 transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-xl bg-blue-500/10 mb-3 group-hover:bg-blue-500/20 transition-colors">
                          <Link2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">اتصال API</h3>
                        <p className="text-xs text-slate-400 mb-3">جابوردهای خارجی</p>
                        <div className="flex gap-1.5">
                          <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">کاربوم</Badge>
                          <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">ایران‌تلنت</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Manual Add */}
                    <div className="group p-5 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 bg-slate-800/30 hover:bg-purple-500/5 transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-xl bg-purple-500/10 mb-3 group-hover:bg-purple-500/20 transition-colors">
                          <UserPlus className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-1">افزودن دستی</h3>
                        <p className="text-xs text-slate-400 mb-3">ورود تکی پروفایل</p>
                        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                          فرم ساده
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Enrichment Note */}
                  <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-300">
                          سیستم به صورت خودکار پروفایل‌ها را اسکن کرده، داده‌های ناقص را تکمیل و <strong className="text-violet-300">امتیاز انطباق</strong> را بر اساس معیارهای شغلی محاسبه می‌کند.
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Campaigns Table */}
            <div className={`flex-1 transition-all duration-300 ${selectedCampaign ? 'lg:w-[60%]' : 'w-full'}`}>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full" />
                    کمپین‌های فعال جستجو
                  </h2>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 text-right">عنوان کمپین</TableHead>
                      <TableHead className="text-slate-400 text-right">وضعیت</TableHead>
                      <TableHead className="text-slate-400 text-right">منبع</TableHead>
                      <TableHead className="text-slate-400 text-right">تعداد کاندیدا</TableHead>
                      <TableHead className="text-slate-400 text-right">میانگین امتیاز</TableHead>
                      <TableHead className="text-slate-400 text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow
                        key={campaign.id}
                        className={`border-slate-800 cursor-pointer transition-colors ${
                          selectedCampaign?.id === campaign.id
                            ? 'bg-violet-500/10 hover:bg-violet-500/15'
                            : 'hover:bg-slate-800/50'
                        }`}
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            {campaign.name}
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{getSourceBadge(campaign.source)}</TableCell>
                        <TableCell className="text-slate-300">
                          <span className="font-semibold text-white">{campaign.candidatesCount}</span> نفر
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                style={{ width: `${campaign.avgMatchScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-300">{campaign.avgMatchScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
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
                              <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                                <ExternalLink className="w-4 h-4 ml-2" />
                                مشاهده جزئیات
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Preview Panel */}
            {selectedCampaign && (
              <div className="hidden lg:block w-[40%] transition-all duration-300">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden sticky top-6">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{selectedCampaign.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">آخرین بروزرسانی: {selectedCampaign.lastUpdated}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                      onClick={() => setSelectedCampaign(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">کاندیداهای برتر</h4>
                    <div className="space-y-3">
                      {previewCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-white">{candidate.name}</h5>
                              <p className="text-sm text-slate-400">{candidate.title}</p>
                            </div>
                            <div className="relative w-14 h-14">
                              <svg className="w-14 h-14 -rotate-90">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  className="text-slate-700"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  fill="none"
                                  stroke="url(#matchGradient)"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeDasharray={`${candidate.matchScore * 1.5} 150`}
                                />
                                <defs>
                                  <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                                {candidate.matchScore}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>مطابقت {candidate.matchedKeywords.length} از {candidate.totalKeywords} کلیدواژه</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.matchedKeywords.slice(0, 5).map((keyword, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] border-violet-500/30 text-violet-300 bg-violet-500/10"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                              {candidate.matchedKeywords.length > 5 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-slate-600 text-slate-400"
                                >
                                  +{candidate.matchedKeywords.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                      مشاهده همه کاندیداها
                      <ChevronRight className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartHeadhunting;
