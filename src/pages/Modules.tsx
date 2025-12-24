import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Megaphone, Users, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: Briefcase,
    title: "شرح شغل",
    description: "تولید شرح شغل حرفه‌ای با هوش مصنوعی",
    path: "/job-description",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Megaphone,
    title: "آگهی استخدام",
    description: "ایجاد آگهی جذاب برای پلتفرم‌های مختلف",
    path: "/smart-ad",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "دستیار مصاحبه",
    description: "راهنمای مصاحبه و سوالات تخصصی",
    path: "/interviews",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: UserPlus,
    title: "آنبوردینگ ۹۰ روزه",
    description: "برنامه جامع پذیرش نیروی جدید",
    path: "/onboarding",
    color: "from-green-500 to-emerald-500",
  },
];

const Modules = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen" dir="rtl">
      <AuroraBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12"
        >
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="border-border bg-secondary/50">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ماژول‌ها</h1>
            <p className="text-muted-foreground">ابزارهای هوشمند منابع انسانی</p>
          </div>
        </motion.div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onClick={() => navigate(tool.path)}
              className="glass-card p-8 cursor-pointer group hover:scale-[1.02] transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{tool.title}</h3>
              <p className="text-muted-foreground">{tool.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modules;
