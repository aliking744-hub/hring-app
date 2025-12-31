import { SAMPLE_TASKS } from "./types";

const StrategicLegend = () => {
  // Calculate task count per strategic level
  const levels = [
    { name: "چشم‌اندازی", range: "8-10", min: 8, max: 10, position: "بالا" },
    { name: "استراتژیک", range: "5-7", min: 5, max: 7, position: "میانه" },
    { name: "عملیاتی", range: "1-4", min: 1, max: 4, position: "پایه" },
  ];

  const levelStats = levels.map(level => ({
    ...level,
    count: SAMPLE_TASKS.filter(
      t => t.strategicImportance >= level.min && t.strategicImportance <= level.max
    ).length,
  }));

  const totalTasks = SAMPLE_TASKS.length;

  return (
    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-4" dir="rtl">
      <h3 className="text-sm font-bold text-[#D4AF37] mb-3">سطوح استراتژیک</h3>
      <div className="space-y-2">
        {levelStats.map((level, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-2 h-4 rounded"
              style={{
                background: `linear-gradient(to top, #D4AF37 ${(level.count / totalTasks) * 100}%, #333 ${(level.count / totalTasks) * 100}%)`,
              }}
            />
            <div className="flex-1">
              <span className="text-xs text-foreground">{level.name}</span>
              <span className="text-xs text-muted-foreground mr-1">({level.range})</span>
            </div>
            <span className="text-xs text-muted-foreground">{level.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[#D4AF37]/20 text-xs text-muted-foreground">
        <p>🔍 درخت متعادل = سازمان سالم</p>
      </div>
    </div>
  );
};

export default StrategicLegend;
