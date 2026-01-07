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
  
  // داده‌های نمونه برای پتنت‌ها
  const patentPortfolio = [
    { company: companyDisplayName, patents: 45, pending: 12, citations: 320 },
    { company: 'آپ', patents: 78, pending: 23, citations: 540 },
    { company: 'اسنپ‌پی', patents: 65, pending: 18, citations: 420 },
    { company: 'تپسی', patents: 32, pending: 8, citations: 180 },
    { company: 'دیجی‌کالا', patents: 89, pending: 31, citations: 680 },
  ];

  const patentCategories = [
    { name: 'هوش مصنوعی', value: 28, color: '#10b981' },
    { name: 'پردازش پرداخت', value: 22, color: '#3b82f6' },
    { name: 'امنیت داده', value: 18, color: '#f59e0b' },
    { name: 'تجربه کاربری', value: 15, color: '#ef4444' },
    { name: 'زیرساخت', value: 12, color: '#8b5cf6' },
    { name: 'سایر', value: 5, color: '#6b7280' },
  ];

  const ipStrengthData = [
    { subject: 'تعداد پتنت', A: 65, B: 85, C: 70, fullMark: 100 },
    { subject: 'استناد', A: 72, B: 68, C: 80, fullMark: 100 },
    { subject: 'تنوع', A: 80, B: 75, C: 65, fullMark: 100 },
    { subject: 'روند رشد', A: 55, B: 90, C: 60, fullMark: 100 },
    { subject: 'کیفیت', A: 78, B: 72, C: 75, fullMark: 100 },
    { subject: 'پوشش جغرافیایی', A: 60, B: 82, C: 55, fullMark: 100 },
  ];

  const innovationTrends = [
    { year: '۱۳۹۹', شماpatent: 15, رقبا: 45 },
    { year: '۱۴۰۰', شماpatent: 22, رقبا: 58 },
    { year: '۱۴۰۱', شماpatent: 35, رقبا: 72 },
    { year: '۱۴۰۲', شماpatent: 42, رقبا: 85 },
    { year: '۱۴۰۳', شماpatent: 55, رقبا: 98 },
  ];

  const recentPatents: Patent[] = [
    {
      id: 'P-001',
      title: 'سیستم احراز هویت بیومتریک مبتنی بر هوش مصنوعی',
      company: 'آپ',
      category: 'هوش مصنوعی',
      filingDate: '۱۴۰۳/۰۸/۱۵',
      status: 'granted',
      citations: 12,
      relevance: 'high'
    },
    {
      id: 'P-002',
      title: 'روش نوین پردازش تراکنش‌های مالی توزیع‌شده',
      company: 'اسنپ‌پی',
      category: 'پردازش پرداخت',
      filingDate: '۱۴۰۳/۰۷/۲۲',
      status: 'pending',
      citations: 5,
      relevance: 'high'
    },
    {
      id: 'P-003',
      title: 'الگوریتم تشخیص تقلب در تراکنش‌های آنلاین',
      company: 'دیجی‌کالا',
      category: 'امنیت داده',
      filingDate: '۱۴۰۳/۰۶/۱۰',
      status: 'granted',
      citations: 18,
      relevance: 'medium'
    },
    {
      id: 'P-004',
      title: 'رابط کاربری تطبیقی برای اپلیکیشن‌های مالی',
      company: 'تپسی',
      category: 'تجربه کاربری',
      filingDate: '۱۴۰۳/۰۵/۰۸',
      status: 'granted',
      citations: 8,
      relevance: 'low'
    },
    {
      id: 'P-005',
      title: 'سیستم مدیریت هویت غیرمتمرکز',
      company: companyDisplayName,
      category: 'امنیت داده',
      filingDate: '۱۴۰۳/۰۴/۲۵',
      status: 'pending',
      citations: 3,
      relevance: 'high'
    },
  ];

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
                    <Radar name="رقیب اصلی" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="میانگین صنعت" dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
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
