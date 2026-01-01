import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Users, FileText, Diamond, Database, Shield } from 'lucide-react';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';
import UsersCreditsManager from '@/components/admin/UsersCreditsManager';
import BlogManager from '@/components/admin/BlogManager';
import ProductManager from '@/components/admin/ProductManager';
import CompanyManager from '@/components/admin/CompanyManager';
import CorporateUserManager from '@/components/admin/CorporateUserManager';
import FeatureFlagsManager from '@/components/admin/FeatureFlagsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import CreditAnalytics from '@/components/admin/CreditAnalytics';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';
import KnowledgeBaseStatus from '@/components/admin/KnowledgeBaseStatus';
import LegalImporter from '@/components/admin/LegalImporter';

const King744 = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <>
      <Helmet>
        <title>CMS Admin | HRing</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold gradient-text-primary">مدیریت سیستم</h1>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">/king744</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-[1920px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex min-w-max glass-card h-auto p-2 gap-1">
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">تنظیمات سایت</span>
                  <span className="sm:hidden">تنظیمات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">کاربران و اعتبار</span>
                  <span className="sm:hidden">کاربران</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="companies" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">شرکت‌ها</span>
                  <span className="sm:hidden">شرکت</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="corporate-users" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">کاربران شرکتی</span>
                  <span className="sm:hidden">شرکتی</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">محتوا</span>
                  <span className="sm:hidden">محتوا</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="legal" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">پایگاه حقوقی</span>
                  <span className="sm:hidden">حقوقی</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="features" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Diamond className="w-4 h-4" />
                  <span className="hidden sm:inline">قابلیت‌ها</span>
                  <span className="sm:hidden">قابلیت</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Diamond className="w-4 h-4" />
                  <span className="hidden sm:inline">آمار اعتبار</span>
                  <span className="sm:hidden">آمار</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="logs" 
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">لاگ‌ها</span>
                  <span className="sm:hidden">لاگ</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="settings" className="space-y-6">
              <SiteSettingsManager />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersCreditsManager />
            </TabsContent>

            <TabsContent value="companies" className="space-y-6">
              <CompanyManager />
            </TabsContent>

            <TabsContent value="corporate-users" className="space-y-6">
              <CorporateUserManager />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid gap-6">
                <BlogManager />
                <ProductManager />
                <TestimonialsManager />
              </div>
            </TabsContent>

            <TabsContent value="legal" className="space-y-6">
              <div className="grid gap-6">
                <KnowledgeBaseStatus />
                <LegalImporter />
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <FeatureFlagsManager />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <CreditAnalytics />
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <AuditLogsViewer />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default King744;
