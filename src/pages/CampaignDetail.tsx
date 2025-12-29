import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Award,
  Target,
  BarChart3
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
  Legend
} from "recharts";

// Sample campaign data
const campaignData = {
  id: "1",
  name: "Senior React Developer",
  city: "تهران",
  totalCandidates: 124,
  excellentCount: 18,
  goodCount: 45,
  averageCount: 61,
};

// Sample candidates sorted by score
const candidates = [
  {
    id: 1,
    name: "علی محمدی",
    title: "Senior Frontend Developer",
    matchScore: 95,
    education: "کارشناسی ارشد مهندسی نرم‌افزار",
    experience: "۸ سال",
    lastCompany: "دیجی‌کالا",
    phone: "۰۹۱۲۳۴۵۶۷۸۹",
    email: "ali@example.com",
    location: "تهران",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    scores: {
      skills: 95,
      experience: 90,
      education: 85,
      culture: 92,
    },
  },
  {
    id: 2,
    name: "سارا احمدی",
    title: "Full Stack Developer",
    matchScore: 89,
    education: "کارشناسی مهندسی کامپیوتر",
    experience: "۶ سال",
    lastCompany: "اسنپ",
    phone: "۰۹۱۲۸۷۶۵۴۳۲",
    email: "sara@example.com",
    location: "تهران",
    skills: ["React", "TypeScript", "Python", "PostgreSQL"],
    scores: {
      skills: 88,
      experience: 85,
      education: 80,
      culture: 90,
    },
  },
  {
    id: 3,
    name: "محمد رضایی",
    title: "Frontend Engineer",
    matchScore: 84,
    education: "کارشناسی علوم کامپیوتر",
    experience: "۵ سال",
    lastCompany: "تپسی",
    phone: "۰۹۱۵۱۲۳۴۵۶۷",
    email: "mohammad@example.com",
    location: "مشهد",
    skills: ["React", "JavaScript", "CSS", "REST API"],
    scores: {
      skills: 82,
      experience: 78,
      education: 75,
      culture: 88,
    },
  },
  {
    id: 4,
    name: "نگین حسینی",
    title: "React Developer",
    matchScore: 78,
    education: "کارشناسی مهندسی IT",
    experience: "۴ سال",
    lastCompany: "کافه‌بازار",
    phone: "۰۹۱۳۵۶۷۸۹۰۱",
    email: "negin@example.com",
    location: "اصفهان",
    skills: ["React", "Redux", "JavaScript", "HTML/CSS"],
    scores: {
      skills: 75,
      experience: 72,
      education: 70,
      culture: 85,
    },
  },
  {
    id: 5,
    name: "امیر کریمی",
    title: "Junior Frontend Developer",
    matchScore: 65,
    education: "کارشناسی مهندسی نرم‌افزار",
    experience: "۲ سال",
    lastCompany: "استارتاپ",
    phone: "۰۹۱۷۸۹۰۱۲۳۴",
    email: "amir@example.com",
    location: "شیراز",
    skills: ["React", "JavaScript", "CSS"],
    scores: {
      skills: 60,
      experience: 55,
      education: 70,
      culture: 75,
    },
  },
];

// Chart data
const qualityData = [
  { name: "عالی", value: 18, color: "#10b981" },
  { name: "خوب", value: 45, color: "#8b5cf6" },
  { name: "متوسط", value: 61, color: "#f59e0b" },
];

const educationData = [
  { name: "دکتری", count: 5 },
  { name: "کارشناسی ارشد", count: 28 },
  { name: "کارشناسی", count: 72 },
  { name: "کاردانی", count: 19 },
];

const experienceData = [
  { name: "۰-۲ سال", count: 25 },
  { name: "۳-۵ سال", count: 42 },
  { name: "۶-۱۰ سال", count: 38 },
  { name: "+۱۰ سال", count: 19 },
];

const CampaignDetail = () => {
  const { id } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<typeof candidates[0] | null>(null);

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
              <p className="text-slate-400 text-sm mt-1">{campaignData.city} • {campaignData.totalCandidates} کاندیدا</p>
            </div>
          </div>

          {/* Stats Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quality Distribution */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                توزیع کیفیت کاندیداها
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
              <div className="flex justify-center gap-4 mt-4">
                {qualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-300">{item.name}: {item.value}</span>
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
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
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
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experienceData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{candidate.name}</h4>
                            {candidate.matchScore >= 85 && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <Star className="w-3 h-3 ml-1" />
                                عالی
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{candidate.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{candidate.lastCompany}</span>
                            <span>•</span>
                            <span>{candidate.experience}</span>
                            <span>•</span>
                            <span>{candidate.location}</span>
                          </div>
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

                  <div className="p-6">
                    {/* Basic Info */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedCandidate.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white">{selectedCandidate.name}</h4>
                        <p className="text-slate-400">{selectedCandidate.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getScoreBgColor(selectedCandidate.matchScore)}/20 ${getScoreColor(selectedCandidate.matchScore)} border-current/30`}>
                            امتیاز کل: {selectedCandidate.matchScore}%
                          </Badge>
                        </div>
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
                      <div className="flex items-center gap-3 text-slate-300">
                        <Phone className="w-5 h-5 text-violet-400" />
                        <span dir="ltr">{selectedCandidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <Mail className="w-5 h-5 text-violet-400" />
                        <span>{selectedCandidate.email}</span>
                      </div>
                    </div>

                    {/* Skills */}
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

                    {/* Score Breakdown */}
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
