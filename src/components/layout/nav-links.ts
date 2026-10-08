export type IconKey =
  | "calendar"
  | "check"
  | "users"
  | "clock"
  | "file"
  | "timer"
  | "todo"
  | "workshop";

export type NavLink = { href: string; label: string; icon: IconKey };

export const ADMIN_NAV: NavLink[] = [
  { href: "/rooster", label: "Rooster", icon: "calendar" },
  { href: "/inklokken", label: "Inklokken", icon: "timer" },
  { href: "/medewerkers", label: "Medewerkers", icon: "users" },
  { href: "/uren", label: "Uren", icon: "clock" },
  { href: "/todo", label: "To do", icon: "todo" },
  { href: "/todo-medewerkers", label: "To do medewerkers", icon: "todo" },
  { href: "/workshops", label: "Workshops", icon: "workshop" },
];

export const STAFF_NAV: NavLink[] = [
  { href: "/mijn-rooster", label: "Mijn rooster", icon: "calendar" },
  { href: "/mijn-inklok", label: "Inklokken", icon: "timer" },
  { href: "/mijn-uren", label: "Mijn uren", icon: "clock" },
  { href: "/mijn-to-do", label: "To do", icon: "todo" },
  { href: "/verlof", label: "Verlof", icon: "file" },
];
