import { motion } from "framer-motion";
import ErdtreeScene from "./ErdtreeScene";
import DepartmentLegend from "./DepartmentLegend";
import StrategicLegend from "./StrategicLegend";
import ControlsHint from "./ControlsHint";
import { Sparkles } from "lucide-react";

const StrategicErdtree = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6" dir="rtl">
        <div className="inline-flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-2xl font-bold text-foreground">درخت استراتژیک ارد</h2>
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          تجسم سه‌بعدی رشد سازمانی - هر برگ نماد یک دستاورد استراتژیک است
        </p>
      </div>

      {/* 3D Scene Container */}
      <div className="relative h-[600px] rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        <ErdtreeScene />
        <DepartmentLegend />
        <StrategicLegend />
        <ControlsHint />
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/40 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/40 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-xl pointer-events-none" />
      </div>

      {/* Strategic Insight */}
      <div className="mt-6 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg" dir="rtl">
        <h3 className="text-sm font-bold text-[#D4AF37] mb-2">💡 بینش استراتژیک</h3>
        <p className="text-sm text-muted-foreground">
          درخت متعادل نشان‌دهنده سلامت سازمانی است. اگر قسمت پایین درخت (وظایف عملیاتی) خالی باشد، 
          نشان‌دهنده ضعف در اجرا است. اگر بالای درخت (وظایف چشم‌اندازی) خالی باشد، 
          نشان‌دهنده فقدان دید استراتژیک است.
        </p>
      </div>
    </motion.div>
  );
};

export default StrategicErdtree;
