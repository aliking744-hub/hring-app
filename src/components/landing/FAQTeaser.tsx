import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const FAQTeaser = () => {
  const faqs = [
    {
      question: "تفاوت پلن‌های فردی و سازمانی چیست؟",
      answer: "پلن‌های فردی برای کاربران مستقل طراحی شده و پلن‌های سازمانی برای تیم‌ها با قابلیت‌های مدیریتی پیشرفته.",
    },
    {
      question: "چگونه اعتبار بیشتر دریافت کنم؟",
      answer: "با ارتقای پلن یا خرید اعتبار اضافی از بخش ارتقا می‌توانید اعتبار بیشتری دریافت کنید.",
    },
    {
      question: "آیا امکان تست رایگان وجود دارد؟",
      answer: "بله! با پلن رایگان می‌توانید ۵ اعتبار روزانه دریافت و امکانات پایه را تست کنید.",
    },
  ];

  return (
    <section className="py-20 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">سوالات متداول</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              پاسخ سوالات شما
            </h2>
            <p className="text-muted-foreground text-lg">
              پرتکرارترین سوالات کاربران درباره پلن‌ها و امکانات
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <Link to="/faq?tab=faq">
              <Button variant="outline" size="lg" className="gap-2">
                مشاهده همه سوالات
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQTeaser;
