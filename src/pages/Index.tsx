import { Helmet } from "react-helmet-async";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import BentoGrid from "@/components/landing/BentoGrid";
import DashboardPreview from "@/components/landing/DashboardPreview";
import ShopTeaser from "@/components/landing/ShopTeaser";
import BlogTeaser from "@/components/landing/BlogTeaser";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>HRing - نرم افزار جامع منابع انسانی</title>
        <meta 
          name="description" 
          content="HRing سیستم مدیریت منابع انسانی نسل جدید. استخدام هوشمند، مصاحبه خودکار و آنبوردینگ حرفه‌ای با قدرت هوش مصنوعی. راهکار یکپارچه برای تیم‌های HR." 
        />
        <meta name="keywords" content="منابع انسانی, استخدام, مصاحبه, آنبوردینگ, HR, هوش مصنوعی, نرم افزار منابع انسانی" />
        <link rel="canonical" href="https://hring.ir/" />
      </Helmet>
      <div className="relative min-h-screen">
        <AuroraBackground />
        <Navbar />
        <main>
          <HeroSection />
          <DashboardPreview />
          <BentoGrid />
          <ShopTeaser />
          <TestimonialsSection />
          <BlogTeaser />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
