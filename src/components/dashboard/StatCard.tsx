import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
}

const variants = {
  default: 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 hover:border-gray-700',
  primary: 'bg-gradient-to-br from-blue-900/40 via-blue-900/20 to-blue-900/40 border-blue-800 hover:border-blue-600',
  accent: 'bg-gradient-to-br from-purple-900/40 via-purple-900/20 to-purple-900/40 border-purple-800 hover:border-purple-600',
  success: 'bg-gradient-to-br from-emerald-900/40 via-emerald-900/20 to-emerald-900/40 border-emerald-800 hover:border-emerald-600',
  warning: 'bg-gradient-to-br from-amber-900/40 via-amber-900/20 to-amber-900/40 border-amber-800 hover:border-amber-600',
};

const iconVariants = {
  default: 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-300 shadow-lg',
  primary: 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30',
  accent: 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30',
  success: 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30',
  warning: 'bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30',
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
      "backdrop-blur-sm",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 font-serif text-4xl font-bold text-white">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                trend.isPositive 
                  ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800"
                  : "bg-red-900/50 text-red-300 border border-red-800"
              )}>
                {trend.isPositive ? (
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl",
          "transform transition-transform duration-300 hover:scale-110",
          iconVariants[variant]
        )}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}