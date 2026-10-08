"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  ChevronDown,
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
import type { IconKey, NavChild, NavLink } from "./nav-links";

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

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Uitklapbaar menu-item (bv. To do) met een eigen lijstje opties eronder. Staat open zodra
 * je op een van de onderliggende pagina's bent. */
function NavGroup({
  label,
  icon: Icon,
  items,
  pathname,
}: {
  label: string;
  icon: LucideIcon;
  items: NavChild[];
  pathname: string;
}) {
  const hasActiveChild = items.some((item) => isActive(pathname, item.href));
  const [open, setOpen] = useState(hasActiveChild);
  const expanded = open || hasActiveChild;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!expanded)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          hasActiveChild ? "text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
        {label}
        <ChevronDown
          className={cn("ml-auto size-4 transition-transform", expanded && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      {expanded && (
        <div className="mt-1 space-y-1 pl-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
          const Icon = ICONS[link.icon];

          if (link.children) {
            return (
              <NavGroup key={link.label} label={link.label} icon={Icon} items={link.children} pathname={pathname} />
            );
          }

          const active = isActive(pathname, link.href);
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
