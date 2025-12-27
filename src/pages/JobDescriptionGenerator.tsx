import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Sparkles, Download, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCredits, CREDIT_COSTS } from "@/hooks/useCredits";
import { jsPDF } from "jspdf";
import logoImage from "@/assets/logo.png";

const seniorityLevels = [
  { value: "junior", label: "کارشناس (Junior)" },
  { value: "senior", label: "کارشناس ارشد (Senior)" },
  { value: "lead", label: "سرپرست (Lead)" },
  { value: "manager", label: "مدیر (Manager)" },
];

const JobDescriptionGenerator = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();
  const { credits, deductForOperation, hasEnoughCredits } = useCredits();

  const handleGenerate = async () => {
    if (!jobTitle || !industry || !seniorityLevel) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان شغلی، صنعت و سطح ارشدیت را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughCredits('JOB_PROFILE')) {
      toast({
        title: "اعتبار ناکافی",
        description: `برای این عملیات ${CREDIT_COSTS.JOB_PROFILE} جم نیاز دارید. اعتبار فعلی: ${credits}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const deducted = await deductForOperation('JOB_PROFILE');
      if (!deducted) {
        toast({ title: "خطا", description: "کسر اعتبار با مشکل مواجه شد", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-job-profile", {
        body: { jobTitle, industry, seniorityLevel, companyName },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "خطا", description: data.error, variant: "destructive" });
        return;
      }

      setGeneratedContent(data.content);
      toast({ title: "موفق", description: "پروفایل شغلی با موفقیت تولید شد." });
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "خطا", description: "خطا در تولید پروفایل شغلی", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!generatedContent) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Load and add logo
    const img = new Image();
    img.src = logoImage;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Add logo centered at top
    const logoWidth = 30;
    const logoHeight = 30;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);

    // Add Persian font support - use built-in Helvetica for now with RTL handling
    doc.setFont("Helvetica", "normal");
    
    // Parse markdown content and convert to clean text
    const cleanContent = generatedContent
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/\*/g, "") // Remove italic markers
      .replace(/\|/g, " | ") // Clean table separators
      .replace(/-{3,}/g, "") // Remove horizontal rules
      .replace(/^\s*[-*]\s/gm, "• ") // Convert list items
      .split("\n")
      .filter(line => line.trim() !== "");

    let yPosition = 50;
    const margin = 15;
    const lineHeight = 7;
    const maxWidth = pageWidth - margin * 2;

    for (const line of cleanContent) {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }

      // Check if it's a section header (lines that were headers in markdown)
      const isHeader = line.includes("بخش") || line.includes("هویت") || line.includes("ماموریت") || 
                       line.includes("مسئولیت") || line.includes("شایستگی") || line.includes("شرایط");
      
      if (isHeader && !line.includes("|")) {
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246); // Primary blue color
        yPosition += 5;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51);
      }

      // Split long lines
      const splitLines = doc.splitTextToSize(line, maxWidth);
      for (const splitLine of splitLines) {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = 20;
        }
        // Right-align text for RTL
        doc.text(splitLine, pageWidth - margin, yPosition, { align: "right" });
        yPosition += lineHeight;
      }
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`صفحه ${i} از ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`job-profile-${jobTitle || "document"}.pdf`);
    toast({ title: "موفق", description: "فایل PDF با موفقیت دانلود شد." });
  };

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="border-border bg-secondary/50">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              ایجاد پروفایل شغلی
            </h1>
            <p className="text-muted-foreground">با هوش مصنوعی سند شرح شغلی حرفه‌ای بسازید</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-6">
            <div className="space-y-2">
              <Label>عنوان شغلی *</Label>
              <Input placeholder="مثال: مدیر محصول" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label>صنعت *</Label>
              <Input placeholder="مثال: فناوری اطلاعات" value={industry} onChange={(e) => setIndustry(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label>سطح ارشدیت *</Label>
              <Select value={seniorityLevel} onValueChange={setSeniorityLevel}>
                <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="انتخاب کنید..." /></SelectTrigger>
                <SelectContent>
                  {seniorityLevels.map((level) => (<SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نام شرکت (اختیاری)</Label>
              <Input placeholder="مثال: شرکت فناوری" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
            <Button className="w-full glow-button text-foreground" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />در حال تولید...</> : <><Sparkles className="w-4 h-4 ml-2" />تولید پروفایل شغلی</>}
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">پیش‌نمایش</h2>
              {generatedContent && (
                <Button onClick={generatePDF} className="glow-button text-foreground">
                  <Download className="w-4 h-4 ml-2" />
                  دانلود PDF
                </Button>
              )}
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {generatedContent ? (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {generatedContent.split('\n').map((line, index) => {
                    const isHeader = line.startsWith('##');
                    const cleanLine = line.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '');
                    
                    if (isHeader) {
                      return <h3 key={index} className="text-primary font-bold mt-4 mb-2 text-base">{cleanLine}</h3>;
                    }
                    if (line.startsWith('|')) {
                      return <div key={index} className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded my-1">{cleanLine}</div>;
                    }
                    if (line.trim() === '') return <br key={index} />;
                    return <p key={index} className="mb-1">{cleanLine}</p>;
                  })}
                </div>
              ) : (
                <p className="text-center mt-20 text-muted-foreground">فرم را پر کنید و روی "تولید پروفایل شغلی" کلیک کنید...</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionGenerator;
