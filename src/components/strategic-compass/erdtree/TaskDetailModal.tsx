import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task, DEPARTMENTS } from "./types";
import { Calendar, User, Building2, Star, Clock } from "lucide-react";
import { format } from "date-fns-jalali";

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

const TaskDetailModal = ({ task, open, onClose }: TaskDetailModalProps) => {
  if (!task) return null;

  const department = DEPARTMENTS.find(d => d.id === task.departmentId);
  const color = department?.color || "#D4AF37";

  const now = new Date();
  const daysSinceCompletion = Math.floor(
    (now.getTime() - task.completedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysSinceCompletion > 30;

  const getImportanceLabel = (importance: number) => {
    if (importance >= 8) return "چشم‌اندازی";
    if (importance >= 5) return "تاکتیکی";
    return "عملیاتی";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {task.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Owner */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">مسئول</p>
              <p className="font-medium">{task.ownerName}</p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Building2 className="w-5 h-5" style={{ color }} />
            <div>
              <p className="text-xs text-muted-foreground">دپارتمان</p>
              <p className="font-medium" style={{ color }}>
                {task.departmentName}
              </p>
            </div>
          </div>

          {/* Strategic Importance */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Star className="w-5 h-5 text-[#D4AF37]" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">اهمیت استراتژیک</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-[#D4AF37]">
                  {task.strategicImportance} از ۱۰
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                  {getImportanceLabel(task.strategicImportance)}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Date */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">تاریخ تکمیل</p>
              <p className="font-medium">
                {format(task.completedAt, "yyyy/MM/dd")}
              </p>
            </div>
          </div>

          {/* Days since completion */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">زمان سپری شده</p>
              <p className="font-medium">
                {daysSinceCompletion} روز از تکمیل گذشته
              </p>
            </div>
          </div>

          {/* Status badge */}
          {isExpired ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
              <p className="text-red-400 text-sm font-medium">
                ⚠️ این وظیفه منقضی شده و روی زمین افتاده است
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-center">
              <p className="text-[#D4AF37] text-sm font-medium">
                ✨ وظیفه فعال روی درخت
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
