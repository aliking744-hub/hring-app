import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Calendar, Clock, FileText, Loader2, Printer, AlertTriangle, CheckCircle, Brain, Target, Heart, Code } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InterviewQuestion {
  id: string;
  section: string;
  sectionIcon: "technical" | "behavioral" | "intelligence" | "cultural";
  question: string;
  goodSigns: string[];
  redFlags: string[];
}

interface InterviewKit {
  questions: InterviewQuestion[];
}

const seniorityLevels = [
  { value: "junior", label: "کارشناس (Junior)" },
  { value: "senior", label: "کارشناس ارشد (Senior)" },
  { value: "lead", label: "سرپرست (Lead)" },
  { value: "manager", label: "مدیر (Manager)" },
];

const focusAreas = [
  { value: "general", label: "عمومی" },
  { value: "technical", label: "تخصصی و فنی" },
  { value: "leadership", label: "رهبری و مدیریت" },
  { value: "cultural", label: "تناسب فرهنگی" },
];

const InterviewAssistant = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [focusArea, setFocusArea] = useState("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getSectionIcon = (iconType: string) => {
    switch (iconType) {
      case "technical":
        return <Code className="w-5 h-5" />;
      case "behavioral":
        return <Heart className="w-5 h-5" />;
      case "intelligence":
        return <Brain className="w-5 h-5" />;
      case "cultural":
        return <Target className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !seniorityLevel) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان شغل و سطح ارشدیت را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-kit', {
        body: { jobTitle, industry, seniorityLevel, focusArea }
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

      setKit(data);
      toast({
        title: "موفق",
        description: "راهنمای مصاحبه با موفقیت تولید شد.",
      });
    } catch (error) {
      console.error("Error generating kit:", error);
      toast({
        title: "خطا",
        description: "خطا در تولید راهنما. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group questions by section
  const groupedQuestions = kit?.questions?.reduce((acc, q) => {
    if (!acc[q.section]) {
      acc[q.section] = { icon: q.sectionIcon, questions: [] };
    }
    acc[q.section].questions.push(q);
    return acc;
  }, {} as Record<string, { icon: string; questions: InterviewQuestion[] }>) || {};

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 print:hidden"
        >
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="border-border bg-secondary/50">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                دستیار مصاحبه هوشمند
              </h1>
              <p className="text-muted-foreground">تولید سوالات تیز مصاحبه با هوش مصنوعی</p>
            </div>
          </div>
          {kit && (
            <Button onClick={handlePrint} variant="outline" className="border-border bg-secondary/50">
              <Printer className="w-4 h-4 ml-2" />
              چاپ راهنما
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 space-y-6 print:hidden"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              اطلاعات موقعیت شغلی
            </h2>

            <div className="space-y-2">
              <Label>عنوان شغل *</Label>
              <Input 
                placeholder="مثال: توسعه‌دهنده فرانت‌اند" 
                className="bg-secondary/50 border-border"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>صنعت (اختیاری)</Label>
              <Input 
                placeholder="مثال: فناوری اطلاعات" 
                className="bg-secondary/50 border-border"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>سطح ارشدیت *</Label>
              <Select value={seniorityLevel} onValueChange={setSeniorityLevel}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب کنید..." />
                </SelectTrigger>
                <SelectContent>
                  {seniorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تمرکز مصاحبه</Label>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="انتخاب کنید..." />
                </SelectTrigger>
                <SelectContent>
                  {focusAreas.map((area) => (
                    <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <FileText className="w-4 h-4 ml-2" />
                  تولید سوالات مصاحبه
                </>
              )}
            </Button>
          </motion.div>

          {/* Generated Kit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-6 print:shadow-none print:border-none"
            ref={printRef}
          >
            {/* Print Header */}
            {kit && (
              <div className="hidden print:block mb-6 pb-4 border-b-2 border-primary">
                <h1 className="text-2xl font-bold text-center">راهنمای مصاحبه</h1>
                <div className="text-center mt-2">
                  <p className="text-lg font-semibold">موقعیت: {jobTitle}</p>
                  <p className="text-muted-foreground">سطح: {seniorityLevels.find(l => l.value === seniorityLevel)?.label}</p>
                </div>
              </div>
            )}

            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 print:hidden">
              <Clock className="w-5 h-5 text-primary" />
              سوالات مصاحبه
            </h2>

            {!kit ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>اطلاعات را وارد کنید و روی "تولید سوالات" کلیک کنید.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedQuestions).map(([sectionName, section], sIndex) => (
                  <div key={sIndex} className="bg-secondary/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      {getSectionIcon(section.icon)}
                      {sectionName}
                    </h3>
                    <div className="space-y-4">
                      {section.questions.map((q, qIndex) => (
                        <div key={qIndex} className="border-r-2 border-primary/30 pr-4 pb-4">
                          <p className="font-medium text-foreground mb-3">
                            {qIndex + 1}. {q.question}
                          </p>
                          
                          {/* Good Signs */}
                          {q.goodSigns?.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-green-400 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                نشانه‌های مثبت:
                              </p>
                              <ul className="space-y-1 mr-5">
                                {q.goodSigns.map((sign, i) => (
                                  <li key={i} className="text-sm text-muted-foreground">✓ {sign}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Red Flags */}
                          {q.redFlags?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-400 mb-1 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                هشدارها:
                              </p>
                              <div className="flex flex-wrap gap-2 mr-5">
                                {q.redFlags.map((flag, i) => (
                                  <span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                    ⚠️ {flag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterviewAssistant;