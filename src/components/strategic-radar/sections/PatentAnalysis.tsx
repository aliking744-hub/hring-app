import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, TrendingUp, Shield, Search, ExternalLink, Calendar, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface CompanyProfile {
  name?: string;
  companyName?: string;
  industry?: string;
  sector?: string;
  maturityScore?: number;
  technologyLag?: number;
  competitors?: Array<{ name: string; marketShare: number; innovation: number }>;
}

interface PatentAnalysisProps {
  profile: CompanyProfile;
}

interface Patent {
  id: string;
  title: string;
  company: string;
  category: string;
  filingDate: string;
  status: 'granted' | 'pending' | 'expired';
  citations: number;
  relevance: 'high' | 'medium' | 'low';
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PatentAnalysis: React.FC<PatentAnalysisProps> = ({ profile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

const companyDisplayName = profile.name || profile.companyName || 'شرکت شما';
  const competitors = profile.competitors || [];
  const maturityScore = profile.maturityScore || 50;
  const technologyLag = profile.technologyLag || 0;
  
  // Calculate company patent stats based on maturity and tech scores
  const companyPatentBase = Math.round(30 + (maturityScore * 0.5));
  const companyPending = Math.round(companyPatentBase * 0.25);
  const companyCitations = Math.round(companyPatentBase * 7);
  
  // Generate patent portfolio from real competitors
  const patentPortfolio = [
    { 
      company: companyDisplayName, 
      patents: companyPatentBase, 
      pending: companyPending, 
      citations: companyCitations 
    },
    ...competitors.slice(0, 4).map((comp, idx) => ({
      company: comp.name,
      patents: Math.round(40 + (comp.innovation * 0.6) + (idx * 10)),
      pending: Math.round(10 + (comp.innovation * 0.2)),
      citations: Math.round(200 + (comp.marketShare * 10) + (comp.innovation * 3))
    }))
  ];

  // Patent categories based on industry
  const getIndustryCategories = () => {
    const industry = (profile.industry || '').toLowerCase();
    if (industry.includes('فناوری') || industry.includes('tech')) {
      return [
        { name: 'هوش مصنوعی', value: 30, color: '#10b981' },
        { name: 'پردازش داده', value: 25, color: '#3b82f6' },
        { name: 'امنیت سایبری', value: 20, color: '#f59e0b' },
        { name: 'رابط کاربری', value: 15, color: '#ef4444' },
        { name: 'زیرساخت ابری', value: 10, color: '#8b5cf6' },
      ];
    } else if (industry.includes('مالی') || industry.includes('بانک') || industry.includes('fintech')) {
      return [
        { name: 'پردازش پرداخت', value: 28, color: '#10b981' },
        { name: 'امنیت تراکنش', value: 24, color: '#3b82f6' },
        { name: 'تشخیص تقلب', value: 20, color: '#f59e0b' },
        { name: 'بلاکچین', value: 18, color: '#ef4444' },
        { name: 'تحلیل ریسک', value: 10, color: '#8b5cf6' },
      ];
    }
    return [
      { name: 'نوآوری محصول', value: 25, color: '#10b981' },
      { name: 'فرآیند تولید', value: 22, color: '#3b82f6' },
      { name: 'اتوماسیون', value: 20, color: '#f59e0b' },
      { name: 'کیفیت', value: 18, color: '#ef4444' },
      { name: 'پایداری', value: 15, color: '#8b5cf6' },
    ];
  };
  const patentCategories = getIndustryCategories();

  // IP Strength based on company metrics vs top competitor
  const topCompetitor = competitors.length > 0 
    ? competitors.reduce((a, b) => a.innovation > b.innovation ? a : b)
    : null;
    
  const companyIPScore = Math.round(50 + (maturityScore * 0.3) - (technologyLag * 2));
  const competitorIPScore = topCompetitor ? Math.round(50 + (topCompetitor.innovation * 0.5)) : 70;
  const industryAvg = 65;

  const ipStrengthData = [
    { subject: 'تعداد پتنت', A: companyIPScore, B: competitorIPScore, C: industryAvg, fullMark: 100 },
    { subject: 'استناد', A: Math.min(companyIPScore + 10, 95), B: competitorIPScore - 5, C: industryAvg + 5, fullMark: 100 },
    { subject: 'تنوع', A: Math.min(companyIPScore + 15, 90), B: competitorIPScore - 10, C: industryAvg, fullMark: 100 },
    { subject: 'روند رشد', A: maturityScore > 60 ? 75 : 50, B: competitorIPScore + 5, C: industryAvg - 5, fullMark: 100 },
    { subject: 'کیفیت', A: companyIPScore + 8, B: competitorIPScore, C: industryAvg + 3, fullMark: 100 },
    { subject: 'پوشش جغرافیایی', A: maturityScore > 70 ? 70 : 45, B: competitorIPScore - 3, C: industryAvg - 10, fullMark: 100 },
  ];

  // Innovation trends based on maturity trajectory
  const basePatent = Math.round(companyPatentBase * 0.3);
  const innovationTrends = [
    { year: '۱۳۹۹', شماpatent: basePatent, رقبا: Math.round(basePatent * 2.5) },
    { year: '۱۴۰۰', شماpatent: Math.round(basePatent * 1.3), رقبا: Math.round(basePatent * 2.8) },
    { year: '۱۴۰۱', شماpatent: Math.round(basePatent * 1.8), رقبا: Math.round(basePatent * 3.2) },
    { year: '۱۴۰۲', شماpatent: Math.round(basePatent * 2.2), رقبا: Math.round(basePatent * 3.5) },
    { year: '۱۴۰۳', شماpatent: companyPatentBase, رقبا: Math.round(companyPatentBase * 1.8) },
  ];

  // Generate recent patents from real competitors
  const patentTitles = [
    'سیستم احراز هویت هوشمند',
    'روش نوین پردازش داده‌های توزیع‌شده',
    'الگوریتم تشخیص الگو در تراکنش‌ها',
    'رابط کاربری تطبیقی هوشمند',
    'سیستم مدیریت امنیت یکپارچه',
  ];
  
  const patentCategoryNames = patentCategories.map(c => c.name);
  
  const recentPatents: Patent[] = competitors.slice(0, 4).map((comp, idx) => ({
    id: `P-00${idx + 1}`,
    title: patentTitles[idx] || `پتنت ${comp.name}`,
    company: comp.name,
    category: patentCategoryNames[idx % patentCategoryNames.length],
    filingDate: `۱۴۰۳/۰${8 - idx}/۱۵`,
    status: (idx % 3 === 0 ? 'granted' : idx % 3 === 1 ? 'pending' : 'granted') as 'granted' | 'pending' | 'expired',
    citations: Math.round(5 + (comp.innovation * 0.2)),
    relevance: (comp.marketShare > 15 ? 'high' : comp.marketShare > 8 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
  }));
  
  // Add company's own patent
  recentPatents.push({
    id: `P-00${competitors.length + 1}`,
    title: `سیستم نوآوری ${profile.industry || 'صنعت'}`,
    company: companyDisplayName,
    category: patentCategoryNames[0],
    filingDate: '۱۴۰۳/۰۴/۲۵',
    status: 'pending',
    citations: Math.round(companyCitations * 0.01),
    relevance: 'high'
  });

  const filteredPatents = recentPatents.filter(patent => {
    const matchesSearch = patent.title.includes(searchQuery) || patent.company.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || patent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">تأیید شده</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">در انتظار</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">منقضی</Badge>;
      default:
        return null;
    }
  };

  const getRelevanceBadge = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-400">اهمیت بالا</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400">اهمیت متوسط</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-slate-500/50 text-slate-400">اهمیت پایین</Badge>;
      default:
        return null;
    }
  };

  const categories = ['all', ...new Set(recentPatents.map(p => p.category))];

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">تحلیل پتنت و مالکیت فکری</h2>
            <p className="text-sm text-slate-400">بررسی پورتفوی پتنت رقبا و شناسایی فرصت‌های نوآوری</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
          <ExternalLink className="w-4 h-4 ml-2" />
          جستجو در ثبت اختراعات
        </Button>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">۴۵</p>
              <p className="text-xs text-slate-400">پتنت‌های شما</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-400">۱۲</p>
              <p className="text-xs text-slate-400">در انتظار تأیید</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-400">۳۲۰</p>
              <p className="text-xs text-slate-400">استنادات</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-purple-400">رتبه ۳</p>
              <p className="text-xs text-slate-400">در صنعت</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="portfolio">پورتفوی پتنت</TabsTrigger>
          <TabsTrigger value="categories">دسته‌بندی</TabsTrigger>
          <TabsTrigger value="strength">قدرت IP</TabsTrigger>
          <TabsTrigger value="trends">روندها</TabsTrigger>
          <TabsTrigger value="recent">پتنت‌های اخیر</TabsTrigger>
        </TabsList>

        {/* پورتفوی پتنت */}
        <TabsContent value="portfolio">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                مقایسه پورتفوی پتنت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patentPortfolio} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="company" type="category" stroke="#94a3b8" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        direction: 'rtl'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="patents" name="پتنت تأیید شده" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="pending" name="در انتظار" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* دسته‌بندی */}
        <TabsContent value="categories">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                توزیع پتنت‌ها بر اساس دسته‌بندی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={patentCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {patentCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          direction: 'rtl'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {patentCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-300">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={cat.value} className="w-24 h-2" />
                        <span className="text-white font-medium w-8">{cat.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* قدرت IP */}
        <TabsContent value="strength">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                مقایسه قدرت مالکیت فکری
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={ipStrengthData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name={companyDisplayName} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Radar name={topCompetitor?.name || "رقیب اصلی"} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name={`میانگین ${profile.industry || 'صنعت'}`} dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        direction: 'rtl'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* روندها */}
        <TabsContent value="trends">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                روند ثبت پتنت در طول زمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={innovationTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        direction: 'rtl'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="شماpatent" name="پتنت‌های شما" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="رقبا" name="میانگین رقبا" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* پتنت‌های اخیر */}
        <TabsContent value="recent">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  پتنت‌های اخیر رقبا
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="جستجو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 w-48 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300"
                  >
                    <option value="all">همه دسته‌ها</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatents.map((patent, idx) => (
                  <motion.div
                    key={patent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500">{patent.id}</span>
                          {getStatusBadge(patent.status)}
                          {getRelevanceBadge(patent.relevance)}
                        </div>
                        <h4 className="text-white font-medium mb-2">{patent.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {patent.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {patent.filingDate}
                          </span>
                          <span>دسته: {patent.category}</span>
                          <span>{patent.citations} استناد</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentAnalysis;
