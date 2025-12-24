import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'cyan' | 'pink' | 'purple' | 'orange' | 'yellow' | 'green';
}

const colorClasses = {
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const iconBgClasses = {
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export function KPICard({ title, value, icon: Icon, color }: KPICardProps) {
  return (
    <div className={`glass-card rounded-xl p-4 border ${colorClasses[color]} transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className="w-6 h-6 text-background" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>
      </div>
    </div>
  );
}
