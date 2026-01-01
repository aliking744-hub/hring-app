import { Helmet } from "react-helmet-async";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import LaborComplaintAssistant from "@/components/legal/LaborComplaintAssistant";

const LaborComplaint = () => {
  return (
    <>
      <Helmet>
        <title>وکیل شخصی | دستیار تنظیم دادخواست کار</title>
        <meta name="description" content="تنظیم دادخواست کار با کمک هوش مصنوعی. تحلیل شانس موفقیت و تولید متن رسمی برای سامانه جامع روابط کار." />
      </Helmet>
      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">وکیل شخصی</h1>
            <p className="text-muted-foreground mb-8">دستیار هوشمند تنظیم دادخواست کار</p>
            <LaborComplaintAssistant />
          </div>
        </main>
      </div>
    </>
  );
};

export default LaborComplaint;
