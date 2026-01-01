import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "سارا احمدی",
    role: "مدیر منابع انسانی",
    company: "شرکت فناوران نوین",
    avatar: "",
    content: "با استفاده از HRing، زمان استخدام ما از ۴۵ روز به ۱۲ روز کاهش یافت. ابزار هدهانتینگ هوشمند واقعاً بی‌نظیر است.",
    rating: 5,
  },
  {
    name: "محمد رضایی",
    role: "مدیرعامل",
    company: "استارتاپ دیجیتال",
    avatar: "",
    content: "قطب‌نمای استراتژیک به ما کمک کرد تا تصمیمات بهتری بگیریم. اکنون تیم ما هماهنگ‌تر از همیشه کار می‌کند.",
    rating: 5,
  },
  {
    name: "مریم حسینی",
    role: "رئیس واحد جذب",
    company: "هلدینگ پارسیان",
    avatar: "",
    content: "ماژول آنبوردینگ HRing فرآیند ورود کارمندان جدید را کاملاً متحول کرد. نرخ ماندگاری ما ۳۰٪ افزایش یافته.",
    rating: 5,
  },
  {
    name: "علی کریمی",
    role: "مدیر عملیات",
    company: "گروه صنعتی آریا",
    avatar: "",
    content: "ماشین‌حساب هزینه و ابزارهای تحلیلی HRing به ما دید کاملی از هزینه‌های منابع انسانی داده است.",
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-4" dir="rtl">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            نظرات <span className="gradient-text-primary">مشتریان</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ببینید چرا صدها شرکت به HRing اعتماد کرده‌اند
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Quote className="w-8 h-8 text-primary/30 shrink-0 rotate-180" />
                    <p className="text-foreground/90 leading-relaxed">
                      {testimonial.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {testimonial.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} در {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "۵۰۰+", label: "شرکت فعال" },
            { value: "۱۵,۰۰۰+", label: "استخدام موفق" },
            { value: "۹۸٪", label: "رضایت مشتریان" },
            { value: "۷۰٪", label: "صرفه‌جویی زمان" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-card/30 border border-border/30"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
