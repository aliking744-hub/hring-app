import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Package, Users, Settings, Building2, ToggleRight, MessageSquare, BarChart3, Shield, Scale, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlogManager from '@/components/admin/BlogManager';
import ProductManager from '@/components/admin/ProductManager';
import UsersCreditsManager from '@/components/admin/UsersCreditsManager';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';
import CompanyManager from '@/components/admin/CompanyManager';
import FeatureFlagsManager from '@/components/admin/FeatureFlagsManager';
import CorporateUserManager from '@/components/admin/CorporateUserManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import CreditAnalytics from '@/components/admin/CreditAnalytics';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';
import KnowledgeBaseStatus from '@/components/admin/KnowledgeBaseStatus';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">پنل سوپر ادمین</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/support-manager')}
              className="gap-2"
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span>مدیریت چت‌بات</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/legal-importer')}
              className="gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>وارد کردن قوانین</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <span>بازگشت به داشبورد</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-10 mb-8">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">آنالیتیکس</span>
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">لاگ امنیتی</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">شرکت‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="corporate-users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">کاربران</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <ToggleRight className="w-4 h-4" />
              <span className="hidden sm:inline">دسترسی‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">نظرات</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">بلاگ</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">فایل‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">اعتبار</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">متون</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <KnowledgeBaseStatus />
              <CreditAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="audit-logs">
            <AuditLogsViewer />
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManager />
          </TabsContent>

          <TabsContent value="corporate-users">
            <CorporateUserManager />
          </TabsContent>

          <TabsContent value="features">
            <FeatureFlagsManager />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="users">
            <UsersCreditsManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
