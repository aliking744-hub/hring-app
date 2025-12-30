import { useState } from "react";
import { ArrowRight, Settings, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import AdminProductTable from "@/components/digital-store/AdminProductTable";
import UserMarketplace from "@/components/digital-store/UserMarketplace";

const Shop = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeView, setActiveView] = useState<"marketplace" | "admin">("marketplace");

  return (
    <div className="relative min-h-screen" dir="rtl">
      <Helmet>
        <title>فروشگاه اسناد دیجیتال | زیرساخت</title>
        <meta name="description" content="قالب‌های حرفه‌ای و آماده استفاده برای تمام نیازهای منابع انسانی شما" />
      </Helmet>

      <AuroraBackground />
      
      {/* Sticky Back Button */}
      <Link to="/dashboard" className="fixed top-24 right-6 z-50">
        <Button variant="outline" className="border-border bg-secondary/80 backdrop-blur-sm shadow-lg">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به داشبورد
        </Button>
      </Link>
      
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto">
          {/* Admin Toggle */}
          {isAdmin && !adminLoading && (
            <div className="flex justify-center mb-8">
              <Tabs 
                value={activeView} 
                onValueChange={(v) => setActiveView(v as "marketplace" | "admin")}
                className="w-auto"
              >
                <TabsList className="bg-secondary/50 border border-border">
                  <TabsTrigger 
                    value="marketplace" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                  >
                    <Store className="w-4 h-4" />
                    نمای فروشگاه
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    مدیریت محصولات
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Content */}
          {activeView === "admin" && isAdmin ? (
            <AdminProductTable />
          ) : (
            <UserMarketplace />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
