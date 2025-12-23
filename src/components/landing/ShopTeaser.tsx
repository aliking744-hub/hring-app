import { FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

const documents = [
  { title: "قرارداد کار تمام‌وقت", category: "قراردادها", downloads: "۲.۴k" },
  { title: "قرارداد پاره‌وقت", category: "قراردادها", downloads: "۱.۸k" },
  { title: "تعهدنامه رازداری", category: "قانونی", downloads: "۳.۱k" },
  { title: "فرم ارزیابی عملکرد", category: "ارزیابی", downloads: "۱.۲k" },
  { title: "چک‌لیست آنبوردینگ", category: "آنبوردینگ", downloads: "۲.۹k" },
  { title: "قرارداد پروژه‌ای", category: "قراردادها", downloads: "۱.۵k" },
];

const ShopTeaser = () => {
  return (
    <section className="py-24 px-4" dir="rtl">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                فروشگاه اسناد HR
              </h2>
              <p className="text-muted-foreground text-lg">
                قالب‌های آماده قرارداد و مستندات منابع انسانی
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="border-border bg-secondary/50 hover:bg-secondary">
                مشاهده همه
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="horizontal-scroll pb-4">
          {documents.map((doc, index) => (
            <ScrollReveal key={doc.title} delay={index * 0.05}>
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-6 w-72 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                
                <span className="text-xs text-primary font-medium">
                  {doc.category}
                </span>
                
                <h3 className="text-lg font-semibold text-foreground mt-1 mb-3">
                  {doc.title}
                </h3>
                
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Download className="w-4 h-4" />
                  <span>{doc.downloads} دانلود</span>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopTeaser;
