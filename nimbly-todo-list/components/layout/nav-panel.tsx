"use client";

import { History, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TodoView } from "@/lib/types/todo";

interface NavPanelProps {
  workspaceTitle: string;
  view: TodoView;
  todayCount: number;
  historyCount: number;
  onViewChange: (nextView: TodoView) => void;
  className?: string;
}

const navItems: Array<{
  id: TodoView;
  label: string;
  icon: typeof Sun;
}> = [
  { id: "today", label: "Today", icon: Sun },
  { id: "history", label: "History", icon: History },
];

export const NavPanel = ({
  workspaceTitle,
  view,
  todayCount,
  historyCount,
  onViewChange,
  className,
}: NavPanelProps) => {
  return (
    <aside
      className={cn(
        "flex w-52 flex-col border-r border-[rgb(222_216_207_/_0.3)] bg-background px-3 py-6",
        className,
      )}
      aria-label="Todo views"
    >
      <h2 className="px-2 text-lg font-bold text-foreground">{workspaceTitle}</h2>

      <nav className="mt-6 space-y-1" aria-label="Todo filters">
        {navItems.map((item) => {
          const isActive = view === item.id;
          const count = item.id === "today" ? todayCount : historyCount;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[rgb(93_112_82_/_0.3)]",
                isActive
                  ? "bg-[rgb(93_112_82_/_0.1)] text-primary"
                  : "text-foreground hover:bg-muted",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
              <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[rgb(93_112_82_/_0.1)] px-1.5 text-[11px] font-semibold text-primary">
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
