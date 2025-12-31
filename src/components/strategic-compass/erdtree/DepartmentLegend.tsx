import { DEPARTMENTS, SAMPLE_TASKS } from "./types";

const DepartmentLegend = () => {
  // Calculate task count per department
  const departmentStats = DEPARTMENTS.map(dept => ({
    ...dept,
    count: SAMPLE_TASKS.filter(t => t.departmentId === dept.id).length,
  })).sort((a, b) => b.count - a.count);

  const totalTasks = SAMPLE_TASKS.length;

  return (
    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-4" dir="rtl">
      <h3 className="text-sm font-bold text-[#D4AF37] mb-3">توزیع بخش‌ها</h3>
      <div className="space-y-2">
        {departmentStats.map(dept => (
          <div key={dept.id} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{
                backgroundColor: dept.color,
                boxShadow: `0 0 10px ${dept.color}`,
              }}
            />
            <span className="text-xs text-foreground flex-1">{dept.name}</span>
            <span className="text-xs text-muted-foreground">
              {dept.count} ({Math.round((dept.count / totalTasks) * 100)}%)
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[#D4AF37]/20">
        <p className="text-xs text-muted-foreground">
          مجموع: <span className="text-[#D4AF37]">{totalTasks}</span> وظیفه
        </p>
      </div>
    </div>
  );
};

export default DepartmentLegend;
