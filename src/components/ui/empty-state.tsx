import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-[28px] border border-glass-border bg-white/40", className)}>
      {icon && <div className="mb-6 text-ink-600">{icon}</div>}
      <h3 className="text-2xl font-display font-semibold text-ink-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-ink-600 mb-8 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
