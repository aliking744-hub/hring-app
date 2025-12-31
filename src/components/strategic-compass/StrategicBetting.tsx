import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface Props {
  userRole: 'ceo' | 'deputy' | 'manager' | null;
}

const StrategicBetting = ({ userRole }: Props) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Coins className="w-6 h-6 text-primary" />
          شرط‌بندی استراتژیک
        </h2>
        <p className="text-muted-foreground mt-2">تخصیص منابع به اهداف استراتژیک</p>
      </div>
    </div>
  );
};

export default StrategicBetting;
