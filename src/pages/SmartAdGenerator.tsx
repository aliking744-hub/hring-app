import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Megaphone, Sparkles, Eye, Copy, Share2, Loader2, Image } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdData {
  adText: string;
  imagePrompt: string;
  imageDimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  hashtags?: string[];
  tips?: string[];
}

const SmartAdGenerator = () => {
  const [position, setPosition] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [highlights, setHighlights] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [adData, setAdData] = useState<AdData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!position.trim() || !platform || !tone) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای اجباری را پر کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-ad', {
        body: { 
          jobTitle: position, 
          companyName: "شرکت", 
          platform, 
          tone, 
          industry: highlights,
          generateImage: false 
        }
      });

      if (error) throw error;
      
      if (data.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAdData({
        adText: data.text,
        imagePrompt: "",
        imageDimensions: { width: 1200, height: 628, aspectRatio: "1.91:1" },
        hashtags: [],
        tips: []
      });
      toast({
        title: "موفق",
        description: "آگهی با موفقیت تولید شد.",
      });
    } catch (error) {
      console.error("Error generating ad:", error);
      toast({
        title: "خطا",
        description: "خطا در تولید آگهی. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (adData?.adText) {
      await navigator.clipboard.writeText(adData.adText);
      toast({ title: "متن آگهی کپی شد!" });
    }
  };

  const handleCopyImagePrompt = async () => {
    if (adData?.imagePrompt) {
      await navigator.clipboard.writeText(adData.imagePrompt);
      toast({ title: "پرامپت تصویر کپی شد!" });
    }
  };

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
              <Label htmlFor="position">موقعیت شغلی *</Label>
              <Input 
                id="position" 
                placeholder="عنوان موقعیت شغلی" 
                className="bg-secondary/50 border-border"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">پلتفرم انتشار *</Label>
              <Select value={platform} onValueChange={setPlatform}>
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
              <Label htmlFor="tone">لحن آگهی *</Label>
              <Select value={tone} onValueChange={setTone}>
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
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
              />
            </div>

            <Button 
              className="w-full glow-button text-foreground"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال تولید...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  تولید آگهی
                </>
              )}
            </Button>
          </motion.div>

          {/* Output Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                پیش‌نمایش آگهی
              </h2>
              {adData && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-border bg-secondary/50" onClick={handleCopy}>
                    <Copy className="w-4 h-4 ml-1" />
                    کپی
                  </Button>
                  <Button variant="outline" size="sm" className="border-border bg-secondary/50">
                    <Share2 className="w-4 h-4 ml-1" />
                    انتشار
                  </Button>
                </div>
              )}
            </div>

            {!adData ? (
              <div className="bg-secondary/30 rounded-lg p-4 min-h-[300px] flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  اطلاعات را وارد کنید و روی "تولید آگهی" کلیک کنید...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ad Text */}
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-primary mb-2">متن آگهی:</h3>
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {adData.adText}
                  </p>
                  {adData.hashtags && adData.hashtags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {adData.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Prompt */}
                {adData.imagePrompt && (
                  <div className="bg-purple-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        پرامپت تولید تصویر:
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-400 hover:text-purple-300"
                        onClick={handleCopyImagePrompt}
                      >
                        <Copy className="w-3 h-3 ml-1" />
                        کپی
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed" dir="ltr">
                      {adData.imagePrompt}
                    </p>
                    <div className="mt-2 text-xs text-purple-400">
                      ابعاد پیشنهادی: {adData.imageDimensions.width}×{adData.imageDimensions.height} ({adData.imageDimensions.aspectRatio})
                    </div>
                  </div>
                )}

                {/* Tips */}
                {adData.tips && adData.tips.length > 0 && (
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-400 mb-2">نکات بهینه‌سازی:</h3>
                    <ul className="space-y-1">
                      {adData.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">✓ {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SmartAdGenerator;
