import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Package,
  Star,
  Building2,
  Sliders,
  Home,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuroraBackground from "@/components/AuroraBackground";
import { useAdmin } from "@/hooks/useAdmin";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useSiteName } from "@/hooks/useSiteSettings";

// Admin components
import UsersView from "@/components/admin/UsersView";
import UsersCreditsManager from "@/components/admin/UsersCreditsManager";
import BlogManager from "@/components/admin/BlogManager";
import ProductManager from "@/components/admin/ProductManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import CompanyManager from "@/components/admin/CompanyManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import CreditAnalytics from "@/components/admin/CreditAnalytics";
import ChatbotManager from "@/components/admin/ChatbotManager";
import AuditLogsViewer from "@/components/admin/AuditLogsViewer";
import CorporateUserManager from "@/components/admin/CorporateUserManager";
import FeaturePermissionsManager from "@/components/admin/FeaturePermissionsManager";

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const siteName = useSiteName();
  const [activeTab, setActiveTab] = useState("users");

  if (adminLoading || superAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">دسترسی محدود</h1>
        <p className="text-muted-foreground">شما به این صفحه دسترسی ندارید.</p>
        <Button asChild>
          <Link to="/dashboard">بازگشت به داشبورد</Link>
        </Button>
      </div>
    );
  }

  const adminTabs = [
    { id: "users", label: "کاربران", icon: Users },
    { id: "corporate", label: "کاربران شرکتی", icon: Building2 },
    { id: "credits", label: "اعتبارات", icon: BarChart3 },
    { id: "permissions", label: "دسترسی فیچرها", icon: Key },
    { id: "companies", label: "شرکت‌ها", icon: Building2 },
    { id: "blog", label: "وبلاگ", icon: FileText },
    { id: "products", label: "محصولات", icon: Package },
    { id: "testimonials", label: "نظرات", icon: Star },
    { id: "chatbot", label: "چت‌بات", icon: MessageSquare },
    { id: "settings", label: "تنظیمات", icon: Settings },
    { id: "audit", label: "لاگ‌ها", icon: Sliders },
  ];

  return (
    <>
      <Helmet>
        <title>پنل ادمین | {siteName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">پنل مدیریت</h1>
                <p className="text-sm text-muted-foreground">
                  {isSuperAdmin ? "سوپر ادمین" : "ادمین"}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <Home className="w-4 h-4 ml-2" />
                داشبورد
              </Link>
            </Button>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap h-auto gap-2 mb-6 bg-transparent">
              {adminTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6"
            >
              <TabsContent value="users" className="mt-0">
                <UsersView />
              </TabsContent>

              <TabsContent value="corporate" className="mt-0">
                <CorporateUserManager />
              </TabsContent>

              <TabsContent value="credits" className="mt-0">
                <div className="space-y-6">
                  <CreditAnalytics />
                  <UsersCreditsManager />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <FeaturePermissionsManager />
              </TabsContent>

              <TabsContent value="companies" className="mt-0">
                <CompanyManager />
              </TabsContent>

              <TabsContent value="blog" className="mt-0">
                <BlogManager />
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                <ProductManager />
              </TabsContent>

              <TabsContent value="testimonials" className="mt-0">
                <TestimonialsManager />
              </TabsContent>

              <TabsContent value="chatbot" className="mt-0">
                <ChatbotManager />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SiteSettingsManager />
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                <AuditLogsViewer />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Admin;
