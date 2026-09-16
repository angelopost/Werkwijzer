"use client";

import { usePathname } from "next/navigation";
import type { NavLink } from "./nav-links";

export function HeaderTitle({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const active = links.find((link) => pathname.startsWith(link.href));

  return <h1 className="text-lg font-semibold">{active?.label ?? "Werkwijzer"}</h1>;
}
