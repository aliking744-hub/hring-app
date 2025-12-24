import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`glass-card rounded-xl p-5 ${className}`}>
      <h3 className="text-base font-semibold text-foreground mb-4 text-center">{title}</h3>
      {children}
    </div>
  );
}
