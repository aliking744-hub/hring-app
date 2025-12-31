import { DEPARTMENTS } from "./types";
import { Filter, Layers, Clock } from "lucide-react";

interface FilterControlsProps {
  selectedDepartments: string[];
  selectedLevels: string[];
  showExpired: boolean;
  onDepartmentChange: (departments: string[]) => void;
  onLevelChange: (levels: string[]) => void;
  onExpiredChange: (show: boolean) => void;
}

const STRATEGIC_LEVELS = [
  { id: "visionary", name: "چشم‌اندازی (۸-۱۰)", range: [8, 10] },
  { id: "strategic", name: "استراتژیک (۵-۷)", range: [5, 7] },
  { id: "operational", name: "عملیاتی (۱-۴)", range: [1, 4] },
];

const FilterControls = ({
  selectedDepartments,
  selectedLevels,
  showExpired,
  onDepartmentChange,
  onLevelChange,
  onExpiredChange,
}: FilterControlsProps) => {
  const toggleDepartment = (deptId: string) => {
    if (selectedDepartments.includes(deptId)) {
      onDepartmentChange(selectedDepartments.filter((id) => id !== deptId));
    } else {
      onDepartmentChange([...selectedDepartments, deptId]);
    }
  };

  const toggleLevel = (levelId: string) => {
    if (selectedLevels.includes(levelId)) {
      onLevelChange(selectedLevels.filter((id) => id !== levelId));
    } else {
      onLevelChange([...selectedLevels, levelId]);
    }
  };

  const selectAllDepartments = () => {
    onDepartmentChange(DEPARTMENTS.map((d) => d.id));
  };

  const selectAllLevels = () => {
    onLevelChange(STRATEGIC_LEVELS.map((l) => l.id));
  };

  return (
    <div
      className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-md rounded-xl border border-[#D4AF37]/30 p-4 max-w-[280px]"
      dir="rtl"
    >
      {/* Department Filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-bold text-foreground">بخش‌ها</span>
          </div>
          <button
            onClick={selectAllDepartments}
            className="text-xs text-[#D4AF37] hover:underline"
          >
            همه
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => toggleDepartment(dept.id)}
              className={`px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
                selectedDepartments.includes(dept.id)
                  ? "border-transparent text-background"
                  : "border-border/50 text-muted-foreground bg-transparent hover:border-border"
              }`}
              style={{
                backgroundColor: selectedDepartments.includes(dept.id)
                  ? dept.color
                  : undefined,
                boxShadow: selectedDepartments.includes(dept.id)
                  ? `0 0 10px ${dept.color}50`
                  : undefined,
              }}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Strategic Level Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-bold text-foreground">سطح استراتژیک</span>
          </div>
          <button
            onClick={selectAllLevels}
            className="text-xs text-[#D4AF37] hover:underline"
          >
            همه
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {STRATEGIC_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => toggleLevel(level.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 text-right ${
                selectedLevels.includes(level.id)
                  ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                  : "border-border/50 text-muted-foreground bg-transparent hover:border-border"
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expired Tasks Toggle */}
      <div className="mb-4">
        <button
          onClick={() => onExpiredChange(!showExpired)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
            showExpired
              ? "border-red-400/50 bg-red-400/20 text-red-400"
              : "border-border/50 text-muted-foreground bg-transparent hover:border-border"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>تسک‌های منقضی</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded ${showExpired ? 'bg-red-400/30' : 'bg-muted'}`}>
            {showExpired ? 'نمایش' : 'مخفی'}
          </span>
        </button>
      </div>

      {/* Active filter count */}
      <div className="pt-3 border-t border-border/30 text-center">
        <span className="text-xs text-muted-foreground">
          فیلتر فعال:{" "}
          <span className="text-[#D4AF37] font-bold">
            {selectedDepartments.length} بخش، {selectedLevels.length} سطح
          </span>
        </span>
      </div>
    </div>
  );
};

export { STRATEGIC_LEVELS };
export default FilterControls;
