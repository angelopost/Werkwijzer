"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLink } from "./nav-links";

export function Sidebar({
  links,
  userName,
  roleLabel,
}: {
  links: NavLink[];
  userName: string;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <span className="text-lg font-semibold tracking-tight">Werkwijzer</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 text-sm">
        <p className="font-medium">{userName}</p>
        <p className="text-muted-foreground">{roleLabel}</p>
      </div>
    </aside>
  );
}
