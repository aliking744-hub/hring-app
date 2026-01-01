import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Send, Paperclip, FileText, X, Loader2, Bot, User, ArrowRight, Sparkles, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { type: "image" | "pdf"; name: string; preview?: string }[];
  sources?: { articleNumber: string | null; category: string; similarity: number }[];
}

const LegalAdvisor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; type: "image" | "pdf"; preview?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) => [...prev, { 
            file, 
            type: "image", 
            preview: e.target?.result as string 
          }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        setAttachments((prev) => [...prev, { file, type: "pdf" }]);
      } else {
        toast.error("فقط فایل‌های PDF و تصویر پشتیبانی می‌شوند");
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: attachments.map((a) => ({ 
        type: a.type, 
        name: a.file.name, 
        preview: a.preview 
      })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      let fullQuery = input;
      const attachmentData: { images: string[]; pdfs: string[] } = { images: [], pdfs: [] };
      
      for (const attachment of currentAttachments) {
        if (attachment.type === "image" && attachment.preview) {
          attachmentData.images.push(attachment.preview);
          fullQuery += `\n[تصویر پیوست شده: ${attachment.file.name}]`;
        } else if (attachment.type === "pdf") {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(attachment.file);
          });
          attachmentData.pdfs.push(base64);
          fullQuery += `\n[فایل PDF پیوست شده: ${attachment.file.name}]`;
        }
      }

      const { data, error } = await supabase.functions.invoke("legal-advisor-chat", {
        body: { 
          query: fullQuery,
          images: attachmentData.images,
          pdfs: attachmentData.pdfs,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "پاسخی دریافت نشد",
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);

    } catch (error) {
      console.error("Error:", error);
      toast.error("خطا در ارسال پیام");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "متأسفم، مشکلی در پردازش سوال شما پیش آمد. لطفاً دوباره تلاش کنید.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      labor_law: "قانون کار",
      social_security: "تامین اجتماعی",
      court_rulings: "آرای دیوان",
    };
    return labels[category] || category;
  };

  const sampleQuestions = [
    "حقوق مرخصی زایمان چقدر است؟",
    "شرایط اخراج کارگر چیست؟",
    "ساعت کار قانونی هفتگی چقدر است؟",
    "حق سنوات چگونه محاسبه می‌شود؟",
  ];

  return (
    <div className="relative min-h-screen" dir="rtl">
      <Helmet>
        <title>مشاور حقوقی هوشمند | HRing</title>
        <meta name="description" content="پاسخ به سوالات حقوقی شما در زمینه قانون کار ایران با کمک هوش مصنوعی" />
      </Helmet>

      <AuroraBackground />
      
      <Link to="/dashboard" className="fixed top-24 right-6 z-50">
        <Button variant="outline" className="border-border bg-secondary/80 backdrop-blur-sm shadow-lg">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به داشبورد
        </Button>
      </Link>
      
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">مجهز به هوش مصنوعی</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              مشاور حقوقی هوشمند
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              سوالات حقوقی خود در زمینه قانون کار را بپرسید. می‌توانید تصویر یا PDF نیز پیوست کنید.
            </p>
          </motion.div>

          {/* Chat Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card overflow-hidden"
          >
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">مشاور حقوقی</h2>
                <span className="text-sm text-muted-foreground">
                  پاسخ‌دهی بر اساس قوانین کار ایران
                </span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[500px] px-6 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-20 h-20 mx-auto text-muted-foreground/20 mb-6" />
                    <p className="text-muted-foreground mb-6">
                      سوال حقوقی خود را بپرسید یا فایل آپلود کنید
                    </p>
                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                      <Badge variant="secondary">قانون کار</Badge>
                      <Badge variant="secondary">تامین اجتماعی</Badge>
                      <Badge variant="secondary">آرای دیوان</Badge>
                    </div>
                    
                    {/* Sample Questions */}
                    <div className="max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-3">نمونه سوالات:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {sampleQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(q)}
                            className="px-3 py-2 text-sm bg-secondary/50 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary"
                      }`}>
                        {message.role === "user" ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.role === "user" ? "text-left" : "text-right"}`}>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className={`flex gap-2 mb-2 flex-wrap ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            {message.attachments.map((att, i) => (
                              <div key={i} className="relative">
                                {att.type === "image" && att.preview ? (
                                  <img 
                                    src={att.preview} 
                                    alt={att.name}
                                    className="w-24 h-24 object-cover rounded-xl border"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm">{att.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`inline-block px-5 py-4 rounded-2xl max-w-[85%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tl-sm"
                            : "bg-secondary rounded-tr-sm"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>

                        {message.sources && message.sources.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {message.sources.map((source, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {getCategoryLabel(source.category)}
                                {source.articleNumber && ` - ماده ${source.articleNumber}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-secondary px-5 py-4 rounded-2xl rounded-tr-sm">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border px-6 py-4 space-y-3">
              {attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {attachments.map((att, index) => (
                    <div key={index} className="relative group">
                      {att.type === "image" && att.preview ? (
                        <img 
                          src={att.preview} 
                          alt="preview" 
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs max-w-[100px] truncate">{att.file.name}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="سوال حقوقی خود را بنویسید..."
                  disabled={isLoading}
                  className="flex-1 text-base"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || (!input.trim() && attachments.length === 0)}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalAdvisor;
