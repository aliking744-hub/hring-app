import { motion } from "framer-motion";
import { ArrowRight, Boxes, Building2, LayoutGrid } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";

const modules = [
  {
    icon: Building2,
    title: "Job Profile Architect",
    description: "طراحی و ساخت پروفایل شغلی حرفه‌ای",
    path: "/job-architect",
    color: "from-indigo-500 to-purple-500",
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Boxes className="w-6 h-6" />
              ماژولها
            </h1>
            <p className="text-muted-foreground">ابزارهای تخصصی منابع انسانی</p>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onClick={() => navigate(module.path)}
              className="glass-card p-8 cursor-pointer group hover:scale-[1.02] transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{module.title}</h3>
              <p className="text-muted-foreground">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modules;
