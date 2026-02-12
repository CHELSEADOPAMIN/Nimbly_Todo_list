"use client";

import { Home, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types/auth";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  className?: string;
}

const getAvatarFallback = (user: User | null) => {
  if (!user) {
    return "N";
  }

  const pair = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim();
  if (pair) {
    return pair.toUpperCase();
  }

  return user.username[0]?.toUpperCase() ?? "N";
};

export const Sidebar = ({ user, onLogout, className }: SidebarProps) => {
  const avatarFallback = getAvatarFallback(user);

  return (
    <aside
      className={cn(
        "flex w-16 flex-col items-center gap-6 border-r border-[rgb(222_216_207_/_0.3)] bg-[rgb(240_235_229)] py-6",
        className,
      )}
      aria-label="Primary sidebar"
    >
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[rgb(93_112_82_/_0.3)] bg-[rgb(93_112_82_/_0.12)] text-sm font-bold text-primary">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          avatarFallback
        )}
      </div>

      <nav className="flex w-full flex-col items-center gap-3" aria-label="Workspace shortcuts">
        <button
          type="button"
          aria-label="Home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(93_112_82_/_0.12)] text-primary transition-colors duration-200"
        >
          <Home size={20} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Sign out"
        onClick={onLogout}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(168_84_72_/_0.2)] bg-[rgb(168_84_72_/_0.08)] text-destructive transition-all duration-200 hover:bg-[rgb(168_84_72_/_0.14)] active:scale-95"
      >
        <LogOut size={20} aria-hidden="true" />
      </button>
    </aside>
  );
};
