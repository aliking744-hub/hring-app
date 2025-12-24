import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Sparkles, FileText, Copy, Download } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const JobDescriptionGenerator = () => {
  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="border-border bg-secondary/50">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              ایجاد شرح شغلی
            </h1>
            <p className="text-muted-foreground">با هوش مصنوعی شرح شغلی حرفه‌ای بسازید</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="title">عنوان شغلی</Label>
              <Input 
                id="title" 
                placeholder="مثال: توسعه‌دهنده فرانت‌اند ارشد" 
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">دپارتمان</Label>
              <Input 
                id="department" 
                placeholder="مثال: فناوری اطلاعات" 
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">سابقه کاری مورد نیاز</Label>
              <Input 
                id="experience" 
                placeholder="مثال: ۳ تا ۵ سال" 
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">مهارت‌های کلیدی</Label>
              <Textarea 
                id="skills" 
                placeholder="مهارت‌های مورد نیاز را وارد کنید..."
                className="bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <Button className="w-full glow-button text-foreground">
              <Sparkles className="w-4 h-4 ml-2" />
              تولید شرح شغلی
            </Button>
          </motion.div>

          {/* Output Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                پیش‌نمایش
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border bg-secondary/50">
                  <Copy className="w-4 h-4 ml-1" />
                  کپی
                </Button>
                <Button variant="outline" size="sm" className="border-border bg-secondary/50">
                  <Download className="w-4 h-4 ml-1" />
                  دانلود
                </Button>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 min-h-[400px] text-muted-foreground">
              <p className="text-center mt-20">
                فرم را پر کنید و روی "تولید شرح شغلی" کلیک کنید...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionGenerator;
