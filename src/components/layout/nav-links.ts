export type IconKey = "calendar" | "check" | "users" | "clock" | "file" | "timer";

export type NavLink = { href: string; label: string; icon: IconKey };

export const ADMIN_NAV: NavLink[] = [
  { href: "/rooster", label: "Rooster", icon: "calendar" },
  { href: "/inklokken", label: "Inklokken", icon: "timer" },
  { href: "/goedkeuringen", label: "Goedkeuringen", icon: "check" },
  { href: "/medewerkers", label: "Medewerkers", icon: "users" },
  { href: "/uren", label: "Uren", icon: "clock" },
];

export const STAFF_NAV: NavLink[] = [
  { href: "/mijn-rooster", label: "Mijn rooster", icon: "calendar" },
  { href: "/mijn-inklok", label: "Inklokken", icon: "timer" },
  { href: "/verlof", label: "Verlof", icon: "file" },
];
