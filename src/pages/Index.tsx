import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BentoGrid from "@/components/landing/BentoGrid";
import DashboardPreview from "@/components/landing/DashboardPreview";
import ShopTeaser from "@/components/landing/ShopTeaser";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main>
        <HeroSection />
        <BentoGrid />
        <DashboardPreview />
        <ShopTeaser />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
