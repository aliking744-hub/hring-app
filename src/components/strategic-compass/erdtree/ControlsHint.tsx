import { MousePointer2, Move, ZoomIn } from "lucide-react";

const ControlsHint = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-3" dir="rtl">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Move className="w-3 h-3" />
          <span>چرخش</span>
        </div>
        <div className="flex items-center gap-1">
          <ZoomIn className="w-3 h-3" />
          <span>زوم</span>
        </div>
        <div className="flex items-center gap-1">
          <MousePointer2 className="w-3 h-3" />
          <span>جزئیات</span>
        </div>
      </div>
    </div>
  );
};

export default ControlsHint;
