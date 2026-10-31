import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "danger" | "warn" | "neutral" | "success";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "neutral",
}: StatCardProps) {
  const borderStyles = {
    danger: "border-error/30 hover:border-error/50 bg-error/5",
    warn: "border-warning/30 hover:border-warning/50 bg-warning/5",
    neutral: "border-base-300 hover:border-base-content/20 bg-base-200/50",
    success: "border-success/30 hover:border-success/50 bg-success/5",
  }[variant];

  const textStyles = {
    danger: "text-error",
    warn: "text-warning",
    neutral: "text-base-content",
    success: "text-success",
  }[variant];

  return (
    <div
      className={`card card-border relative overflow-hidden p-3.5 sm:p-5 transition-all duration-200 backdrop-blur-sm ${borderStyles}`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50 truncate">
          {title}
        </span>
        <div className="rounded-lg p-1.5 sm:p-2 bg-base-300/60 text-base-content/70 shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-2.5 sm:mt-3">
        <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums ${textStyles}`}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-base-content/40 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
