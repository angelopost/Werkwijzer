"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  CalendarDays,
  ClipboardCheck,
  Users,
  Clock,
  FileText,
  Timer,
  ListTodo,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { IconKey, NavLink } from "./nav-links";

const ICONS: Record<IconKey, LucideIcon> = {
  calendar: CalendarDays,
  check: ClipboardCheck,
  users: Users,
  clock: Clock,
  file: FileText,
  timer: Timer,
  todo: ListTodo,
  workshop: PartyPopper,
};

export function Sidebar({
  links,
  userName,
  roleLabel,
  className,
}: {
  links: NavLink[];
  userName: string;
  roleLabel: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden w-64 shrink-0 flex-col bg-black text-white md:flex", className)}>
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarRange className="size-4.5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">Werkwijzer</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = ICONS[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-white/15 p-4">
        <UserAvatar name={userName} />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-white">{userName}</p>
          <p className="truncate text-xs text-zinc-400">{roleLabel}</p>
        </div>
      </div>
    </aside>
  );
}
