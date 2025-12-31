import { motion } from "framer-motion";
import { Sparkles, Star, Wand2 } from "lucide-react";

const DreamManifestation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)]">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">تجلی رویا</h2>
          <p className="text-muted-foreground max-w-md">
            فضایی برای تبدیل رویاهای استراتژیک به واقعیت
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-4">
          <div className="glass-card p-4 border border-[#D4AF37]/30">
            <Star className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">چشم‌انداز</h3>
            <p className="text-sm text-muted-foreground">تعریف آینده مطلوب</p>
          </div>
          
          <div className="glass-card p-4 border border-[#D4AF37]/30">
            <Wand2 className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">تبدیل</h3>
            <p className="text-sm text-muted-foreground">رویا به عمل</p>
          </div>
          
          <div className="glass-card p-4 border border-[#D4AF37]/30">
            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">تجلی</h3>
            <p className="text-sm text-muted-foreground">محقق‌سازی اهداف</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          این ماژول به زودی فعال خواهد شد...
        </p>
      </div>
    </motion.div>
  );
};

export default DreamManifestation;
