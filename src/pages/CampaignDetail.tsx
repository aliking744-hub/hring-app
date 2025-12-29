import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Star,
  X,
  Check,
  Target,
  BarChart3,
  AlertCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  Linkedin,
  TrendingUp,
  Brain,
  Heart,
  Shield
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface LayerScores {
  activitySentiment: number;
  hardSkillMatch: number;
  careerTrajectory: number;
  cultureFit: number;
  riskOpportunity: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  education: string;
  experience: string;
  lastCompany: string;
  location: string;
  linkedin?: string;
  skills: string[];
  matchScore: number;
  candidateTemperature?: "hot" | "warm" | "cold";
  layerScores?: LayerScores;
  scores: {
    skills: number;
    experience: number;
    education: number;
    culture: number;
  };
  redFlags?: string[];
  greenFlags?: string[];
  summary?: string;
  recommendation?: string;
}

interface CampaignStats {
  total: number;
  excellent: number;
  good: number;
  average: number;
  avgScore: number;
  hotCandidates?: number;
  warmCandidates?: number;
  coldCandidates?: number;
}

interface CampaignData {
  id: string;
  name: string;
  city: string;
  candidates: Candidate[];
  stats: CampaignStats;
}

// Fallback sample data with new 5-layer analysis
const fallbackCampaign: CampaignData = {
  id: "1",
  name: "Senior React Developer",
  city: "تهران",
  candidates: [
    {
      id: "1",
      name: "علی محمدی",
      title: "Senior Frontend Developer",
      matchScore: 95,
      candidateTemperature: "hot",
      education: "کارشناسی ارشد مهندسی نرم‌افزار",
      experience: "۸ سال",
      lastCompany: "دیجی‌کالا",
      phone: "۰۹۱۲۳۴۵۶۷۸۹",
      email: "ali@example.com",
      location: "تهران",
      linkedin: "https://linkedin.com/in/alimohammadi",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      layerScores: {
        activitySentiment: 90,
        hardSkillMatch: 95,
        careerTrajectory: 92,
        cultureFit: 88,
        riskOpportunity: 85,
      },
      scores: {
        skills: 95,
        experience: 90,
        education: 85,
        culture: 92,
      },
      redFlags: [],
      greenFlags: ["رشد پیوسته در مسیر شغلی", "گواهینامه‌های جدید", "فعالیت تخصصی بالا در لینکدین"],
      summary: "کاندیدای عالی با تطابق بسیار بالا. رشد شغلی قوی از Junior به Senior در شرکت‌های معتبر.",
      recommendation: "فوری تماس بگیرید",
    },
    {
      id: "2",
      name: "سارا احمدی",
      title: "Full Stack Developer",
      matchScore: 89,
      candidateTemperature: "warm",
      education: "کارشناسی مهندسی کامپیوتر",
      experience: "۶ سال",
      lastCompany: "اسنپ",
      phone: "۰۹۱۲۸۷۶۵۴۳۲",
      email: "sara@example.com",
      location: "تهران",
      linkedin: "https://linkedin.com/in/saraahmadi",
      skills: ["React", "TypeScript", "Python", "PostgreSQL"],
      layerScores: {
        activitySentiment: 85,
        hardSkillMatch: 88,
        careerTrajectory: 80,
        cultureFit: 90,
        riskOpportunity: 82,
      },
      scores: {
        skills: 88,
        experience: 85,
        education: 80,
        culture: 90,
      },
      redFlags: ["یک تغییر شغل در کمتر از یک سال"],
      greenFlags: ["مهارت‌های قوی فول‌استک", "تجربه در شرکت معتبر"],
      summary: "کاندیدای مناسب با مهارت‌های قوی. نیاز به بررسی دلیل تغییر شغل سریع.",
      recommendation: "در لیست انتظار",
    },
    {
      id: "3",
      name: "محمد رضایی",
      title: "Frontend Engineer",
      matchScore: 78,
      candidateTemperature: "cold",
      education: "کارشناسی علوم کامپیوتر",
      experience: "۵ سال",
      lastCompany: "تپسی",
      phone: "۰۹۱۵۱۲۳۴۵۶۷",
      email: "mohammad@example.com",
      location: "مشهد",
      skills: ["React", "JavaScript", "CSS", "REST API"],
      layerScores: {
        activitySentiment: 70,
        hardSkillMatch: 82,
        careerTrajectory: 75,
        cultureFit: 80,
        riskOpportunity: 65,
      },
      scores: {
        skills: 82,
        experience: 78,
        education: 75,
        culture: 80,
      },
      redFlags: ["فعالیت کم در شبکه‌های اجتماعی حرفه‌ای", "عدم TypeScript"],
      greenFlags: ["کاندیدای مناسب با پتانسیل رشد"],
      summary: "کاندیدای با پتانسیل ولی نیاز به آموزش TypeScript.",
      recommendation: "در لیست انتظار",
    },
  ],
  stats: {
    total: 3,
    excellent: 1,
    good: 1,
    average: 1,
    avgScore: 87,
    hotCandidates: 1,
    warmCandidates: 1,
    coldCandidates: 1,
  },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);

  useEffect(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(`campaign_${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCampaignData(parsed);
      } catch {
        setCampaignData(fallbackCampaign);
      }
    } else {
      // Use fallback for demo campaigns
      setCampaignData(fallbackCampaign);
    }
  }, [id]);

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const { candidates, stats } = campaignData;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-violet-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-violet-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getTemperatureIcon = (temp?: string) => {
    switch (temp) {
      case "hot":
        return <Flame className="w-4 h-4 text-red-400" />;
      case "warm":
        return <ThermometerSun className="w-4 h-4 text-amber-400" />;
      case "cold":
        return <Snowflake className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTemperatureBadge = (temp?: string) => {
    switch (temp) {
      case "hot":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <Flame className="w-3 h-3 ml-1" />
            داغ
          </Badge>
        );
      case "warm":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <ThermometerSun className="w-3 h-3 ml-1" />
            گرم
          </Badge>
        );
      case "cold":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Snowflake className="w-3 h-3 ml-1" />
            سرد
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRecommendationColor = (rec?: string) => {
    if (rec?.includes("فوری")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (rec?.includes("انتظار")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (rec?.includes("رد")) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  // Chart data from actual stats
  const qualityData = [
    { name: "عالی", value: stats.excellent, color: "#10b981" },
    { name: "خوب", value: stats.good, color: "#8b5cf6" },
    { name: "متوسط", value: stats.average, color: "#f59e0b" },
  ];

  // Temperature distribution data
  const temperatureData = [
    { name: "داغ", value: stats.hotCandidates || 0, color: "#ef4444" },
    { name: "گرم", value: stats.warmCandidates || 0, color: "#f59e0b" },
    { name: "سرد", value: stats.coldCandidates || 0, color: "#3b82f6" },
  ];

  // Calculate education distribution from candidates
  const educationMap: Record<string, number> = {};
  candidates.forEach(c => {
    const edu = c.education || "نامشخص";
    educationMap[edu] = (educationMap[edu] || 0) + 1;
  });
  const educationData = Object.entries(educationMap).map(([name, count]) => ({ name, count }));

  // Calculate experience distribution
  const experienceMap: Record<string, number> = {};
  candidates.forEach(c => {
    const exp = c.experience || "نامشخص";
    experienceMap[exp] = (experienceMap[exp] || 0) + 1;
  });
  const experienceData = Object.entries(experienceMap).map(([name, count]) => ({ name, count }));

  const layerLabels: Record<keyof LayerScores, { label: string; icon: React.ReactNode }> = {
    activitySentiment: { label: "تحلیل رفتار و محتوا", icon: <Brain className="w-4 h-4" /> },
    hardSkillMatch: { label: "تطبیق مهارت سخت", icon: <Target className="w-4 h-4" /> },
    careerTrajectory: { label: "مسیر شغلی", icon: <TrendingUp className="w-4 h-4" /> },
    cultureFit: { label: "تناسب فرهنگی", icon: <Heart className="w-4 h-4" /> },
    riskOpportunity: { label: "ریسک و فرصت", icon: <Shield className="w-4 h-4" /> },
  };

  return (
    <>
      <Helmet>
        <title>{campaignData.name} | هدهانتینگ هوشمند</title>
        <meta name="description" content={`جزئیات کمپین ${campaignData.name}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8" dir="rtl">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/smart-headhunting">
              <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{campaignData.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{campaignData.city} • {stats.total} کاندیدا • میانگین امتیاز: {stats.avgScore}%</p>
            </div>
          </div>

          {/* Stats Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Quality Distribution */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                توزیع کیفیت
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 mt-2">
                {qualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-300">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Temperature Distribution */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                دمای کاندیداها
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={temperatureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {temperatureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 mt-2">
                {temperatureData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-300">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Distribution */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-violet-400" />
                مدارک تحصیلی
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Experience Distribution */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-400" />
                سابقه کاری
              </h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experienceData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Candidates List and Detail */}
          <div className="flex gap-6">
            {/* Candidates List */}
            <div className={`flex-1 transition-all duration-300 ${selectedCandidate ? 'lg:w-[55%]' : 'w-full'}`}>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-400" />
                    کاندیداها (مرتب بر اساس امتیاز)
                  </h3>
                </div>
                
                <div className="divide-y divide-slate-700/50">
                  {candidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-violet-500/10'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-white">{candidate.name}</h4>
                            {candidate.matchScore >= 85 && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <Star className="w-3 h-3 ml-1" />
                                عالی
                              </Badge>
                            )}
                            {getTemperatureBadge(candidate.candidateTemperature)}
                          </div>
                          <p className="text-sm text-slate-400">{candidate.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{candidate.lastCompany}</span>
                            <span>•</span>
                            <span>{candidate.experience}</span>
                            <span>•</span>
                            <span>{candidate.location}</span>
                          </div>
                          {candidate.recommendation && (
                            <Badge className={`mt-2 ${getRecommendationColor(candidate.recommendation)}`}>
                              {candidate.recommendation}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-left">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-slate-700"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="url(#scoreGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${candidate.matchScore * 1.76} 176`}
                              />
                              <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${getScoreColor(candidate.matchScore)}`}>
                              {candidate.matchScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {candidates.length === 0 && (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">هنوز کاندیدایی تحلیل نشده است</p>
                  </div>
                )}
              </div>
            </div>

            {/* Candidate Detail Panel */}
            {selectedCandidate && (
              <div className="hidden lg:block w-[45%]">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden sticky top-6">
                  <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">جزئیات کاندیدا</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setSelectedCandidate(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedCandidate.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white">{selectedCandidate.name}</h4>
                        <p className="text-slate-400">{selectedCandidate.title}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className={`${getScoreBgColor(selectedCandidate.matchScore)}/20 ${getScoreColor(selectedCandidate.matchScore)} border-current/30`}>
                            امتیاز کل: {selectedCandidate.matchScore}%
                          </Badge>
                          {getTemperatureBadge(selectedCandidate.candidateTemperature)}
                        </div>
                        {selectedCandidate.recommendation && (
                          <Badge className={`mt-2 ${getRecommendationColor(selectedCandidate.recommendation)}`}>
                            {selectedCandidate.recommendation}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedCandidate.summary && (
                      <div className="mb-6 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <p className="text-sm text-violet-300">{selectedCandidate.summary}</p>
                      </div>
                    )}

                    {/* Red Flags & Green Flags */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Red Flags */}
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <h5 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          هشدارها
                        </h5>
                        {selectedCandidate.redFlags && selectedCandidate.redFlags.length > 0 ? (
                          <ul className="space-y-1">
                            {selectedCandidate.redFlags.map((flag, idx) => (
                              <li key={idx} className="text-xs text-red-300">• {flag}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500">بدون هشدار</p>
                        )}
                      </div>

                      {/* Green Flags */}
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          نقاط قوت
                        </h5>
                        {selectedCandidate.greenFlags && selectedCandidate.greenFlags.length > 0 ? (
                          <ul className="space-y-1">
                            {selectedCandidate.greenFlags.map((flag, idx) => (
                              <li key={idx} className="text-xs text-emerald-300">• {flag}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500">-</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-slate-300">
                        <GraduationCap className="w-5 h-5 text-violet-400" />
                        <span>{selectedCandidate.education}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Briefcase className="w-5 h-5 text-violet-400" />
                        <span>{selectedCandidate.experience} سابقه کار • {selectedCandidate.lastCompany}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <MapPin className="w-5 h-5 text-violet-400" />
                        <span>{selectedCandidate.location}</span>
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-3 text-slate-300">
                          <Phone className="w-5 h-5 text-violet-400" />
                          <span dir="ltr">{selectedCandidate.phone}</span>
                        </div>
                      )}
                      {selectedCandidate.email && (
                        <div className="flex items-center gap-3 text-slate-300">
                          <Mail className="w-5 h-5 text-violet-400" />
                          <span>{selectedCandidate.email}</span>
                        </div>
                      )}
                      {selectedCandidate.linkedin && (
                        <a 
                          href={selectedCandidate.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-400 hover:text-blue-300"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span>پروفایل لینکدین</span>
                        </a>
                      )}
                    </div>

                    {/* Skills */}
                    {selectedCandidate.skills.length > 0 && (
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-slate-400 mb-3">مهارت‌ها</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.skills.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="border-violet-500/30 text-violet-300 bg-violet-500/10"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5-Layer Score Breakdown */}
                    {selectedCandidate.layerScores && (
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          تحلیل ۵ لایه‌ای
                        </h5>
                        <div className="space-y-4">
                          {(Object.entries(selectedCandidate.layerScores) as [keyof LayerScores, number][]).map(([key, score]) => (
                            <div key={key}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-300 flex items-center gap-2">
                                  {layerLabels[key].icon}
                                  {layerLabels[key].label}
                                </span>
                                <span className={getScoreColor(score)}>
                                  {score}%
                                </span>
                              </div>
                              <Progress 
                                value={score} 
                                className="h-2 bg-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy Score Breakdown (if no layer scores) */}
                    {!selectedCandidate.layerScores && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          امتیازات جزئی
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">مهارت‌ها</span>
                              <span className={getScoreColor(selectedCandidate.scores.skills)}>
                                {selectedCandidate.scores.skills}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedCandidate.scores.skills} 
                              className="h-2 bg-slate-800"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">تجربه کاری</span>
                              <span className={getScoreColor(selectedCandidate.scores.experience)}>
                                {selectedCandidate.scores.experience}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedCandidate.scores.experience} 
                              className="h-2 bg-slate-800"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">تحصیلات</span>
                              <span className={getScoreColor(selectedCandidate.scores.education)}>
                                {selectedCandidate.scores.education}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedCandidate.scores.education} 
                              className="h-2 bg-slate-800"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-300">تناسب فرهنگی</span>
                              <span className={getScoreColor(selectedCandidate.scores.culture)}>
                                {selectedCandidate.scores.culture}%
                              </span>
                            </div>
                            <Progress 
                              value={selectedCandidate.scores.culture} 
                              className="h-2 bg-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
                        <Check className="w-4 h-4 ml-2" />
                        تایید
                      </Button>
                      <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:text-white">
                        <X className="w-4 h-4 ml-2" />
                        رد
                      </Button>
                    </div>
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

export default CampaignDetail;
