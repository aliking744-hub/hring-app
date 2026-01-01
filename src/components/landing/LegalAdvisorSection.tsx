import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Send, Paperclip, Image, FileText, X, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { type: "image" | "pdf"; name: string; preview?: string }[];
  sources?: { articleNumber: string | null; category: string; similarity: number }[];
}

const LegalAdvisorSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; type: "image" | "pdf"; preview?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getSetting } = useSiteSettings();

  const legalBadge = getSetting('legal_badge', 'مجهز به هوش مصنوعی');
  const legalTitle = getSetting('legal_title', 'مشاور حقوقی هوشمند');
  const legalSubtitle = getSetting('legal_subtitle', 'سوالات حقوقی خود در زمینه قانون کار را بپرسید. می‌توانید تصویر یا PDF نیز پیوست کنید.');

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
      // Build the query with attachment info
      let fullQuery = input;
      
      // Process attachments
      const attachmentData: { images: string[]; pdfs: string[] } = { images: [], pdfs: [] };
      
      for (const attachment of currentAttachments) {
        if (attachment.type === "image" && attachment.preview) {
          attachmentData.images.push(attachment.preview);
          fullQuery += `\n[تصویر پیوست شده: ${attachment.file.name}]`;
        } else if (attachment.type === "pdf") {
          // Convert PDF to base64
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
      
      // Scroll to bottom
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

  return (
    <section className="py-24 px-4" dir="rtl">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{legalBadge}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {legalTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {legalSubtitle}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setIsOpen(true)}
            className="glass-card p-8 max-w-2xl mx-auto cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  سوال حقوقی خود را بپرسید...
                </h3>
                <p className="text-muted-foreground text-sm">
                  کلیک کنید تا چت باز شود
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Image className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Chat Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0" dir="rtl">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="block">مشاور حقوقی</span>
                <span className="text-xs font-normal text-muted-foreground">
                  پاسخ‌دهی بر اساس قوانین کار ایران
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    سوال حقوقی خود را بپرسید یا فایل آپلود کنید
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge variant="secondary">قانون کار</Badge>
                    <Badge variant="secondary">تامین اجتماعی</Badge>
                    <Badge variant="secondary">آرای دیوان</Badge>
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === "user" ? "text-left" : "text-right"}`}>
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className={`flex gap-2 mb-2 flex-wrap ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          {message.attachments.map((att, i) => (
                            <div key={i} className="relative">
                              {att.type === "image" && att.preview ? (
                                <img 
                                  src={att.preview} 
                                  alt={att.name}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-xs">{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tl-sm"
                          : "bg-secondary rounded-tr-sm"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      {/* Sources */}
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
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tr-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t px-6 py-4 space-y-3">
            {/* Attachment Previews */}
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

            <div className="flex gap-2">
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
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="سوال خود را بنویسید..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && attachments.length === 0)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LegalAdvisorSection;
