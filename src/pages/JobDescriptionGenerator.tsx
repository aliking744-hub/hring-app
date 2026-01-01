import { useState, useEffect } from "react";
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
import { useCredits, DIAMOND_COSTS } from "@/hooks/useCredits";
import { jsPDF } from "jspdf";
import logoImage from "@/assets/logo.png";
import DataPrivacyWarning from "@/components/DataPrivacyWarning";

const seniorityLevels = [
  { value: "junior", label: "کارشناس (Junior)" },
  { value: "senior", label: "کارشناس ارشد (Senior)" },
  { value: "lead", label: "سرپرست (Lead)" },
  { value: "manager", label: "مدیر (Manager)" },
];

// Function to reverse Persian text for RTL display in PDF
const reverseText = (text: string): string => {
  return text.split('').reverse().join('');
};

const JobDescriptionGenerator = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [fontBase64, setFontBase64] = useState<string | null>(null);
  const { toast } = useToast();
  const { credits, deductForOperation, hasEnoughCredits } = useCredits();

  // Load font on mount
  useEffect(() => {
    const loadFont = async () => {
      try {
        const response = await fetch('/fonts/BNAZANIN.TTF');
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setFontBase64(base64);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    };
    loadFont();
  }, []);

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
        description: `برای این عملیات ${DIAMOND_COSTS.JOB_PROFILE} الماس نیاز دارید. اعتبار فعلی: ${credits}`,
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
    if (!generatedContent || !fontBase64) {
      toast({ title: "خطا", description: "لطفاً صبر کنید تا فونت بارگذاری شود", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add B Nazanin font
    doc.addFileToVFS("BNazanin.ttf", fontBase64);
    doc.addFont("BNazanin.ttf", "BNazanin", "normal");
    doc.setFont("BNazanin");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Load and add logo
    const img = new Image();
    img.src = logoImage;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const logoWidth = 25;
    const logoHeight = 25;
    doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);

    // Add title
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    const title = "سند هویت و مشخصات شغلی";
    doc.text(reverseText(title), pageWidth - margin, 45, { align: "left" });

    // Parse and clean content
    const lines = generatedContent
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .split("\n")
      .filter(line => line.trim() !== "" && !line.match(/^-{3,}$/));

    let yPosition = 55;
    const lineHeight = 6;

    for (const line of lines) {
      // Check for new page
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 20;
      }

      const trimmedLine = line.trim();
      
      // Section headers (## )
      if (trimmedLine.startsWith("##")) {
        const headerText = trimmedLine.replace(/^#+\s*/, "");
        doc.setFontSize(13);
        doc.setTextColor(59, 130, 246);
        yPosition += 4;
        doc.text(reverseText(headerText), pageWidth - margin, yPosition, { align: "left" });
        yPosition += lineHeight + 2;
        
        // Add underline
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += 2;
        continue;
      }

      // Sub-headers (### )
      if (trimmedLine.startsWith("###")) {
        const subHeaderText = trimmedLine.replace(/^#+\s*/, "");
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        yPosition += 2;
        doc.text(reverseText(subHeaderText), pageWidth - margin, yPosition, { align: "left" });
        yPosition += lineHeight;
        continue;
      }

      // Table rows
      if (trimmedLine.startsWith("|")) {
        const cells = trimmedLine.split("|").filter(c => c.trim() !== "");
        if (cells.length >= 2 && !cells[0].match(/^-+$/)) {
          doc.setFontSize(9);
          doc.setTextColor(51, 51, 51);
          
          // Draw table row background
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition - 4, contentWidth, lineHeight + 2, "F");
          
          const cellWidth = contentWidth / cells.length;
          cells.forEach((cell, index) => {
            const cellText = cell.trim();
            const xPos = pageWidth - margin - (index * cellWidth) - cellWidth / 2;
            doc.text(reverseText(cellText), xPos, yPosition, { align: "center" });
          });
          yPosition += lineHeight + 1;
        }
        continue;
      }

      // Bullet points
      if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•")) {
        const bulletText = trimmedLine.replace(/^[-•]\s*/, "");
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51);
        
        // Add bullet
        doc.circle(pageWidth - margin - 2, yPosition - 1.5, 0.8, "F");
        
        // Split long text
        const maxTextWidth = contentWidth - 10;
        const splitLines = doc.splitTextToSize(reverseText(bulletText), maxTextWidth);
        for (const splitLine of splitLines) {
          if (yPosition > pageHeight - 25) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(splitLine, pageWidth - margin - 6, yPosition, { align: "left" });
          yPosition += lineHeight;
        }
        continue;
      }

      // Regular text
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      const maxTextWidth = contentWidth;
      const splitLines = doc.splitTextToSize(reverseText(trimmedLine), maxTextWidth);
      for (const splitLine of splitLines) {
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(splitLine, pageWidth - margin, yPosition, { align: "left" });
        yPosition += lineHeight;
      }
    }

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footerText = `${i} / ${pageCount}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    doc.save(`پروفایل-شغلی-${jobTitle || "سند"}.pdf`);
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

        {/* Data Privacy Warning for non-Plus users */}
        <DataPrivacyWarning className="mb-6" />

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
                <Button onClick={generatePDF} disabled={!fontBase64} className="glow-button text-foreground">
                  <Download className="w-4 h-4 ml-2" />
                  دانلود PDF
                </Button>
              )}
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {generatedContent ? (
                <div className="text-sm text-foreground leading-relaxed space-y-2" style={{ fontFamily: 'BNazanin, Tahoma, sans-serif' }}>
                  {generatedContent.split('\n').map((line, index) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.match(/^-{3,}$/)) return null;
                    
                    if (trimmed.startsWith("##")) {
                      const text = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                      return <h3 key={index} className="text-primary font-bold mt-4 mb-2 text-base border-b border-primary/30 pb-1">{text}</h3>;
                    }
                    if (trimmed.startsWith("###")) {
                      const text = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                      return <h4 key={index} className="text-muted-foreground font-semibold mt-3 mb-1">{text}</h4>;
                    }
                    if (trimmed.startsWith("|")) {
                      const cells = trimmed.split("|").filter(c => c.trim() && !c.match(/^-+$/));
                      if (cells.length >= 2) {
                        return (
                          <div key={index} className="grid grid-cols-2 gap-2 bg-secondary/50 px-3 py-1.5 rounded text-xs">
                            {cells.map((cell, i) => (
                              <span key={i} className={i === 0 ? "font-semibold" : ""}>{cell.trim().replace(/\*\*/g, '')}</span>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }
                    if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
                      const text = trimmed.replace(/^[-•]\s*/, '').replace(/\*\*/g, '');
                      return <p key={index} className="pr-4 relative before:content-['•'] before:absolute before:right-0 before:text-primary">{text}</p>;
                    }
                    const text = trimmed.replace(/\*\*/g, '');
                    return <p key={index}>{text}</p>;
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
