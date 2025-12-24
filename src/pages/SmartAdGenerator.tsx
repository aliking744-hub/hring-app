import { motion } from "framer-motion";
import { ArrowRight, Megaphone, Sparkles, Eye, Copy, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SmartAdGenerator = () => {
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
              <Megaphone className="w-6 h-6 text-primary" />
              ایجاد آگهی هوشمند
            </h1>
            <p className="text-muted-foreground">آگهی استخدام جذاب برای پلتفرم‌های مختلف</p>
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
              <Label htmlFor="position">موقعیت شغلی</Label>
              <Input 
                id="position" 
                placeholder="عنوان موقعیت شغلی" 
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">پلتفرم انتشار</Label>
              <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب پلتفرم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">لینکدین</SelectItem>
                  <SelectItem value="jobinja">جابینجا</SelectItem>
                  <SelectItem value="jobvision">جاب‌ویژن</SelectItem>
                  <SelectItem value="instagram">اینستاگرام</SelectItem>
                  <SelectItem value="telegram">تلگرام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">لحن آگهی</Label>
              <Select>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب لحن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">رسمی</SelectItem>
                  <SelectItem value="friendly">دوستانه</SelectItem>
                  <SelectItem value="professional">حرفه‌ای</SelectItem>
                  <SelectItem value="creative">خلاقانه</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlights">ویژگی‌های جذاب شغل</Label>
              <Textarea 
                id="highlights" 
                placeholder="مزایا و ویژگی‌های برجسته این موقعیت..."
                className="bg-secondary/50 border-border min-h-[100px]"
              />
            </div>

            <Button className="w-full glow-button text-foreground">
              <Sparkles className="w-4 h-4 ml-2" />
              تولید آگهی
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
                <Eye className="w-5 h-5 text-primary" />
                پیش‌نمایش آگهی
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border bg-secondary/50">
                  <Copy className="w-4 h-4 ml-1" />
                  کپی
                </Button>
                <Button variant="outline" size="sm" className="border-border bg-secondary/50">
                  <Share2 className="w-4 h-4 ml-1" />
                  انتشار
                </Button>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 min-h-[400px] text-muted-foreground">
              <p className="text-center mt-20">
                اطلاعات را وارد کنید و روی "تولید آگهی" کلیک کنید...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SmartAdGenerator;
