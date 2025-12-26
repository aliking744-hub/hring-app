import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, Sparkles, Megaphone, MessageSquareMore, Route, Users, Building2 } from "lucide-react";
import logo from "@/assets/logo.png";

const Modules = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-slate-900 text-white py-20 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="mb-6">
            <img
              src={logo}
              alt="لوگو"
              className="w-24 h-24 mx-auto animate-pulse"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            سیستم مدیریت منابع انسانی
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            ابزارهای هوشمند برای مهندسی مشاغل و مدیریت منابع انسانی سازمانی
          </p>
          <Link to="/job-description">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all bg-white text-primary hover:bg-white/90">
              شروع کنید
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container max-w-5xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">ماژول‌های موجود</h2>
          <p className="text-slate-600 text-lg">
            ابزارهای حرفه‌ای برای تسهیل فرآیندهای منابع انسانی
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Profile Generator */}
          <Link to="/job-description" className="group">
            <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white group-hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-slate-900">مهندسی مشاغل</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  تولید هوشمند پروفایل شغلی با استفاده از هوش مصنوعی
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    تولید سند هویت شغلی
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    تعیین شرایط احراز
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    خروجی PDF
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Job Ad Generator */}
          <Link to="/smart-ad-generator" className="group">
            <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white group-hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">آگهی‌نویس هوشمند</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  نوشتن آگهی‌های شغلی جذاب برای لینکدین و سایت‌های کاریابی
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    متن حرفه‌ای برای هر پلتفرم
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    تولید تصویر با هوش مصنوعی
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    لحن‌های متنوع
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Interview Assistant */}
          <Link to="/interview-assistant" className="group">
            <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white group-hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <MessageSquareMore className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">دستیار مصاحبه</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  تولید راهنمای جامع مصاحبه، سوالات تخصصی و کلید ارزیابی داوطلب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    سوالات تخصصی و رفتاری
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    کلید ارزیابی برای هر سوال
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    دانلود PDF
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* 90-Day Onboarding */}
          <Link to="/onboarding" className="group">
            <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white group-hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Route className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">معمار موفقیت ۹۰ روزه</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  طراحی نقشه راه ۹۰ روزه برای موفقیت و تثبیت نیروی جدید در سازمان
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    برنامه ۳۰-۶۰-۹۰ روزه
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    تایم‌لاین بصری
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    ایمیل خوش‌آمدگویی
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Placeholder Cards */}
          <Card className="h-full shadow-md border-0 bg-slate-100 opacity-60">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <CardTitle className="text-xl text-slate-400">ارزیابی عملکرد</CardTitle>
              <CardDescription className="text-slate-400">
                به زودی...
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full shadow-md border-0 bg-slate-100 opacity-60">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <CardTitle className="text-xl text-slate-400">طراحی سازمان</CardTitle>
              <CardDescription className="text-slate-400">
                به زودی...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="container max-w-5xl mx-auto pb-8 px-4">
        <div className="text-center">
          <Link to="/dashboard">
            <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100">
              <ArrowRight className="w-4 h-4" />
              بازگشت به داشبورد
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-4">
        <div className="container max-w-5xl mx-auto text-center text-slate-500 text-sm">
          <p>سیستم مدیریت منابع انسانی | طراحی شده با ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Modules;
