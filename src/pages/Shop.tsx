import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, Filter, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const categories = ["همه", "قراردادها", "قانونی", "ارزیابی", "آنبوردینگ"];

const documents = [
  { id: 1, title: "قرارداد کار تمام‌وقت", category: "قراردادها", price: "۴۹,۰۰۰", downloads: "۲.۴k", popular: true },
  { id: 2, title: "قرارداد پاره‌وقت", category: "قراردادها", price: "۳۹,۰۰۰", downloads: "۱.۸k" },
  { id: 3, title: "تعهدنامه رازداری (NDA)", category: "قانونی", price: "۵۹,۰۰۰", downloads: "۳.۱k", popular: true },
  { id: 4, title: "فرم ارزیابی عملکرد سالانه", category: "ارزیابی", price: "۲۹,۰۰۰", downloads: "۱.۲k" },
  { id: 5, title: "چک‌لیست آنبوردینگ کامل", category: "آنبوردینگ", price: "۶۹,۰۰۰", downloads: "۲.۹k", popular: true },
  { id: 6, title: "قرارداد پروژه‌ای", category: "قراردادها", price: "۴۴,۰۰۰", downloads: "۱.۵k" },
  { id: 7, title: "فرم خروج و تسویه", category: "قانونی", price: "۳۴,۰۰۰", downloads: "۹۸۰" },
  { id: 8, title: "فرم ارزیابی ۳۶۰ درجه", category: "ارزیابی", price: "۵۴,۰۰۰", downloads: "۱.۱k" },
  { id: 9, title: "راهنمای آنبوردینگ ریموت", category: "آنبوردینگ", price: "۷۹,۰۰۰", downloads: "۲.۱k" },
];

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("همه");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<number[]>([]);
  const { toast } = useToast();

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "همه" || doc.category === activeCategory;
    const matchesSearch = doc.title.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (id: number) => {
    if (cart.includes(id)) {
      setCart(cart.filter((item) => item !== id));
      toast({ title: "از سبد خرید حذف شد" });
    } else {
      setCart([...cart, id]);
      toast({ title: "به سبد خرید اضافه شد" });
    }
  };

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      {/* Sticky Back Button */}
      <Link to="/dashboard" className="fixed top-6 right-6 z-50">
        <Button variant="outline" className="border-border bg-secondary/80 backdrop-blur-sm shadow-lg">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به داشبورد
        </Button>
      </Link>
      
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                فروشگاه اسناد HR
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                قالب‌های حرفه‌ای و آماده استفاده برای تمام نیازهای منابع انسانی شما
              </p>
            </div>
          </ScrollReveal>

          {/* Filters */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="جستجوی اسناد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-secondary/50 border-border"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat 
                      ? "glow-button text-foreground shrink-0" 
                      : "border-border bg-secondary/50 shrink-0"
                    }
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, index) => (
              <ScrollReveal key={doc.id} delay={index * 0.05}>
                <SpotlightCard className="h-full flex flex-col">
                  {doc.popular && (
                    <span className="absolute top-4 left-4 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      پرفروش
                    </span>
                  )}
                  
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  
                  <span className="text-xs text-primary font-medium">
                    {doc.category}
                  </span>
                  
                  <h3 className="text-lg font-semibold text-foreground mt-1 mb-2 flex-1">
                    {doc.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <Download className="w-4 h-4" />
                    <span>{doc.downloads} دانلود</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xl font-bold text-foreground">
                      {doc.price} <span className="text-sm font-normal text-muted-foreground">تومان</span>
                    </span>
                    
                    <Button
                      size="sm"
                      onClick={() => addToCart(doc.id)}
                      className={cart.includes(doc.id) 
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                        : "glow-button text-foreground"
                      }
                    >
                      {cart.includes(doc.id) ? (
                        <>
                          <Check className="w-4 h-4 ml-1" />
                          در سبد
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 ml-1" />
                          خرید
                        </>
                      )}
                    </Button>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>

          {/* Empty State */}
          {filteredDocs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                سندی یافت نشد
              </h3>
              <p className="text-muted-foreground">
                فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید
              </p>
            </motion.div>
          )}

          {/* Cart Summary */}
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card px-6 py-4 flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="font-medium">{cart.length} سند انتخاب شده</span>
              </div>
              <Button className="glow-button text-foreground">
                تکمیل خرید
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
