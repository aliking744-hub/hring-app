import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Calendar, Clock, Video, FileText, Loader2, Printer, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InterviewGuide {
  candidateName: string;
  jobPosition: string;
  generatedAt: string;
  sections: {
    title: string;
    questions: {
      question: string;
      expectedAnswer: string;
      redFlags: string[];
    }[];
  }[];
  generalRedFlags: string[];
  closingTips: string[];
  rawContent?: string;
}

const InterviewAssistant = () => {
  const [candidateName, setCandidateName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!candidateName.trim() || !jobPosition.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً نام متقاضی و موقعیت شغلی را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-guide', {
        body: { candidateName, jobPosition }
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

      setGuide(data.guide);
      toast({
        title: "موفق",
        description: "راهنمای مصاحبه با موفقیت تولید شد.",
      });
    } catch (error) {
      console.error("Error generating guide:", error);
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
                دستیار مصاحبه
              </h1>
              <p className="text-muted-foreground">تولید راهنمای مصاحبه با هوش مصنوعی</p>
            </div>
          </div>
          {guide && (
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
              اطلاعات مصاحبه
            </h2>

            <div className="space-y-2">
              <Label htmlFor="candidate">نام متقاضی</Label>
              <Input 
                id="candidate" 
                placeholder="نام و نام خانوادگی" 
                className="bg-secondary/50 border-border"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">موقعیت شغلی</Label>
              <Input 
                id="position" 
                placeholder="عنوان موقعیت شغلی (مثال: توسعه‌دهنده فرانت‌اند)" 
                className="bg-secondary/50 border-border"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
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
                  <FileText className="w-4 h-4 ml-2" />
                  تولید راهنمای مصاحبه
                </>
              )}
            </Button>
          </motion.div>

          {/* Generated Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-6 print:shadow-none print:border-none"
            ref={printRef}
          >
            {/* Print Header */}
            {guide && (
              <div className="hidden print:block mb-6 pb-4 border-b-2 border-primary">
                <h1 className="text-2xl font-bold text-center">راهنمای مصاحبه</h1>
                <div className="text-center mt-2">
                  <p className="text-lg font-semibold">نام متقاضی: {guide.candidateName}</p>
                  <p className="text-muted-foreground">موقعیت: {guide.jobPosition}</p>
                </div>
              </div>
            )}

            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 print:hidden">
              <Clock className="w-5 h-5 text-primary" />
              راهنمای مصاحبه
            </h2>

            {!guide ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>اطلاعات را وارد کنید و روی "تولید راهنما" کلیک کنید.</p>
              </div>
            ) : guide.rawContent ? (
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {guide.rawContent}
              </div>
            ) : (
              <div className="space-y-6">
                {guide.sections?.map((section, sIndex) => (
                  <div key={sIndex} className="bg-secondary/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-primary mb-4">{section.title}</h3>
                    <div className="space-y-4">
                      {section.questions?.map((q, qIndex) => (
                        <div key={qIndex} className="border-r-2 border-primary/30 pr-4">
                          <p className="font-medium text-foreground mb-2">
                            {qIndex + 1}. {q.question}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>پاسخ مورد انتظار:</strong> {q.expectedAnswer}
                          </p>
                          {q.redFlags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {q.redFlags.map((flag, fIndex) => (
                                <span key={fIndex} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                  ⚠️ {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {guide.generalRedFlags?.length > 0 && (
                  <div className="bg-red-500/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      علائم هشدار کلی
                    </h3>
                    <ul className="space-y-2">
                      {guide.generalRedFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-muted-foreground">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {guide.closingTips?.length > 0 && (
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">نکات پایانی</h3>
                    <ul className="space-y-2">
                      {guide.closingTips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground">✓ {tip}</li>
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

export default InterviewAssistant;
