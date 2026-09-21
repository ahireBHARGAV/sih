import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

interface TopNavProps {
  role: string;
  items: NavItem[];
  className?: string;
}

export function TopNav({ role, items, className }: TopNavProps) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-glass-border bg-glass-bg backdrop-blur-[20px]", className)}>
      <div className="mx-auto max-w-[1440px] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <h2 className="font-display font-bold text-xl text-ink-900 tracking-tight">ASCEND</h2>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-600 px-2 py-1 bg-white/55 rounded-full border border-glass-border">{role}</span>
        </div>
        <nav className="flex items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                item.isActive
                  ? "bg-primary text-white"
                  : "text-ink-600 hover:bg-white/55 hover:text-ink-900"
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
