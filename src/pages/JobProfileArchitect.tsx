import { motion } from "framer-motion";
import { ArrowRight, Building2, FileText, Target, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const JobProfileArchitect = () => {
  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12"
        >
          <Link to="/modules">
            <Button variant="outline" size="icon" className="border-border bg-secondary/50">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Job Profile Architect
            </h1>
            <p className="text-muted-foreground">طراحی و ساخت پروفایل شغلی حرفه‌ای</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Job Profile Architect</CardTitle>
              <CardDescription className="text-lg">
                این ماژول برای طراحی پروفایل شغلی کامل آماده است
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
                  <Target className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">تعریف اهداف شغلی</h4>
                    <p className="text-sm text-muted-foreground">مشخص کردن اهداف و وظایف کلیدی</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
                  <Users className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">شایستگی‌های مورد نیاز</h4>
                    <p className="text-sm text-muted-foreground">تعیین مهارت‌ها و توانمندی‌ها</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
                  <FileText className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">مستندسازی کامل</h4>
                    <p className="text-sm text-muted-foreground">خروجی PDF و Word</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
                  <Sparkles className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">هوش مصنوعی</h4>
                    <p className="text-sm text-muted-foreground">پیشنهادات هوشمند</p>
                  </div>
                </div>
              </div>

              <div className="text-center p-6 rounded-lg border-2 border-dashed border-border">
                <p className="text-muted-foreground mb-4">
                  کد ماژول Job Profile Architect را اینجا قرار دهید
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Repository: github.com/aliking744-hub/job-profile-architect
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default JobProfileArchitect;
