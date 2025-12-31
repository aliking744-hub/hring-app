import { motion } from "framer-motion";
import { Eye, Brain } from "lucide-react";

const MentalPrism = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Eye className="w-6 h-6 text-primary" />
          منشور ذهنی
        </h2>
        <p className="text-muted-foreground mt-2">تست قضاوت موقعیتی و تحلیل شکاف ادراکی</p>
      </div>
    </div>
  );
};

export default MentalPrism;
