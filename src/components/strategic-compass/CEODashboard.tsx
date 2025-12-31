import { motion } from "framer-motion";
import { BarChart3, Activity, TrendingUp } from "lucide-react";

const CEODashboard = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          داشبورد مدیرعامل
        </h2>
        <p className="text-muted-foreground mt-2">نمای کلی عملکرد سازمان</p>
      </div>
    </div>
  );
};

export default CEODashboard;
