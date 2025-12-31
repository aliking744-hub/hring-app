import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const DecisionJournal = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          ژورنال تصمیم
        </h2>
        <p className="text-muted-foreground mt-2">ثبت فرآیند تصمیم‌گیری</p>
      </div>
    </div>
  );
};

export default DecisionJournal;
