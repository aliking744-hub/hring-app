import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import LivingErdtreeScene from "./LivingErdtreeScene";
import DepartmentLegend from "./DepartmentLegend";
import StrategicLegend from "./StrategicLegend";
import ControlsHint from "./ControlsHint";
import FilterControls, { STRATEGIC_LEVELS } from "./FilterControls";
import { Sparkles, Loader2 } from "lucide-react";
import { DEPARTMENTS } from "./types";
import { useStrategicAchievements } from "@/hooks/useStrategicAchievements";

const StrategicErdtree = () => {
  const { tasks, newTaskIds, loading } = useStrategicAchievements();
  
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    DEPARTMENTS.map((d) => d.id)
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    STRATEGIC_LEVELS.map((l) => l.id)
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Check department filter
      if (!selectedDepartments.includes(task.departmentId)) {
        return false;
      }

      // Check strategic level filter
      const importance = task.strategicImportance;
      const matchesLevel = selectedLevels.some((levelId) => {
        const level = STRATEGIC_LEVELS.find((l) => l.id === levelId);
        if (!level) return false;
        return importance >= level.range[0] && importance <= level.range[1];
      });

      return matchesLevel;
    });
  }, [tasks, selectedDepartments, selectedLevels]);

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
          <h2 className="text-2xl font-bold text-foreground">درخت استراتژیک</h2>
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          تجسم سه‌بعدی رشد سازمانی - هر برگ نماد یک دستاورد استراتژیک است
        </p>
      </div>

      {/* 3D Scene Container */}
      <div className="relative h-[600px] rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a12]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mb-3" />
              <p className="text-muted-foreground text-sm" dir="rtl">در حال بارگذاری داده‌ها...</p>
            </div>
          </div>
        ) : (
          <LivingErdtreeScene tasks={filteredTasks} newTaskIds={newTaskIds} />
        )}
        <FilterControls
          selectedDepartments={selectedDepartments}
          selectedLevels={selectedLevels}
          onDepartmentChange={setSelectedDepartments}
          onLevelChange={setSelectedLevels}
        />
        <DepartmentLegend />
        <StrategicLegend />
        <ControlsHint />
        
        {/* Filtered count indicator */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#D4AF37]/30">
          <span className="text-xs text-muted-foreground" dir="rtl">
            نمایش{" "}
            <span className="text-[#D4AF37] font-bold">{filteredTasks.length}</span>
            {" "}از{" "}
            <span className="text-foreground">{tasks.length}</span>
            {" "}وظیفه
          </span>
        </div>
        
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
