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
    <aside className={cn("hidden w-64 shrink-0 flex-col bg-sidebar md:flex", className)}>
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarRange className="size-4.5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-foreground">Werkwijzer</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = ICONS[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon className="size-4" strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-sidebar-border p-4">
        <UserAvatar name={userName} />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-foreground">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>
    </aside>
  );
}
