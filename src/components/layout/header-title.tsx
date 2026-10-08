"use client";

import { usePathname } from "next/navigation";
import type { NavLink } from "./nav-links";

export function HeaderTitle({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const active =
    links.flatMap((link) => link.children ?? []).find((child) => matches(child.href)) ??
    links.find((link) => !link.children && matches(link.href));

  return <h1 className="text-lg font-semibold">{active?.label ?? "Werkwijzer"}</h1>;
}
